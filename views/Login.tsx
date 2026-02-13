"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useReservation } from "@/contexts/ReservationContext";
import { 
  Mail, 
  Lock,
  ArrowRight,
  Eye,
  EyeOff
} from "lucide-react";
const mobLogo = "/assets/mob-logo-new.png";

const Login = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setIsLoggedIn } = useReservation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const redirectTo = searchParams.get("redirect") || "/";

  const handleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoggedIn(true);
      // Redirect to the reservation flow or specified page
      router.push(redirectTo);
    }, 1000);
  };

  const handleExit = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-border flex items-center justify-between px-6 shrink-0">
        <img src={mobLogo} alt="MOB" className="h-6" />
        <button 
          onClick={handleExit}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancelar
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-sm w-full space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="font-display text-2xl font-bold">
              Iniciá sesión
            </h1>
            <p className="text-muted-foreground">
              Para reservar esta propiedad necesitás iniciar sesión
            </p>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  className="h-12 rounded-xl pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="h-12 rounded-xl pl-10 pr-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button 
              onClick={handleLogin}
              className="w-full h-12 rounded-xl gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Ingresando...
                </>
              ) : (
                <>
                  Continuar
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">o</span>
            </div>
          </div>

          {/* Register link */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              ¿No tenés cuenta?{" "}
              <button className="text-primary font-medium hover:underline">
                Crear cuenta
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
