"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import CryptoJS from "crypto-js";
import AccountTypeSelector from "./AccountTypeSelector";
import ProfileForm from "@/components/ProfileForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Loader2,
  RefreshCw,
  Key,
  CheckCircle,
  AlertCircle,
  BadgeCheck,
  Clock,
  ArrowRight,
  Zap,
  ShieldCheck,
  Search,
  MessageCircle,
  Building2,
  Home,
  CalendarDays,
  Shield,
} from "lucide-react";
import Link from "next/link";

interface ProfileData {
  name: string | null;
  email: string;
  telefono: string | null;
  telefono_country_code: string | null;
  dni: string | null;
}

interface ProfileSectionProps {
  profile: ProfileData;
  accountType: number | null;
  hasTokkoHash: boolean;
  syncStatus: string;
  tokkoLastSyncAt: string | null;
  /** First 8 chars of decrypted API key, computed server-side */
  tokkoKeyPreview: string | null;
  /** SHA-256 hash of API key — safe to pass to client for polling */
  tokkoApiHash: string | null;
  lastVerificationDate: string | null;
  /** Auth user ID (Supabase auth.users.id) — needed for sync endpoint */
  authId: string;
  /** Auth user email — needed for sync endpoint */
  authEmail: string;
}

function ResyncButton() {
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    propertiesUpdated?: number;
    propertiesDeleted?: number;
    error?: string;
  } | null>(null);

  async function handleResync() {
    setSyncing(true);
    setResult(null);
    try {
      const res = await fetch("/api/tokko/sync/incremental", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setResult({ error: data.error || "Error desconocido" });
      } else {
        setResult({
          success: true,
          propertiesUpdated: data.propertiesUpdated,
          propertiesDeleted: data.propertiesDeleted,
        });
        router.refresh();
      }
    } catch {
      setResult({ error: "Error de conexión" });
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button
        variant="outline"
        className="h-9 rounded-lg font-medium gap-2"
        disabled={syncing}
        onClick={handleResync}
      >
        <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
        {syncing ? "Sincronizando..." : "Resincronizar con Tokko"}
      </Button>
      {result?.success && (
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
          {result.propertiesUpdated || result.propertiesDeleted
            ? `${result.propertiesUpdated} actualizadas, ${result.propertiesDeleted} eliminadas`
            : "Todo al día, sin cambios"}
        </p>
      )}
      {result?.error && (
        <p className="text-sm text-destructive flex items-center gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {result.error}
        </p>
      )}
    </div>
  );
}

