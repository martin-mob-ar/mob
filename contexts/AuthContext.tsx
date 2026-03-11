"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { translateAuthError } from "@/lib/auth/errors";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface User {
  email: string;
  name: string;
  phone: string;
  phoneCountryCode: string;
  isOwner: boolean;
  publicUserId: string | null;
  isVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  isLoading: boolean;
  authError: string | null;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, isOwner: boolean) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapSupabaseUser(
  supabaseUser: SupabaseUser,
  publicUser?: { id: string; name: string | null; telefono: string | null; telefono_country_code: string | null; last_verification_date: string | null } | null
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
    isOwner: supabaseUser.user_metadata?.isOwner ?? false,
    publicUserId: publicUser?.id ?? null,
    isVerified: !!publicUser?.last_verification_date,
  };
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const supabase = createClient();

  // Resolve auth user → public users row (id + name)
  const resolvePublicUser = async (authId: string): Promise<{ id: string; name: string | null; telefono: string | null; telefono_country_code: string | null; last_verification_date: string | null } | null> => {
    const { data } = await supabase
      .from("users")
      .select("id, name, telefono, telefono_country_code, last_verification_date")
      .eq("auth_id", authId)
      .maybeSingle();
    return data ?? null;
  };

  useEffect(() => {
    // 1. getUser() handles the initial auth state (validates token server-side).
    //    This is the single path that sets isLoading to false on mount.
    supabase.auth.getUser().then(async ({ data: { user: supabaseUser } }) => {
      try {
        if (supabaseUser) {
          const publicUser = await resolvePublicUser(supabaseUser.id);
          setUser(mapSupabaseUser(supabaseUser, publicUser));
        }
      } catch {
        // resolvePublicUser failed — still show as authenticated
        if (supabaseUser) {
          setUser(mapSupabaseUser(supabaseUser, null));
        }
      } finally {
        setIsLoading(false);
      }
    }).catch(() => {
      // getUser() rejected (network error, etc.) — clear loading state
      setIsLoading(false);
    });

    // 2. onAuthStateChange handles subsequent events (login, logout, token refresh).
    //    Skip INITIAL_SESSION to avoid racing with getUser() above.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "INITIAL_SESSION") return;
      if (session?.user) {
        try {
          const publicUser = await resolvePublicUser(session.user.id);
          setUser(mapSupabaseUser(session.user, publicUser));
        } catch {
          // resolvePublicUser failed — still show as authenticated
          setUser(mapSupabaseUser(session.user, null));
        }
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const openAuthModal = () => {
    setAuthError(null);
    setIsAuthModalOpen(true);
  };
  const closeAuthModal = () => {
    setAuthError(null);
    setIsAuthModalOpen(false);
  };
  const clearError = () => setAuthError(null);

  const claimGuestLeads = () => {
    // Fire and forget — link any guest leads submitted with this email
    fetch('/api/leads/claim', { method: 'POST' }).catch(() => {});
  };

  const login = async (email: string, password: string) => {
    setAuthError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthError(translateAuthError(error));
      throw error;
    }
    claimGuestLeads();
  };

  const register = async (email: string, password: string, isOwner: boolean) => {
    setAuthError(null);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { isOwner },
      },
    });
    if (error) {
      setAuthError(translateAuthError(error));
      throw error;
    }
    claimGuestLeads();
  };

  const logout = async () => {
    await supabase.auth.signOut();
    // Full page reload clears all React state and the Next.js Router Cache.
    // router.push + router.refresh is unreliable because cached RSC payloads
    // may still contain authenticated data.
    window.location.href = "/";
  };

  const refreshUser = async () => {
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();
    if (supabaseUser) {
      const publicUser = await resolvePublicUser(supabaseUser.id);
      setUser(mapSupabaseUser(supabaseUser, publicUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAuthModalOpen,
        isLoading,
        authError,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        logout,
        clearError,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
