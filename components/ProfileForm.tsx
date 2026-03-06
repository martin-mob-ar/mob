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
}

export default function ProfileForm({ profile, accountType }: ProfileFormProps) {
  const { refreshUser } = useAuth();
  const [name, setName] = useState(profile.name || "");
  const [phoneCountryCode, setPhoneCountryCode] = useState(profile.telefono_country_code || "+54");
  const [phone, setPhone] = useState(profile.telefono || "");
  const [dni, setDni] = useState(profile.dni || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const showDni = accountType === 1 || accountType === 2;

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
          ...(showDni ? { dni } : {}),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Error al guardar");
        return;
      }

      await refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Error al guardar el perfil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error */}
      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Success */}
      {saved && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 text-sm p-3 rounded-lg flex items-center gap-2">
          <Check className="h-4 w-4" />
          Perfil actualizado correctamente
        </div>
      )}

      {/* Email (read-only) */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Email</label>
        <Input
          type="email"
          value={profile.email}
          disabled
          className="h-11 rounded-lg bg-muted"
        />
      </div>

      {/* Name */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Nombre completo</label>
        <Input
          type="text"
          placeholder="Tu nombre completo"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-11 rounded-lg"
        />
      </div>

      {/* DNI — inquilino and dueño directo only */}
      {showDni && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">DNI</label>
          <Input
            type="text"
            inputMode="numeric"
            placeholder="Sin puntos, ej: 30123456"
            value={dni}
            onChange={(e) => setDni(e.target.value.replace(/\D/g, ""))}
            className="h-11 rounded-lg"
          />
        </div>
      )}

      {/* Phone */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Teléfono</label>
        <div className="flex gap-2">
          <Select value={phoneCountryCode} onValueChange={setPhoneCountryCode}>
            <SelectTrigger className="h-11 rounded-lg w-[100px] text-sm">
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
            className="h-11 rounded-lg flex-1"
          />
        </div>
        <p className="text-xs text-muted-foreground">Ej: +54 1112345678</p>
      </div>

      <Button
        type="submit"
        className="h-11 rounded-lg font-semibold"
        disabled={loading}
      >
        {loading ? "Guardando..." : "Guardar cambios"}
      </Button>
    </form>
  );
}
