"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { Check } from "lucide-react";

interface ProfileData {
  name: string | null;
  email: string;
  telefono: string | null;
  telefono_area: string | null;
  telefono_country_code: string | null;
}

export default function ProfileForm({ profile }: { profile: ProfileData }) {
  const { refreshUser } = useAuth();
  const [name, setName] = useState(profile.name || "");
  const [phoneCountryCode, setPhoneCountryCode] = useState(profile.telefono_country_code || "+54");
  const [phoneArea, setPhoneArea] = useState(profile.telefono_area || "");
  const [phone, setPhone] = useState(profile.telefono || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

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
          telefono_area: phoneArea,
          telefono_country_code: phoneCountryCode,
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

      {/* Structured phone */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Teléfono</label>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="+54"
            value={phoneCountryCode}
            onChange={(e) => setPhoneCountryCode(e.target.value)}
            className="h-11 rounded-lg w-20 text-center"
          />
          <Input
            type="text"
            placeholder="Área"
            value={phoneArea}
            onChange={(e) => setPhoneArea(e.target.value)}
            className="h-11 rounded-lg w-24"
          />
          <Input
            type="tel"
            placeholder="Número"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="h-11 rounded-lg flex-1"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Ej: +54 11 12345678
        </p>
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
