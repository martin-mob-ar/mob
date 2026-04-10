"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  User,
  ChevronRight,
  ClipboardList,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GeneralStatusBadge } from "@/components/operaciones/OperacionStatusBadge";
import { getMockAllOperations } from "@/lib/mock/operaciones-mock-data";
import type { OperacionGeneralStatus } from "@/lib/mock/operaciones-types";

const tabs: { value: OperacionGeneralStatus | "todas"; label: string }[] = [
  { value: "todas", label: "Todas" },
  { value: "en_proceso", label: "En proceso" },
  { value: "completada", label: "Completadas" },
  { value: "cancelada", label: "Canceladas" },
];

const stepLabels: Record<number, string> = {
  1: "Garantía aprobada",
  2: "Documentación",
  3: "Pago",
  4: "Garantía emitida",
  5: "Datos contrato",
  6: "Firma",
};

const OperacionesListView = () => {
  const [filter, setFilter] = useState<OperacionGeneralStatus | "todas">(
    "todas"
  );
  const allOps = getMockAllOperations();
  const filtered =
    filter === "todas"
      ? allOps
      : allOps.filter((op) => op.generalStatus === filter);

  return (
    <div className="flex-1 bg-background">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Page header */}
        <div>
          <h1 className="font-display font-bold text-xl">Operaciones</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestión de operaciones de alquiler con garantía Hoggax
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`flex-1 text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
                filter === tab.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Desktop table (hidden on mobile) */}
        <div className="hidden md:block">
          <div className="rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Propiedad</TableHead>
                  <TableHead>Inquilino</TableHead>
                  <TableHead>Propietario</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Paso actual</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((op) => (
                  <TableRow key={op.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="font-medium text-sm">
                          {op.propertyAddress}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {op.tenantName}
                    </TableCell>
                    <TableCell className="text-sm">{op.ownerName}</TableCell>
                    <TableCell>
                      <GeneralStatusBadge status={op.generalStatus} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {stepLabels[op.currentStepIndex] ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/operaciones/${op.id}?role=hoggax`}
                        className="text-primary hover:text-primary/80 transition-colors"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Mobile card list */}
        <div className="md:hidden space-y-3">
          {filtered.map((op) => (
            <Link
              key={op.id}
              href={`/operaciones/${op.id}?role=hoggax`}
              className="block rounded-xl border border-border bg-card p-4 space-y-3 active:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 min-w-0">
                  <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm font-semibold leading-tight">
                    {op.propertyAddress}
                  </span>
                </div>
                <GeneralStatusBadge status={op.generalStatus} />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <User className="h-3 w-3 text-muted-foreground" />
                  <span className="truncate">{op.tenantName}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <User className="h-3 w-3 text-muted-foreground" />
                  <span className="truncate">{op.ownerName}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <ClipboardList className="h-3 w-3" />
                  <span>{stepLabels[op.currentStepIndex] ?? "—"}</span>
                </div>
                <ChevronRight className="h-4 w-4" />
              </div>
            </Link>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-12 text-sm text-muted-foreground">
              No hay operaciones en este estado.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OperacionesListView;
