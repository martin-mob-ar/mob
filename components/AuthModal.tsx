"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useTokkoSync } from "@/hooks/useTokkoSync";
import { Building2 } from "lucide-react";

const COUNTRY_CODES = [
  { value: "+54", label: "🇦🇷 +54" },
  { value: "+55", label: "🇧🇷 +55" },
  { value: "+56", label: "🇨🇱 +56" },
  { value: "+57", label: "🇨🇴 +57" },
  { value: "+598", label: "🇺🇾 +598" },
  { value: "+52", label: "🇲🇽 +52" },
  { value: "+1", label: "🇺🇸 +1" },
  { value: "+34", label: "🇪🇸 +34" },
];

type AuthStep = "email" | "register" | "register-inmobiliaria" | "complete-profile";

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
        const redirectTo = params.get("redirect");
        params.delete("auth");
        params.delete("redirect");
        const newQuery = params.toString();
        if (redirectTo) {
          router.push(redirectTo);
          router.refresh();
        } else {
          router.replace(`${pathname}${newQuery ? `?${newQuery}` : ""}`, { scroll: false });
        }
      }
    }
  }, [searchParams, isAuthModalOpen, openAuthModal, isAuthenticated, isLoading, pathname, router]);
  const { startSync } = useTokkoSync();
  const [step, setStep] = useState<AuthStep>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tokkoApiKey, setTokkoApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneCountryCode, setPhoneCountryCode] = useState("+54");
  const [phoneArea, setPhoneArea] = useState("");
  const [phone, setPhone] = useState("");
  const [dni, setDni] = useState("");
  const [profileError, setProfileError] = useState<string | null>(null);

  const resetForm = () => {
    setStep("email");
    setEmail("");
    setPassword("");
    setTokkoApiKey("");
    setFirstName("");
    setLastName("");
    setPhoneCountryCode("+54");
    setPhoneArea("");
    setPhone("");
    setDni("");
    setProfileError(null);
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

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      const redirectTo = searchParams.get("redirect");
      if (redirectTo) {
        // Navigate to the originally-intended page after login
        closeAuthModal();
        resetForm();
        router.push(redirectTo);
        router.refresh();
      } else {
        handleClose();
      }
    } catch {
      // Error is set in AuthContext
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(email, password, false);
      setStep("complete-profile");
    } catch {
      // Error is set in AuthContext
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setProfileError(null);
    try {
      const res = await fetch("/api/users/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${firstName.trimEnd()} ${lastName.trim()}`.trim(),
          telefono: phone,
          telefono_area: phoneArea,
          telefono_country_code: phoneCountryCode,
          dni: dni,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setProfileError(data.error || "Error al guardar");
        return;
      }
      await refreshUser();
      const redirectTo = searchParams.get("redirect");
      if (redirectTo) {
        closeAuthModal();
        resetForm();
        router.push(redirectTo);
        router.refresh();
      } else {
        handleClose();
      }
    } catch {
      setProfileError("Error al guardar el perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleSkipProfile = () => {
    const redirectTo = searchParams.get("redirect");
    if (redirectTo) {
      closeAuthModal();
      resetForm();
      router.push(redirectTo);
      router.refresh();
    } else {
      handleClose();
    }
  };

  const handleInmobiliariaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(email, password, true);
      // Get the auth user ID to link with the public users row during sync
      const supabase = (await import("@/lib/supabase/client")).createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
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
    // TODO: Implement Google OAuth
    console.log("Google login");
  };

  return (
    <Dialog open={isAuthModalOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm p-6 gap-0">
        <DialogTitle className="sr-only">Autenticación</DialogTitle>
        {step === "email" && (
          <div className="space-y-5">
            {/* Header */}
            <div className="text-center">
              <h2 className="font-display text-xl font-semibold text-foreground">
                Iniciar sesión
              </h2>
            </div>

            {/* Error display */}
            {authError && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg text-center">
                {authError}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <Input
                type="email"
                placeholder="Ingresá tu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 rounded-lg"
              />
              <Input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 rounded-lg"
              />
              <Button
                type="submit"
                className="w-full h-11 rounded-lg font-semibold"
                disabled={loading}
              >
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            {/* Create account link */}
            <div className="text-center">
              <span className="text-sm text-muted-foreground">¿No tenés cuenta? </span>
              <button
                type="button"
                onClick={() => setStep("register")}
                className="text-sm text-primary hover:underline font-medium"
              >
                Crear una cuenta
              </button>
            </div>

            {/* Separator */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-sm text-muted-foreground">o</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Social Login Options */}
            <div className="space-y-3">
              {/* Google */}
              <Button
                variant="outline"
                className="w-full h-11 rounded-lg font-medium justify-center gap-3"
                onClick={handleGoogleLogin}
              >
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
                Continuar con Google
              </Button>
            </div>
          </div>
        )}

        {step === "register" && (
          <div className="space-y-5">
            {/* Header */}
            <div className="text-center">
              <h2 className="font-display text-xl font-semibold text-foreground">
                Crear cuenta
              </h2>
            </div>

            {/* Error display */}
            {authError && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg text-center">
                {authError}
              </div>
            )}

            {/* Register Form */}
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <Input
                type="email"
                placeholder="Ingresá tu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 rounded-lg"
              />
              <Input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 rounded-lg"
              />

              <Button
                type="submit"
                className="w-full h-11 rounded-lg font-semibold"
                disabled={loading}
              >
                {loading ? "Creando cuenta..." : "Crear cuenta"}
              </Button>
            </form>

            {/* Login link */}
            <div className="text-center">
              <span className="text-sm text-muted-foreground">¿Ya tenés cuenta? </span>
              <button
                type="button"
                onClick={() => { setStep("email"); clearError(); }}
                className="text-sm text-primary hover:underline font-medium"
              >
                Iniciar sesión
              </button>
            </div>

            {/* Separator */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-sm text-muted-foreground">o</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Inmobiliaria CTA */}
            <Button
              variant="outline"
              className="w-full h-11 rounded-lg font-medium justify-center gap-3"
              onClick={() => { setStep("register-inmobiliaria"); clearError(); }}
            >
              <Building2 className="h-5 w-5" />
              Soy una inmobiliaria
            </Button>
          </div>
        )}

        {step === "register-inmobiliaria" && (
          <div className="space-y-5">
            {/* Header */}
            <div className="text-center">
              <h2 className="font-display text-xl font-semibold text-foreground">
                Registro inmobiliaria
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Conectá tu cuenta de Tokko Broker
              </p>
            </div>

            {/* Error display */}
            {authError && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg text-center">
                {authError}
              </div>
            )}

            {/* Inmobiliaria Form */}
            <form onSubmit={handleInmobiliariaSubmit} className="space-y-4">
              <Input
                type="email"
                placeholder="Ingresá tu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 rounded-lg"
              />
              <Input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 rounded-lg"
              />
              <Input
                type="text"
                placeholder="Tokko API Key"
                value={tokkoApiKey}
                onChange={(e) => setTokkoApiKey(e.target.value)}
                required
                className="h-11 rounded-lg font-mono text-sm"
              />

              <Button
                type="submit"
                className="w-full h-11 rounded-lg font-semibold"
                disabled={loading}
              >
                {loading ? "Creando cuenta..." : "Crear cuenta y sincronizar"}
              </Button>
            </form>

            {/* Back link */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => { setStep("register"); clearError(); }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Volver
              </button>
            </div>
          </div>
        )}

        {step === "complete-profile" && (
          <div className="space-y-5">
            {/* Header */}
            <div className="text-center">
              <h2 className="font-display text-xl font-semibold text-foreground">
                Completá tu perfil
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Estos datos nos ayudan a brindarte un mejor servicio
              </p>
            </div>

            {/* Error display */}
            {profileError && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg text-center">
                {profileError}
              </div>
            )}

            {/* Profile Form */}
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Nombre"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="h-11 rounded-lg flex-1"
                />
                <Input
                  type="text"
                  placeholder="Apellido"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="h-11 rounded-lg flex-1"
                />
              </div>

              {/* Structured phone */}
              <div className="flex items-center h-11 rounded-lg border border-input bg-transparent focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1">
                <Select value={phoneCountryCode} onValueChange={setPhoneCountryCode}>
                  <SelectTrigger className="h-full shrink-0 text-sm border-0 shadow-none ring-0 focus:ring-0 focus:ring-offset-0 rounded-r-none px-3 w-auto gap-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRY_CODES.map((code) => (
                      <SelectItem key={code.value} value={code.value}>
                        {code.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="w-px h-5 bg-border shrink-0" />
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="911"
                  value={phoneArea}
                  onChange={(e) => setPhoneArea(e.target.value.replace(/\D/g, ""))}
                  className="w-10 h-full bg-transparent pl-2 text-sm outline-none placeholder:text-muted-foreground text-center"
                />
                <span className="text-muted-foreground select-none">-</span>
                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder="1234-5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^\d-]/g, ""))}
                  className="flex-1 h-full bg-transparent pl-1 pr-3 text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>

              {/* DNI */}
              <Input
                type="text"
                inputMode="numeric"
                placeholder="DNI (sin puntos)"
                value={dni}
                onChange={(e) => setDni(e.target.value.replace(/\D/g, ""))}
                className="h-11 rounded-lg"
              />

              <Button
                type="submit"
                className="w-full h-11 rounded-lg font-semibold"
                disabled={loading}
              >
                {loading ? "Guardando..." : "Enviar"}
              </Button>
            </form>

            {/* Skip link */}
            <div className="text-center">
              <button
                type="button"
                onClick={handleSkipProfile}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Completar más tarde
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
