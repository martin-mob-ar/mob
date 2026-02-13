"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface User {
  email: string;
  name: string;
  isOwner: boolean;
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapSupabaseUser(supabaseUser: SupabaseUser): User {
  return {
    email: supabaseUser.email || "",
    name: supabaseUser.user_metadata?.name || supabaseUser.email?.split("@")[0] || "",
    isOwner: supabaseUser.user_metadata?.isOwner ?? false,
  };
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    supabase.auth.getUser().then(({ data: { user: supabaseUser } }) => {
      if (supabaseUser) {
        setUser(mapSupabaseUser(supabaseUser));
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(mapSupabaseUser(session.user));
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

  const login = async (email: string, password: string) => {
    setAuthError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthError(error.message);
      throw error;
    }
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
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
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
