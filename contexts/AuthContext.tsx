"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { translateAuthError } from "@/lib/auth/errors";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface User {
  email: string;
  name: string;
  phone: string;
  phoneCountryCode: string;
  isOwner: boolean;
  accountType: number | null;
  publicUserId: string | null;
  isVerified: boolean;
}

/** Exported so layout.tsx can build the same shape server-side. */
export type InitialAuthUser = User;

type PublicUser = {
  id: string;
  name: string | null;
  telefono: string | null;
  telefono_country_code: string | null;
  last_verification_date: string | null;
  account_type: number | null;
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  isLoading: boolean;
  authError: string | null;
  authExpired: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, isOwner: boolean) => Promise<{ confirmed: boolean }>;
  logout: () => Promise<void>;
  clearError: () => void;
  clearAuthExpired: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapSupabaseUser(
  supabaseUser: SupabaseUser,
  publicUser?: PublicUser | null
): User {
  return {
    email: supabaseUser.email || "",
    name:
      publicUser?.name ||
      supabaseUser.user_metadata?.name ||
      supabaseUser.email?.split("@")[0] ||
      "",
    phone: publicUser?.telefono || "",
    phoneCountryCode: publicUser?.telefono_country_code || "+54",
    // Derive isOwner from DB account_type (3 = inmobiliaria, 4 = red inmobiliaria), fall back to signup metadata
    isOwner: publicUser
      ? publicUser.account_type === 3 || publicUser.account_type === 4
      : (supabaseUser.user_metadata?.isOwner ?? false),
    accountType: publicUser?.account_type ?? null,
    publicUserId: publicUser?.id ?? null,
    isVerified: !!publicUser?.last_verification_date,
  };
}

interface AuthProviderProps {
  children: ReactNode;
  /** Server-resolved user passed from layout.tsx to avoid hydration skeleton flash. */
  initialUser?: InitialAuthUser | null;
}

