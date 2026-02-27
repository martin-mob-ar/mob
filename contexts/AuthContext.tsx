"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface User {
  email: string;
  name: string;
  phone: string;
  phoneArea: string;
  phoneCountryCode: string;
  isOwner: boolean;
  publicUserId: string | null;
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
  publicUser?: { id: string; name: string | null; telefono: string | null; telefono_area: string | null; telefono_country_code: string | null } | null
): User {
  return {
    email: supabaseUser.email || "",
    name:
      publicUser?.name ||
      supabaseUser.user_metadata?.name ||
      supabaseUser.email?.split("@")[0] ||
      "",
    phone: publicUser?.telefono || "",
    phoneArea: publicUser?.telefono_area || "",
    phoneCountryCode: publicUser?.telefono_country_code || "+54",
    isOwner: supabaseUser.user_metadata?.isOwner ?? false,
    publicUserId: publicUser?.id ?? null,
  };
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();

  const supabase = createClient();

  // Resolve auth user → public users row (id + name)
  const resolvePublicUser = async (authId: string): Promise<{ id: string; name: string | null; telefono: string | null; telefono_area: string | null; telefono_country_code: string | null } | null> => {
    const { data } = await supabase
      .from("users")
      .select("id, name, telefono, telefono_area, telefono_country_code")
      .eq("auth_id", authId)
      .maybeSingle();
    return data ?? null;
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getUser().then(async ({ data: { user: supabaseUser } }) => {
      if (supabaseUser) {
        const publicUser = await resolvePublicUser(supabaseUser.id);
        setUser(mapSupabaseUser(supabaseUser, publicUser));
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const publicUser = await resolvePublicUser(session.user.id);
        setUser(mapSupabaseUser(session.user, publicUser));
      } else {
        setUser(null);
      }
      setIsLoading(false);
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
      setAuthError(error.message);
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
      setAuthError(error.message);
      throw error;
    }
    claimGuestLeads();
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
    router.refresh();
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
