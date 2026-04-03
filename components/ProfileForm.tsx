"use client";

import { useState } from "react";
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
import { Check } from "lucide-react";

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

interface ProfileData {
  name: string | null;
  email: string;
  telefono: string | null;
  telefono_country_code: string | null;
  dni: string | null;
}

interface ProfileFormProps {
  profile: ProfileData;
  /** When provided, shows DNI field for account types 1 (inquilino) and 2 (dueño directo) */
  accountType?: number | null;
  /** When false, all fields are read-only (display mode) */
  editing?: boolean;
  /** Called after a successful save */
  onSaved?: () => void;
}

export default function ProfileForm({ profile, accountType, editing = true, onSaved }: ProfileFormProps) {
  const { refreshUser } = useAuth();
  const [name, setName] = useState(profile.name || "");
  const [phoneCountryCode, setPhoneCountryCode] = useState(profile.telefono_country_code || "+54");
  const [phone, setPhone] = useState(profile.telefono || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [savedValues, setSavedValues] = useState({
    name: profile.name || "",
    phoneCountryCode: profile.telefono_country_code || "+54",
    phone: profile.telefono || "",
  });

  const showDni = !!profile.dni;

  const isDirty =
    name !== savedValues.name ||
    phoneCountryCode !== savedValues.phoneCountryCode ||
    phone !== savedValues.phone;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);

    try {
      const res = await fetch("/api/users/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          telefono: phone,
          telefono_country_code: phoneCountryCode,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Error al guardar");
        return;
      }

      setSaved(true);
      setSavedValues({ name, phoneCountryCode, phone });
      setTimeout(() => setSaved(false), 3000);
      // Refresh auth context in background — don't block save feedback
      refreshUser().catch(() => {});
      onSaved?.();
    } catch {
      setError("Error al guardar el perfil");
    } finally {
      setLoading(false);
    }
  };

  // ── Read-only display ──────────────────────────────────────────────────────
  if (!editing) {
    const phoneDisplay = phone
      ? `${phoneCountryCode} ${phone}`
      : "No especificado";

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Email</label>
            <p className="text-sm text-foreground">{profile.email}</p>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Nombre completo</label>
            <p className="text-sm text-foreground">{name || "No especificado"}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {showDni && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">DNI</label>
              <p className="text-sm text-foreground">{profile.dni}</p>
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Teléfono</label>
            <p className="text-sm text-foreground">{phoneDisplay}</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Edit mode ──────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Error */}
      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-2.5 rounded-lg">
          {error}
        </div>
      )}

      {/* Success */}
      {saved && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 text-sm p-2.5 rounded-lg flex items-center gap-2">
          <Check className="h-4 w-4" />
          Perfil actualizado correctamente
        </div>
      )}

      {/* Email + Name row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Email</label>
          <Input
            type="email"
            value={profile.email}
            disabled
            className="h-10 rounded-lg bg-muted"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Nombre completo</label>
          <Input
            type="text"
            placeholder="Tu nombre completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-10 rounded-lg"
          />
        </div>
      </div>

      {/* DNI + Phone row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {showDni && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">DNI</label>
            <Input
              type="text"
              value={profile.dni!}
              disabled
              className="h-10 rounded-lg bg-muted"
            />
          </div>
        )}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Teléfono</label>
          <div className="flex gap-2">
            <Select value={phoneCountryCode} onValueChange={setPhoneCountryCode}>
              <SelectTrigger className="h-10 rounded-lg w-[100px] text-sm">
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
            <Input
              type="tel"
              inputMode="numeric"
              placeholder="1112345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-10 rounded-lg flex-1"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="h-10 rounded-lg font-semibold"
          disabled={loading}
          onClick={() => {
            setName(savedValues.name);
            setPhoneCountryCode(savedValues.phoneCountryCode);
            setPhone(savedValues.phone);
            setError(null);
            onSaved?.();
          }}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="h-10 rounded-lg font-semibold"
          disabled={loading || !isDirty}
        >
          {loading ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