export const AuthProvider = ({ children, initialUser = null }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(initialUser);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  // When server already resolved the user, skip the loading state entirely.
  const [isLoading, setIsLoading] = useState(!initialUser);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authExpired, setAuthExpired] = useState(false);

  // createBrowserClient from @supabase/ssr is a singleton — safe to call in body.
  const supabase = createClient();

  // When login/register eagerly set user state, skip the next onAuthStateChange
  // event to avoid a redundant resolvePublicUser call + potential flicker.
  const skipNextAuthEventRef = useRef(false);
  // Safety net timeout to auto-clear the skip flag if it's never consumed.
  const skipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Background retry for publicUserId resolution when it fails initially.
  const publicUserRetryRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Resolve auth user → public users row (id + name).
  // Retries up to 3 times when result is null (handles DB trigger delay for new signups).
  const resolvePublicUser = useCallback(
    async (
      authId: string,
      maxAttempts = 3,
      delayMs = 500
    ): Promise<PublicUser | null> => {
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const { data } = await supabase
          .from("users")
          .select("id, name, telefono, telefono_country_code, last_verification_date, account_type")
          .eq("auth_id", authId)
          .maybeSingle();
        if (data) return data;
        // Only retry if there are attempts left
        if (attempt < maxAttempts - 1) {
          await new Promise((r) => setTimeout(r, delayMs * Math.pow(2, attempt)));
        }
      }
      return null;
    },
    [supabase]
  );

  // Resolve public user, set user state, and schedule a background retry
  // if publicUserId is null (handles DB trigger delay for new signups).
  const resolveAndSetUser = useCallback(
    async (supabaseUser: SupabaseUser) => {
      const publicUser = await resolvePublicUser(supabaseUser.id);
      setUser(mapSupabaseUser(supabaseUser, publicUser));

      // If publicUser is null, schedule a background retry
      if (!publicUser) {
        if (publicUserRetryRef.current) clearTimeout(publicUserRetryRef.current);
        publicUserRetryRef.current = setTimeout(async () => {
          try {
            const retryPublicUser = await resolvePublicUser(supabaseUser.id, 3, 1000);
            if (retryPublicUser) {
              setUser(mapSupabaseUser(supabaseUser, retryPublicUser));
            }
          } catch {
            // Still failed — user stays with publicUserId: null
          }
        }, 10000);
      }
    },
    [resolvePublicUser]
  );

  // Helper to set the skip flag with a safety-net timeout.
  const setSkipFlag = useCallback(() => {
    skipNextAuthEventRef.current = true;
    if (skipTimeoutRef.current) clearTimeout(skipTimeoutRef.current);
    skipTimeoutRef.current = setTimeout(() => {
      skipNextAuthEventRef.current = false;
      skipTimeoutRef.current = null;
    }, 5000);
  }, []);

  // Helper to consume (clear) the skip flag and its timeout.
  const consumeSkipFlag = useCallback(() => {
    skipNextAuthEventRef.current = false;
    if (skipTimeoutRef.current) {
      clearTimeout(skipTimeoutRef.current);
      skipTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    // 1. If the server already resolved the user via getAuthUser() in layout.tsx,
    //    skip the redundant getUser() network round-trip. The middleware already
    //    refreshed the session, so the server-provided initialUser is trustworthy.
    if (!initialUser) {
      // No server-side user — validate client-side (e.g., client-side navigation
      // that didn't go through the server, or unauthenticated initial load).
      supabase.auth
        .getUser()
        .then(async ({ data: { user: supabaseUser } }) => {
          try {
            if (supabaseUser) {
              await resolveAndSetUser(supabaseUser);
            } else {
              setUser(null);
            }
          } catch {
            // resolvePublicUser failed — still show as authenticated
            if (supabaseUser) {
              setUser(mapSupabaseUser(supabaseUser, null));
            }
          } finally {
            setIsLoading(false);
          }
        })
        .catch(() => {
          // getUser() rejected (network error, etc.) — clear loading state
          setIsLoading(false);
        });
    }
    // else: initialUser is already set in useState, isLoading starts as false.

    // 2. onAuthStateChange handles subsequent events (login, logout, token refresh).
    //    Skip INITIAL_SESSION to avoid racing with getUser() / initialUser above.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "INITIAL_SESSION") return;

      // Skip if login/register already eagerly set the user state
      if (skipNextAuthEventRef.current && (event === "SIGNED_IN" || event === "TOKEN_REFRESHED")) {
        consumeSkipFlag();
        return;
      }

      // Handle silent token refresh failure — session expired without feedback
      if (event === "TOKEN_REFRESHED" && !session) {
        setUser(null);
        setAuthExpired(true);
        return;
      }

      if (session?.user) {
        try {
          await resolveAndSetUser(session.user);
        } catch {
          // resolvePublicUser failed — still show as authenticated
          setUser(mapSupabaseUser(session.user, null));
        }
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
      if (skipTimeoutRef.current) clearTimeout(skipTimeoutRef.current);
      if (publicUserRetryRef.current) clearTimeout(publicUserRetryRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openAuthModal = useCallback(() => {
    setAuthError(null);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthError(null);
    setIsAuthModalOpen(false);
  }, []);

  const clearError = useCallback(() => setAuthError(null), []);
  const clearAuthExpired = useCallback(() => setAuthExpired(false), []);

  const claimGuestLeads = useCallback(() => {
    // Fire and forget — link any guest leads submitted with this email
    fetch("/api/leads/claim", { method: "POST" }).catch(() => {});
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      setAuthError(null);
      setSkipFlag();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        consumeSkipFlag();
        setAuthError(translateAuthError(error));
        throw error;
      }
      // Eagerly resolve and set user state BEFORE returning,
      // so callers see isAuthenticated = true immediately.
      if (data.user) {
        await resolveAndSetUser(data.user);
      }
      claimGuestLeads();
    },
    [supabase, resolveAndSetUser, claimGuestLeads, setSkipFlag, consumeSkipFlag]
  );

  const register = useCallback(
    async (email: string, password: string, isOwner: boolean): Promise<{ confirmed: boolean }> => {
      setAuthError(null);
      setSkipFlag();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { isOwner },
        },
      });
      if (error) {
        consumeSkipFlag();
        setAuthError(translateAuthError(error));
        throw error;
      }
      // If auto-confirmed (session exists), eagerly set user state
      if (data.session && data.user) {
        await resolveAndSetUser(data.user);
        claimGuestLeads();
        return { confirmed: true };
      }
      // Email confirmation required — user is NOT authenticated yet
      consumeSkipFlag();
      return { confirmed: false };
    },
    [supabase, resolveAndSetUser, claimGuestLeads, setSkipFlag, consumeSkipFlag]
  );

  const logout = useCallback(async () => {
    try {
      // Server-side signout clears cookies and revalidates RSC cache
      await fetch("/api/auth/signout", { method: "POST" }).catch(() => {});
      // Client-side signout clears local Supabase session state
      await supabase.auth.signOut();
    } finally {
      // Always clear state, even if signOut errored
      setUser(null);
      // Stay on current page unless it requires authentication
      const path = window.location.pathname;
      const isProtected =
        path.startsWith("/gestion") ||
        path.startsWith("/perfil") ||
        path.startsWith("/subir-propiedad") ||
        path.startsWith("/mis-busquedas");
      if (isProtected) {
        window.location.href = "/";
      } else {
        window.location.reload();
      }
    }
  }, [supabase]);

  const refreshUser = useCallback(async () => {
    const {
      data: { user: supabaseUser },
    } = await supabase.auth.getUser();
    if (supabaseUser) {
      await resolveAndSetUser(supabaseUser);
    }
  }, [supabase, resolveAndSetUser]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isAuthModalOpen,
      isLoading,
      authError,
      authExpired,
      openAuthModal,
      closeAuthModal,
      login,
      register,
      logout,
      clearError,
      clearAuthExpired,
      refreshUser,
    }),
    [
      user,
      isAuthModalOpen,
      isLoading,
      authError,
      authExpired,
      openAuthModal,
      closeAuthModal,
      login,
      register,
      logout,
      clearError,
      clearAuthExpired,
      refreshUser,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