export default function ProfileSection({
  profile,
  accountType: initialAccountType,
  hasTokkoHash,
  syncStatus: initialSyncStatus,
  tokkoLastSyncAt,
  tokkoKeyPreview,
  tokkoApiHash,
  lastVerificationDate,
  authId,
  authEmail,
}: ProfileSectionProps) {
  const router = useRouter();

  const [accountType, setAccountType] = useState(initialAccountType);
  const [selectingType, setSelectingType] = useState(false);
  const isInmobiliaria = accountType === 3 || accountType === 4;

  // Inmobiliaria setup state
  const [tokkoApiKey, setTokkoApiKey] = useState("");
  const [setupLoading, setSetupLoading] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);

  // Sync polling state
  const [syncStatus, setSyncStatus] = useState(initialSyncStatus);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [syncPropertiesCount, setSyncPropertiesCount] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startPolling = useCallback(
    (apiKeyHash: string) => {
      setSyncStatus("syncing");
      if (intervalRef.current) clearInterval(intervalRef.current);

      intervalRef.current = setInterval(async () => {
        try {
          const res = await fetch(
            `/api/tokko/sync/status?apiKeyHash=${encodeURIComponent(apiKeyHash)}`
          );
          const data = await res.json();

          if (data.status === "syncing") {
            setSyncMessage(data.message || "Sincronizando propiedades...");
            if (data.propertiesCount) setSyncPropertiesCount(data.propertiesCount);
          } else if (data.status === "done") {
            clearInterval(intervalRef.current!);
            setSyncPropertiesCount(data.propertiesCount ?? 0);
            setSyncStatus("done");
          } else if (data.status === "error") {
            clearInterval(intervalRef.current!);
            setSyncStatus("error");
            setSetupError(data.message || "Error en la sincronización");
          }
        } catch {
          // Network error — keep polling
        }
      }, 2000);
    },
    [router]
  );

  // If sync is already running on mount, start polling with the hash from server
  useEffect(() => {
    if (initialSyncStatus === "syncing" && tokkoApiHash) {
      startPolling(tokkoApiHash);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectAccountType = async (type: number) => {
    setSelectingType(true);
    try {
      await fetch("/api/users/account-type", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account_type: type }),
      });
      setAccountType(type);
      // Re-run the server component so the GestionView section renders
      router.refresh();
    } finally {
      setSelectingType(false);
    }
  };

  const handleTokkoSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokkoApiKey.trim()) return;

    setSetupLoading(true);
    setSetupError(null);

    try {
      const apiKeyHash = CryptoJS.SHA256(tokkoApiKey.trim()).toString();

      // Fire-and-forget sync — keepalive ensures it survives navigation
      fetch("/api/tokko/sync", {
        method: "POST",
        keepalive: true,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: tokkoApiKey.trim(),
          limit: 500,
          authId,
          authEmail,
        }),
      });

      startPolling(apiKeyHash);
    } catch {
      setSetupError("Error al iniciar la sincronización");
    } finally {
      setSetupLoading(false);
    }
  };

  // ── No account type selected ─────────────────────────────────────────────
  if (!accountType) {
    return (
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-foreground">
            Mi perfil
          </h1>
          <p className="text-muted-foreground mt-1">
            Para comenzar, contanos qué tipo de usuario sos
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="font-semibold text-lg text-foreground mb-4">
            ¿Cuál es tu tipo de cuenta?
          </h2>
          <AccountTypeSelector
            onSelect={handleSelectAccountType}
            loading={selectingType}
          />
        </div>
      </div>
    );
  }

  // ── Inmobiliaria: no tokko key yet — show setup form ────────────────────
  if (isInmobiliaria && !hasTokkoHash && syncStatus !== "syncing" && syncStatus !== "done") {
    return (
      <div className="max-w-md mx-auto">
        {/* Icon + title */}
        <div className="h-14 w-14 rounded-xl bg-blue-50 flex items-center justify-center mb-5">
          <Building2 className="h-7 w-7 text-blue-500" />
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          Mi Inmobiliaria
        </h1>
        <p className="text-muted-foreground mt-1 mb-8">
          Completá los datos de tu inmobiliaria para comenzar a operar en mob
        </p>

        {(setupError || syncStatus === "error") && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-xl flex items-center gap-2 mb-4">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {setupError || "Error en la sincronización. Intentá nuevamente."}
          </div>
        )}

        <form onSubmit={handleTokkoSetup} className="space-y-5">
          {/* API Key field */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Key className="h-4 w-4 text-muted-foreground" />
              API Key
            </label>
            <Input
              type="text"
              placeholder="Ingresá tu API key"
              value={tokkoApiKey}
              onChange={(e) => setTokkoApiKey(e.target.value)}
              required
              className="h-12 rounded-xl font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Encontrá tu API key en el panel de tu CRM o contactanos por
              WhatsApp.
            </p>
          </div>

          <Button
            type="submit"
            className="h-12 w-full rounded-xl font-semibold"
            disabled={setupLoading}
          >
            {setupLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Iniciando...
              </>
            ) : (
              "Guardar datos"
            )}
          </Button>
        </form>

        <div className="border-t border-border my-6" />

        <a
          href="https://wa.me/2236000055"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button
            variant="outline"
            className="h-12 w-full rounded-xl font-semibold text-green-600 border-green-200 hover:bg-green-50 hover:border-green-300 gap-2"
          >
            <MessageCircle className="h-5 w-5" />
            Contactar por WhatsApp
          </Button>
        </a>
      </div>
    );
  }

  // ── Inmobiliaria: sync in progress ───────────────────────────────────────
  if (isInmobiliaria && syncStatus === "syncing") {
    return (
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-foreground">
            Mi perfil
          </h1>
          <p className="text-muted-foreground mt-1">
            Sincronizando propiedades...
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex flex-col items-center gap-4 py-8">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <div className="text-center">
              <p className="font-semibold text-foreground">
                Sincronizando con Tokko Broker
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {syncMessage || "Esto puede tardar unos minutos..."}
              </p>
              {syncPropertiesCount != null && syncPropertiesCount > 0 && (
                <p className="text-sm font-medium text-foreground mt-3">
                  {syncPropertiesCount} {syncPropertiesCount === 1 ? "propiedad sincronizada" : "propiedades sincronizadas"}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Inmobiliaria: sync just completed ──────────────────────────────────
  if (isInmobiliaria && syncStatus === "done" && syncPropertiesCount != null) {
    return (
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-foreground">
            Mi perfil
          </h1>
          <p className="text-muted-foreground mt-1">
            Sincronización completada
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="h-14 w-14 rounded-full bg-emerald-50 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-emerald-500" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">
                ¡Sincronización exitosa!
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {syncPropertiesCount} {syncPropertiesCount === 1 ? "propiedad sincronizada" : "propiedades sincronizadas"} desde Tokko Broker
              </p>
            </div>
            <Button
              className="h-11 rounded-xl font-semibold gap-2 mt-2"
              onClick={() => {
                setSyncPropertiesCount(null);
                router.refresh();
              }}
            >
              Continuar
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Compute verification status ──────────────────────────────────────────
  const isInquilino = accountType === 1;
  const isDuenioDirecto = accountType === 2;

  const isExpired =
    lastVerificationDate !== null &&
    Date.now() - new Date(lastVerificationDate).getTime() >
      2 * 30 * 24 * 60 * 60 * 1000;

  const inquilinoVerified =
    isInquilino && lastVerificationDate !== null && !isExpired;
  const duenioVerified = isDuenioDirecto && lastVerificationDate !== null;

  // ── Inquilino: not verified — show conversion block ──────────────────────
  if (isInquilino && !inquilinoVerified) {
    return (
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm mb-3">
          <Zap className="h-4 w-4" />
          Verificate para publicar
        </div>
        <p className="text-muted-foreground text-sm mb-6">
          Completás tu perfil una sola vez y validamos tu identidad e ingresos.
          Quedás preaprobado para aplicar a cualquier alquiler dentro de mob.
        </p>

        {/* Benefits list */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
              <Clock className="h-4 w-4 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-foreground">
              Verificate en menos de 2 minutos
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-foreground">
              Accedé a garantía 50% OFF con aprobación instantánea
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
              <CalendarDays className="h-4 w-4 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-foreground">
              Agendá visitas y reservá online
            </span>
          </div>
        </div>

        {/* Primary CTA */}
        <Button className="h-13 w-full rounded-full bg-blue-600 hover:bg-blue-700 font-semibold text-base gap-2" disabled>
          <Shield className="h-5 w-5" />
          Verificar mi perfil
        </Button>

        <div className="border-t border-border my-5" />

        {/* Secondary CTA */}
        <Link href="/buscar">
          <Button
            variant="outline"
            className="h-13 w-full rounded-full font-semibold text-base gap-2"
          >
            <Search className="h-5 w-5" />
            Buscar propiedades
          </Button>
        </Link>
      </div>
    );
  }

  // ── Dueño directo: not verified — show conversion block ─────────────────
  if (isDuenioDirecto && !duenioVerified) {
    return (
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm mb-3">
          <Zap className="h-4 w-4" />
          Verificate para publicar
        </div>
        <p className="text-muted-foreground text-sm mb-6">
          Completás tu perfil una sola vez y validamos tu identidad. Quedás
          habilitado para publicar tus propiedades en mob de forma gratuita.
        </p>

        {/* Benefits list */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
              <Clock className="h-4 w-4 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-foreground">
              Verificate en menos de 2 minutos
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
              <Home className="h-4 w-4 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-foreground">
              Publicá tu propiedad gratis
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-foreground">
              Recibí consultas de inquilinos verificados
            </span>
          </div>
        </div>

        {/* Primary CTA */}
        <Button className="h-13 w-full rounded-full bg-blue-600 hover:bg-blue-700 font-semibold text-base gap-2" disabled>
          <Shield className="h-5 w-5" />
          Verificar mi perfil
        </Button>

        <div className="border-t border-border my-5" />

        {/* Secondary CTA — disabled with tooltip */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="block w-full cursor-not-allowed">
                <Button
                  variant="outline"
                  className="h-13 w-full rounded-full font-semibold text-base gap-2 pointer-events-none opacity-60"
                  tabIndex={-1}
                >
                  <Home className="h-5 w-5" />
                  Publica gratis
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              Verificate para poder publicar
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  // ── Verification badge for verified users who need re-verification ────────
  const verificationBadge = (() => {
    // Dueño directo: already verified (permanent) — no badge needed
    if (isDuenioDirecto) return null;

    // Inquilino: show if verification expired
    if (isInquilino && isExpired) {
      return (
        <div className="block mb-6">
          <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
            <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-800/40 flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                Tu verificación venció
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                La verificación de Mob tiene una validez de 2 meses. Necesitás
                verificarte de nuevo para seguir alquilando.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return null;
  })();

  // ── Normal profile form (all types, including inmobiliaria post-sync) ────
  return (
    <div>
      <div className="mb-4">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Mi perfil
        </h1>
        <p className="text-muted-foreground mt-0.5 text-sm">
          Editá tu información personal
        </p>
      </div>
      {verificationBadge}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <ProfileForm profile={profile} accountType={accountType} />

        {/* Tokko section — only for inmobiliaria with key */}
        {isInmobiliaria && tokkoKeyPreview && (
          <>
            <div className="border-t border-border" />
            <div className="space-y-3">
              <h3 className="font-semibold text-base text-foreground">
                Tokko Broker
              </h3>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  API Key
                </label>
                <Input
                  type="text"
                  value={`${tokkoKeyPreview}••••••••••••••••`}
                  disabled
                  className="h-10 rounded-lg bg-muted font-mono text-sm"
                />
              </div>

              {tokkoLastSyncAt && (
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  Última sincronización:{" "}
                  {new Intl.DateTimeFormat("es-AR", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(tokkoLastSyncAt))}
                </p>
              )}

              <ResyncButton />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
