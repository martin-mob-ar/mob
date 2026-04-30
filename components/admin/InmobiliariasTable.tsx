"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import {
  Search,
  X,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { AdminSelect } from "@/components/admin/AdminSelect";
import { Badge } from "@/components/ui/badge";
import type { InmobiliariaRow } from "@/lib/admin/queries";

type SortField =
  | "activeProperties"
  | "totalLeads"
  | "totalVisitas"
  | "totalViews"
  | "created_at";
type SortDir = "asc" | "desc";

interface InmobiliariasTableProps {
  data: InmobiliariaRow[];
}

export default function InmobiliariasTable({ data }: InmobiliariasTableProps) {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("activeProperties");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const result = term
      ? data.filter(
          (row) =>
            (row.name && row.name.toLowerCase().includes(term)) ||
            row.email.toLowerCase().includes(term),
        )
      : data;

    return [...result].sort((a, b) => {
      let av: number, bv: number;
      if (sortField === "created_at") {
        av = new Date(a.created_at).getTime();
        bv = new Date(b.created_at).getTime();
      } else {
        av = a[sortField];
        bv = b[sortField];
      }
      return sortDir === "desc" ? bv - av : av - bv;
    });
  }, [data, search, sortField, sortDir]);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field)
      return <ChevronsUpDown className="ml-0.5 h-3 w-3 opacity-30" />;
    return sortDir === "desc" ? (
      <ChevronDown className="ml-0.5 h-3 w-3" />
    ) : (
      <ChevronUp className="ml-0.5 h-3 w-3" />
    );
  }

  const fmt = (n: number) => n.toLocaleString("es-AR");

  if (data.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No hay inmobiliarias registradas.
      </p>
    );
  }

  return (
    <div>
      {/* Filter bar */}
      <div className="mb-3 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 pr-8 text-sm"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <AdminSelect
          value={sortField}
          onChange={(v) => {
            setSortField(v as SortField);
            setSortDir("desc");
          }}
          options={[
            { value: "activeProperties", label: "Propiedades" },
            { value: "totalLeads", label: "Leads" },
            { value: "totalVisitas", label: "Visitas" },
            { value: "totalViews", label: "Views" },
            { value: "created_at", label: "Fecha registro" },
          ]}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Sin resultados para &ldquo;{search}&rdquo;
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="py-1.5 pr-2 text-left font-medium">
                  Inmobiliaria
                </th>
                <th className="px-2 py-1.5 text-left font-medium">Tipo</th>
                <th
                  className="cursor-pointer select-none px-2 py-1.5 text-left font-medium"
                  onClick={() => toggleSort("created_at")}
                >
                  <span className="inline-flex items-center">
                    Registro
                    <SortIcon field="created_at" />
                  </span>
                </th>
                <th
                  className="cursor-pointer select-none px-2 py-1.5 text-right font-medium"
                  onClick={() => toggleSort("activeProperties")}
                >
                  <span className="inline-flex items-center justify-end">
                    Props
                    <SortIcon field="activeProperties" />
                  </span>
                </th>
                <th
                  className="cursor-pointer select-none px-2 py-1.5 text-right font-medium"
                  onClick={() => toggleSort("totalLeads")}
                >
                  <span className="inline-flex items-center justify-end">
                    Leads
                    <SortIcon field="totalLeads" />
                  </span>
                </th>
                <th
                  className="cursor-pointer select-none px-2 py-1.5 text-right font-medium"
                  onClick={() => toggleSort("totalVisitas")}
                >
                  <span className="inline-flex items-center justify-end">
                    Visitas
                    <SortIcon field="totalVisitas" />
                  </span>
                </th>
                <th
                  className="cursor-pointer select-none px-2 py-1.5 text-right font-medium"
                  onClick={() => toggleSort("totalViews")}
                >
                  <span className="inline-flex items-center justify-end">
                    Views
                    <SortIcon field="totalViews" />
                  </span>
                </th>
                <th className="px-2 py-1.5 text-center font-medium">Sync</th>
                <th className="px-2 py-1.5 text-center font-medium">Hoggax</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-border/30 transition-colors hover:bg-muted/30"
                >
                  {/* Inmobiliaria info */}
                  <td className="py-1.5 pr-2">
                    <div className="flex min-w-0 items-center gap-2">
                      {row.logo ? (
                        <Image
                          src={row.logo}
                          alt=""
                          width={24}
                          height={24}
                          className="shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground">
                          {(row.name ?? row.email).charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate text-sm font-medium">
                          {row.name ?? "Sin nombre"}
                        </span>
                        <span className="max-w-[200px] truncate text-[10px] text-muted-foreground">
                          {row.email}
                          {row.telefono && (
                            <>
                              {" "}
                              &middot;{" "}
                              {row.telefono_country_code
                                ? `+${row.telefono_country_code.replace("+", "")} `
                                : ""}
                              {row.telefono}
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Account type */}
                  <td className="px-2 py-1.5">
                    <Badge
                      variant="secondary"
                      className="px-1.5 py-0 text-[10px]"
                    >
                      {row.account_type === 4 ? "Red" : "Inmob."}
                    </Badge>
                  </td>

                  {/* Signup date */}
                  <td className="whitespace-nowrap px-2 py-1.5 tabular-nums text-muted-foreground">
                    {new Date(row.created_at).toLocaleDateString("es-AR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "2-digit",
                    })}
                  </td>

                  {/* Active properties */}
                  <td className="px-2 py-1.5 text-right tabular-nums">
                    {fmt(row.activeProperties)}
                    {row.draftProperties > 0 && (
                      <span className="ml-0.5 text-muted-foreground">
                        +{row.draftProperties}b
                      </span>
                    )}
                  </td>

                  {/* Leads */}
                  <td className="px-2 py-1.5 text-right tabular-nums">
                    {fmt(row.totalLeads)}
                  </td>

                  {/* Visitas */}
                  <td
                    className="px-2 py-1.5 text-right tabular-nums"
                    title={`Pendientes: ${row.visitasPending} · Aceptadas: ${row.visitasAccepted} · Completadas: ${row.visitasCompleted}`}
                  >
                    {fmt(row.totalVisitas)}
                  </td>

                  {/* Views */}
                  <td className="px-2 py-1.5 text-right tabular-nums">
                    {fmt(row.totalViews)}
                  </td>

                  {/* Sync status */}
                  <td className="px-2 py-1.5 text-center">
                    {row.tokko_last_sync_at ? (
                      <span
                        className={`inline-block h-2 w-2 rounded-full ${
                          row.sync_status === "completed"
                            ? "bg-green-500"
                            : row.sync_status === "syncing"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        }`}
                        title={`${row.sync_status} · ${new Date(row.tokko_last_sync_at).toLocaleDateString("es-AR")}`}
                      />
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>

                  {/* Hoggax */}
                  <td className="px-2 py-1.5 text-center">
                    {row.hoggax_approved === true ? (
                      <span
                        className="inline-block h-2 w-2 rounded-full bg-green-500"
                        title="Aprobado"
                      />
                    ) : row.hoggax_approved === false ? (
                      <span
                        className="inline-block h-2 w-2 rounded-full bg-red-500"
                        title="Rechazado"
                      />
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary footer */}
      <div className="pt-3 text-xs text-muted-foreground">
        {fmt(filtered.length)} inmobiliaria
        {filtered.length !== 1 ? "s" : ""}
        {search && ` de ${fmt(data.length)}`}
      </div>
    </div>
  );
}
