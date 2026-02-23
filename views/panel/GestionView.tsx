"use client";

import { useState } from "react";
import { Home, Building2, Search, Plus, FlaskConical } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TenantSection from "./TenantSection";
import OwnerSection from "./OwnerSection";
import Link from "next/link";
import type { TenantRental, OwnerProperty } from "@/lib/transforms/property";
import {
  mockTenantRentals,
  mockOwnerProperties,
} from "@/lib/mock/gestion-mock-data";

// ─── Component ───────────────────────────────────────────────────────

interface GestionViewProps {
  tenantRentals: TenantRental[];
  ownerProperties: OwnerProperty[];
  roles: { isTenant: boolean; isOwner: boolean };
}

const GestionView = ({
  tenantRentals: realTenantRentals,
  ownerProperties: realOwnerProperties,
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

        <div className="bg-card rounded-2xl border border-border p-12 text-center max-w-lg mx-auto">
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
        <TenantSection rentals={tenantRentals} mockMode={useMock} />
      </div>
    );
  }

  if (!isTenant && isOwner) {
    return (
      <>
        {dataToggle}
        <OwnerSection properties={ownerProperties} mockMode={useMock} />
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

      <Tabs defaultValue="alquileres">
        <TabsList className="bg-card border border-border p-1 rounded-xl h-auto gap-1">
          <TabsTrigger
            value="alquileres"
            className="rounded-lg gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
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
            className="rounded-lg gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
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
