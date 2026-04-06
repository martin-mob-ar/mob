"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Mail } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnimateHeight } from "@/components/ui/animate-height";
import { useAuth } from "@/contexts/AuthContext";
import { useTokkoSync } from "@/hooks/useTokkoSync";

import AccountTypeSelector from "@/components/profile/AccountTypeSelector";


type AuthStep = "initial" | "password" | "register-inmobiliaria" | "select-account-type" | "check-email";

/** Only allow relative-path redirects (blocks open redirect to external sites). */
function isSafeRedirect(url: string): boolean {
  return url.startsWith("/") && !url.startsWith("//");
}

const GUEST_STORAGE_KEY = "mob_guest_contact";

async function applyGuestContactToProfile() {
  try {
    const raw = localStorage.getItem(GUEST_STORAGE_KEY);
    if (!raw) return;
    const guest = JSON.parse(raw);
    if (!guest?.name && !guest?.phone) return;
    await fetch("/api/users/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: guest.name || undefined,
        telefono: guest.phone || undefined,
        telefono_country_code: guest.country_code || undefined,
      }),
    });
  } catch {
    // non-critical — ignore
  }
}

const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const AuthModal = () => {
  const { isAuthModalOpen, closeAuthModal, openAuthModal, login, register, authError, clearError, isAuthenticated, isLoading, refreshUser } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Auto-open modal when ?auth=open is present (e.g., from /login redirect)
  // Skip if already authenticated (prevents re-opening after login while URL updates)
  useEffect(() => {
    if (searchParams.get("auth") === "open" && !isLoading) {
      if (!isAuthenticated && !isAuthModalOpen) {
        openAuthModal();
      } else if (isAuthenticated) {
        // Already logged in — clean auth/redirect params from URL
        const params = new URLSearchParams(searchParams.toString());
        // Fallback to window.location — useSearchParams() may lag behind router.replace()
        const redirectTo = params.get("redirect")
          || new URLSearchParams(window.location.search).get("redirect");
        params.delete("auth");
        params.delete("redirect");
        const newQuery = params.toString();
        if (redirectTo && isSafeRedirect(redirectTo)) {
          router.push(redirectTo);
          router.refresh();
        } else {
          router.replace(`${pathname}${newQuery ? `?${newQuery}` : ""}`, { scroll: false });
        }
      }
    }
  }, [searchParams, isAuthModalOpen, openAuthModal, isAuthenticated, isLoading, pathname, router]);

  // Auto-open account type selector for new Google sign-ups
  useEffect(() => {
    if (searchParams.get("select_account_type") === "true" && isAuthenticated && !isLoading) {
      setStep("select-account-type");
      openAuthModal();
      // Apply guest contact profile (same as email registration)
      applyGuestContactToProfile();
      // Claim guest leads
      fetch("/api/leads/claim", { method: "POST" }).catch(() => {});
      // Clean the param from URL
      const params = new URLSearchParams(searchParams.toString());
      params.delete("select_account_type");
      const newQuery = params.toString();
      router.replace(`${pathname}${newQuery ? `?${newQuery}` : ""}`, { scroll: false });
    }
  }, [searchParams, isAuthenticated, isLoading, pathname, router, openAuthModal]);

  const { startSync } = useTokkoSync();
  const [step, setStep] = useState<AuthStep>("initial");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tokkoApiKey, setTokkoApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [isExistingUser, setIsExistingUser] = useState<boolean | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const displayError = localError || authError;

  const resetForm = () => {
    setStep("initial");
    setEmail("");
    setPassword("");
    setTokkoApiKey("");
    setIsExistingUser(null);
    setLocalError(null);
    clearError();
  };

  const goBackToInitial = () => {
    setStep("initial");
    setPassword("");
    setIsExistingUser(null);
    setLocalError(null);
    clearError();
  };

  const handleClose = () => {
    closeAuthModal();
    resetForm();
    // Remove ?auth=open and ?redirect from URL if present
    if (searchParams.get("auth") === "open" || searchParams.get("redirect")) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("auth");
      params.delete("redirect");
      const newQuery = params.toString();
      router.replace(`${pathname}${newQuery ? `?${newQuery}` : ""}`, { scroll: false });
    }
  };

  const handleEmailContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLocalError(null);
    clearError();
    try {
      const res = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLocalError("Error al verificar el email. Intentá de nuevo.");
        return;
      }
      setIsExistingUser(data.exists);
      setStep("password");
    } catch {
      setLocalError("Error de conexión. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (isExistingUser) {
      // Login flow
      try {
        await login(email, password);
        // Read from window.location as fallback — useSearchParams() may lag behind router.replace()
        const redirectTo = searchParams.get("redirect")
          || new URLSearchParams(window.location.search).get("redirect");
        if (redirectTo && isSafeRedirect(redirectTo)) {
          closeAuthModal();
          resetForm();
          router.push(redirectTo);
          router.refresh();
        } else {
          handleClose();
          router.refresh();
        }
      } catch {
        // Error is set in AuthContext
      } finally {
        setLoading(false);
      }
    } else {
      // Register flow
      try {
        const { confirmed } = await register(email, password, false);
        if (confirmed) {
          await applyGuestContactToProfile();
          // Claim guest leads
          fetch("/api/leads/claim", { method: "POST" }).catch(() => {});
          // Auto-infer account type from landing page or redirect destination
          // Read from window.location as fallback — useSearchParams() may lag behind router.replace()
          const redirectTo = searchParams.get("redirect")
            || new URLSearchParams(window.location.search).get("redirect");
          const inferredType = pathname === "/propietarios" ? 2
            : pathname === "/subir-propiedad" ? 2
            : pathname === "/inmobiliarias" ? 3
            : redirectTo?.startsWith("/verificate") ? 1
            : null;
          if (inferredType) {
            // Close modal and navigate first, then set account type in background.
            // This prevents the modal from staying open if subsequent calls fail.
            closeAuthModal();
            resetForm();
            router.push(redirectTo || "/perfil");
            router.refresh();
            // Fire-and-forget: set account type + refresh user in background
            fetch("/api/users/account-type", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ account_type: inferredType }),
            })
              .then(() => refreshUser())
              .catch(() => {});
          } else {
            setStep("select-account-type");
          }
        } else {
          setStep("check-email");
        }
      } catch {
        // Error is set in AuthContext
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSelectAccountType = async (accountTypeId: number) => {
    setLoading(true);
    try {
      await fetch("/api/users/account-type", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account_type: accountTypeId }),
      });
      // Refresh AuthContext so isOwner and accountType reflect the new value
      await refreshUser();
      // Read from window.location as fallback — useSearchParams() may lag behind router.replace()
      const redirectTo = searchParams.get("redirect")
        || new URLSearchParams(window.location.search).get("redirect");
      if (redirectTo && isSafeRedirect(redirectTo)) {
        closeAuthModal();
        resetForm();
        router.push(redirectTo);
        router.refresh();
      } else {
        handleClose();
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSkipAccountType = async () => {
    // Refresh AuthContext to pick up any DB changes from signup
    await refreshUser();
    // Read from window.location as fallback — useSearchParams() may lag behind router.replace()
    const redirectTo = searchParams.get("redirect")
      || new URLSearchParams(window.location.search).get("redirect");
    if (redirectTo && isSafeRedirect(redirectTo)) {
      closeAuthModal();
      resetForm();
      router.push(redirectTo);
      router.refresh();
    } else {
      handleClose();
      router.refresh();
    }
  };

  const handleInmobiliariaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { confirmed } = await register(email, password, true);
      if (!confirmed) {
        // Email confirmation required — show check-email step
        setStep("check-email");
        return;
      }
      // Get the auth user ID to link with the public users row during sync
      const supabase = (await import("@/lib/supabase/client")).createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      // Auto-set account_type to inmobiliaria
      await fetch("/api/users/account-type", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account_type: 3 }),
      });
      handleClose();
      // Fire background sync + start polling toast, passing auth info
      startSync(tokkoApiKey, authUser?.id, authUser?.email || email);
    } catch {
      // Error is set in AuthContext
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Read from window.location as fallback — useSearchParams() may lag behind router.replace()
    const redirectTo = searchParams.get("redirect")
      || new URLSearchParams(window.location.search).get("redirect")
      || pathname;
    const state = encodeURIComponent(redirectTo);
    const redirectUri = `${window.location.origin}/api/auth/callback/google`;

    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      state,
      access_type: "offline",
      prompt: "select_account",
    });

    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  };

  return (
    <Dialog open={isAuthModalOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm p-6 gap-0">
        <DialogTitle className="sr-only">Autenticación</DialogTitle>

        {/* ── Initial step: Google + email ── */}
        <AnimateHeight show={step === "initial"}>
          <div className="space-y-5">
            <div className="text-center">
              <h2 className="font-display text-xl font-semibold text-foreground">
                Ingresá a tu cuenta
              </h2>
            </div>

            {displayError && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-xl text-center">
                {displayError}
              </div>
            )}

            <Button
              variant="outline"
              className="w-full h-11 rounded-xl font-medium justify-center gap-3"
              onClick={handleGoogleLogin}
            >
              <GoogleIcon />
              Continuar con Google
            </Button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-sm text-muted-foreground">o</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <form onSubmit={handleEmailContinue} className="space-y-4">
              <Input
                type="email"
                name="email"
                placeholder="Ingresá tu e-mail"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setLocalError(null); }}
                required
                autoComplete="email"
                spellCheck={false}
                className="h-11 rounded-xl"
              />
              <Button
                type="submit"
                className="w-full h-11 rounded-xl font-semibold"
                disabled={loading}
              >
                {loading ? "Verificando..." : "Continuar con e-mail"}
              </Button>
            </form>
          </div>
        </AnimateHeight>

        {/* ── Password step: login or register ── */}
        <AnimateHeight show={step === "password"}>
          <div className="space-y-5">
            <div className="text-center">
              <h2 className="font-display text-xl font-semibold text-foreground">
                {isExistingUser ? "Ingresá tu contraseña" : "Creá tu contraseña"}
              </h2>
            </div>

            {authError && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-xl text-center">
                {authError}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="flex items-center gap-2">
                <Input
                  type="email"
                  value={email}
                  disabled
                  className="h-11 rounded-xl flex-1 opacity-60"
                />
                <button
                  type="button"
                  onClick={goBackToInitial}
                  className="text-sm text-primary hover:underline font-medium shrink-0"
                >
                  Cambiar
                </button>
              </div>

              <Input
                type="password"
                name="password"
                placeholder={isExistingUser ? "Contraseña" : "Creá una contraseña"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={isExistingUser ? "current-password" : "new-password"}
                className="h-11 rounded-xl"
              />

              <Button
                type="submit"
                className="w-full h-11 rounded-xl font-semibold"
                disabled={loading}
              >
                {loading
                  ? (isExistingUser ? "Entrando..." : "Creando cuenta...")
                  : (isExistingUser ? "Entrar" : "Crear cuenta")
                }
              </Button>
            </form>

            <div className="text-center">
              <button
                type="button"
                onClick={goBackToInitial}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Volver
              </button>
            </div>
          </div>
        </AnimateHeight>

        {/* ── Inmobiliaria registration ── */}
        <AnimateHeight show={step === "register-inmobiliaria"}>
          <div className="space-y-5">
            <div className="text-center">
              <h2 className="font-display text-xl font-semibold text-foreground">
                Registro inmobiliaria
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Conectá tu cuenta de Tokko Broker
              </p>
            </div>

            {authError && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-xl text-center">
                {authError}
              </div>
            )}

            <form onSubmit={handleInmobiliariaSubmit} className="space-y-4">
              <Input
                type="email"
                name="email"
                placeholder="Ingresá tu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                spellCheck={false}
                className="h-11 rounded-xl"
              />
              <Input
                type="password"
                name="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="h-11 rounded-xl"
              />
              <Input
                type="text"
                name="tokkoApiKey"
                placeholder="Tokko API Key"
                value={tokkoApiKey}
                onChange={(e) => setTokkoApiKey(e.target.value)}
                required
                autoComplete="off"
                className="h-11 rounded-xl font-mono text-sm"
              />

              <Button
                type="submit"
                className="w-full h-11 rounded-xl font-semibold"
                disabled={loading}
              >
                {loading ? "Creando cuenta..." : "Crear cuenta y sincronizar"}
              </Button>
            </form>

            <div className="text-center">
              <button
                type="button"
                onClick={() => { goBackToInitial(); }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Volver
              </button>
            </div>
          </div>
        </AnimateHeight>

        {/* ── Check email confirmation ── */}
        <AnimateHeight show={step === "check-email"}>
          <div className="space-y-5">
            <div className="flex justify-center">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-7 w-7 text-primary" />
              </div>
            </div>
            <div className="text-center">
              <h2 className="font-display text-xl font-semibold text-foreground">
                Revisá tu email
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                Te enviamos un email de confirmación a{" "}
                <span className="font-medium text-foreground">{email}</span>.
                Revisá tu bandeja de entrada para activar tu cuenta.
              </p>
            </div>
            <Button
              onClick={handleClose}
              className="w-full h-11 rounded-xl font-semibold"
            >
              Entendido
            </Button>
            <div className="text-center">
              <button
                type="button"
                onClick={goBackToInitial}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Volver al inicio
              </button>
            </div>
          </div>
        </AnimateHeight>

        {/* ── Account type selection ── */}
        <AnimateHeight show={step === "select-account-type"}>
          <div className="space-y-5">
            <div className="text-center">
              <h2 className="font-display text-xl font-semibold text-foreground">
                ¿Cuál es tu tipo de cuenta?
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Esto nos ayuda a personalizar tu experiencia
              </p>
            </div>

            <AccountTypeSelector
              onSelect={handleSelectAccountType}
              loading={loading}
            />

            <div className="text-center">
              <button
                type="button"
                onClick={handleSkipAccountType}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Completar más tarde
              </button>
            </div>
          </div>
        </AnimateHeight>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
