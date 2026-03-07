"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Home, Building2, Search, Plus, FlaskConical, Pencil, Trash2, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TenantSection from "./TenantSection";
import OwnerSection from "./OwnerSection";
import Link from "next/link";
import type { TenantRental, OwnerProperty } from "@/lib/transforms/property";
import {
  mockTenantRentals,
  mockOwnerProperties,
} from "@/lib/mock/gestion-mock-data";

const TOTAL_STEPS = 9;

interface DraftProperty {
  id: number;
  type_id: number | null;
  address: string | null;
  location_id: number | null;
  draft_step: number | null;
  updated_at: string | null;
  tokko_property_type: { name: string } | null;
  tokko_location: { name: string } | null;
}

// ─── Component ───────────────────────────────────────────────────────

interface GestionViewProps {
  tenantRentals: TenantRental[];
  ownerProperties: OwnerProperty[];
  draftProperties: DraftProperty[];
  roles: { isTenant: boolean; isOwner: boolean };
}

const DraftPropertiesSection = ({ drafts }: { drafts: DraftProperty[] }) => {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  if (drafts.length === 0) return null;

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminás este borrador?")) return;
    setDeletingId(id);
    try {
      await fetch(`/api/properties/${id}/delete`, { method: "DELETE" });
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-3">
      <h2 className="font-display text-lg font-semibold">Publicaciones en progreso</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {drafts.map((draft) => {
          const typeName = draft.tokko_property_type?.name || null;
          const locationName = draft.tokko_location?.name || null;
          const title =
            typeName && locationName
              ? `${typeName} en ${locationName}`
              : typeName || draft.address || "Nueva propiedad";
          const step = draft.draft_step ?? 2;
          const updatedAt = draft.updated_at
            ? new Date(draft.updated_at).toLocaleDateString("es-AR")
            : null;

          return (
            <div
              key={draft.id}
              className="bg-card rounded-xl border border-border/60 p-5 space-y-4"
            >
              <div className="space-y-1">
                <p className="font-medium text-sm leading-snug">{title}</p>
                <p className="text-xs text-muted-foreground">
                  Paso {step} de {TOTAL_STEPS}
                  {updatedAt && ` · Guardado el ${updatedAt}`}
                </p>
              </div>

              {/* Progress indicator */}
              <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => router.push(`/subir-propiedad?draftId=${draft.id}`)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Continuar
                </button>
                <button
                  onClick={() => handleDelete(draft.id)}
                  disabled={deletingId === draft.id}
                  className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-border text-muted-foreground hover:text-red-500 hover:border-red-300 transition-colors"
                >
                  {deletingId === draft.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const GestionView = ({
  tenantRentals: realTenantRentals,
  ownerProperties: realOwnerProperties,
  draftProperties,
  roles: realRoles,
}: GestionViewProps) => {
  const [useMock, setUseMock] = useState(false);

  const tenantRentals = useMock ? mockTenantRentals : realTenantRentals;
  const ownerProperties = useMock ? mockOwnerProperties : realOwnerProperties;
  const roles = useMock
    ? { isTenant: true, isOwner: true }
    : realRoles;

  const { isTenant, isOwner } = roles;

  const dataToggle = (
    <button
      onClick={() => setUseMock((v) => !v)}
      className="fixed bottom-4 right-4 z-50 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold shadow-lg border transition-colors cursor-pointer bg-card border-border text-muted-foreground hover:text-foreground"
    >
      <FlaskConical className="h-3.5 w-3.5" />
      {useMock ? "Mock data" : "Real data"}
      <span
        className={`h-2 w-2 rounded-full ${useMock ? "bg-amber-500" : "bg-green-500"}`}
      />
    </button>
  );

  // Neither role — show empty state
  if (!isTenant && !isOwner) {
    return (
      <div className="space-y-8">
        {dataToggle}
        <div>
          <h1 className="font-display text-2xl font-semibold">Gestión</h1>
          <p className="text-muted-foreground mt-1">
            Tu centro de gestión de propiedades y alquileres
          </p>
        </div>

        <DraftPropertiesSection drafts={draftProperties} />

        <div className="bg-card rounded-xl border border-border p-12 text-center max-w-lg mx-auto">
          <div className="h-16 w-16 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
            <Home className="h-8 w-8 text-primary" />
          </div>
          <h3 className="font-display font-semibold text-lg">
            Bienvenido a tu gestión
          </h3>
          <p className="text-muted-foreground mt-2">
            Acá vas a poder ver tus alquileres como inquilino y gestionar tus
            propiedades como propietario.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
            <Link
              href="/buscar"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border text-sm font-medium hover:bg-secondary transition-colors"
            >
              <Search className="h-4 w-4" />
              Buscar propiedades
            </Link>
            <Link
              href="/subir-propiedad"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Publicar mi propiedad
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Only one role — show directly without tabs
  if (isTenant && !isOwner) {
    return (
      <div className="space-y-6">
        {dataToggle}
        <div>
          <h1 className="font-display text-2xl font-semibold">
            Mis alquileres
          </h1>
          <p className="text-muted-foreground mt-1">
            Seguí el estado de tus contratos de alquiler
          </p>
        </div>
        <DraftPropertiesSection drafts={draftProperties} />
        <TenantSection rentals={tenantRentals} mockMode={useMock} />
      </div>
    );
  }

  if (!isTenant && isOwner) {
    return (
      <>
        {dataToggle}
        <div className="space-y-6">
          <DraftPropertiesSection drafts={draftProperties} />
          <OwnerSection properties={ownerProperties} mockMode={useMock} />
        </div>
      </>
    );
  }

  // Both roles — show tabs
  return (
    <div className="space-y-6">
      {dataToggle}
      <div>
        <h1 className="font-display text-2xl font-semibold">Gestión</h1>
        <p className="text-muted-foreground mt-1">
          Administrá tus alquileres y propiedades
        </p>
      </div>

      <DraftPropertiesSection drafts={draftProperties} />

      <Tabs defaultValue="alquileres">
        <TabsList className="bg-card border border-border p-1 rounded-xl h-auto gap-1">
          <TabsTrigger
            value="alquileres"
            className="rounded-xl gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Home className="h-4 w-4" />
            Mis alquileres
            {tenantRentals.filter((r) => r.status === "rented").length > 0 && (
              <span className="ml-1 h-5 min-w-5 px-1 rounded-full bg-green-500/20 text-green-600 data-[state=active]:bg-primary-foreground/20 data-[state=active]:text-primary-foreground text-xs font-bold flex items-center justify-center">
                {tenantRentals.filter((r) => r.status === "rented").length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="propiedades"
            className="rounded-xl gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Building2 className="h-4 w-4" />
            Mis propiedades
            <span className="ml-1 h-5 min-w-5 px-1 rounded-full bg-primary/10 text-primary data-[state=active]:bg-primary-foreground/20 data-[state=active]:text-primary-foreground text-xs font-bold flex items-center justify-center">
              {ownerProperties.length}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="alquileres" className="mt-6">
          <TenantSection rentals={tenantRentals} mockMode={useMock} />
        </TabsContent>

        <TabsContent value="propiedades" className="mt-6">
          <OwnerSection properties={ownerProperties} mockMode={useMock} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GestionView;
