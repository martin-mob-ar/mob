"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { MessageCircle } from "lucide-react";

type AuthStep = "email" | "password" | "register";

const AuthModal = () => {
  const { isAuthModalOpen, closeAuthModal, login, register, authError, clearError } = useAuth();
  const [step, setStep] = useState<AuthStep>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setStep("email");
    setEmail("");
    setPassword("");
    clearError();
  };

  const handleClose = () => {
    closeAuthModal();
    resetForm();
  };

  const handleEmailContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setStep("password");
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      handleClose();
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
      handleClose();
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

  const handleWhatsAppLogin = () => {
    // TODO: Implement WhatsApp login
    console.log("WhatsApp login");
  };

  const handleAppleLogin = () => {
    // TODO: Implement Apple login
    console.log("Apple login");
  };

  return (
    <Dialog open={isAuthModalOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm p-6 gap-0">
        {step === "email" && (
          <div className="space-y-5">
            {/* Header */}
            <div className="text-center">
              <h2 className="font-display text-xl font-semibold text-foreground">
                Iniciar sesión
              </h2>
            </div>

            {/* Email Input */}
            <form onSubmit={handleEmailContinue} className="space-y-4">
              <Input
                type="email"
                placeholder="Ingresá tu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 rounded-lg"
              />
              <Button
                type="submit"
                className="w-full h-11 rounded-lg font-semibold"
              >
                Continuar
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

              {/* WhatsApp */}
              <Button
                variant="outline"
                className="w-full h-11 rounded-lg font-medium justify-center gap-3"
                onClick={handleWhatsAppLogin}
              >
                <MessageCircle className="h-5 w-5 text-[#25D366]" />
                Continuar con WhatsApp
              </Button>

              {/* Apple */}
              <Button
                variant="outline"
                className="w-full h-11 rounded-lg font-medium justify-center gap-3"
                onClick={handleAppleLogin}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                Continuar con Apple
              </Button>
            </div>
          </div>
        )}

        {step === "password" && (
          <div className="space-y-5">
            {/* Header */}
            <div className="text-center">
              <h2 className="font-display text-xl font-semibold text-foreground">
                Ingresá tu contraseña
              </h2>
              <p className="text-sm text-muted-foreground mt-1">{email}</p>
            </div>

            {/* Error display */}
            {authError && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg text-center">
                {authError}
              </div>
            )}

            {/* Password Form */}
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
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

            {/* Back link */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => { setStep("email"); clearError(); }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Volver
              </button>
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
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
