"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AdminSelect } from "@/components/admin/AdminSelect";
import type { PropertyEngagementRow } from "@/lib/admin/queries";

type SortField = "views" | "submits_started" | "submits" | "unique_visitors";

interface TopPropertiesTableProps {
  data: PropertyEngagementRow[];
}

export default function TopPropertiesTable({ data }: TopPropertiesTableProps) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortField>("views");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const result = term
      ? data.filter(
          (row) =>
            (row.address && row.address.toLowerCase().includes(term)) ||
            (row.location_name && row.location_name.toLowerCase().includes(term))
        )
      : data;
    return [...result].sort((a, b) => b[sortBy] - a[sortBy]);
  }, [data, search, sortBy]);

  const fmt = (n: number) => n.toLocaleString("es-AR");

  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        Sin datos de interacción en este período.
      </p>
    );
  }

  return (
    <div>
      {/* Filter bar */}
      <div className="flex items-center gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por dirección o ubicación..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-8 h-8 text-sm"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <AdminSelect
          value={sortBy}
          onChange={(v) => setSortBy(v as SortField)}
          options={[
            { value: "views", label: "Vistas" },
            { value: "submits_started", label: "Envíos iniciados" },
            { value: "submits", label: "Completados" },
            { value: "unique_visitors", label: "Visitantes únicos" },
          ]}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          Sin resultados para &ldquo;{search}&rdquo;
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="py-1 pr-2 text-left font-medium">Propiedad</th>
                <th className="py-1 px-2 text-right font-medium">Vistas</th>
                <th className="py-1 px-2 text-right font-medium">Envío inic.</th>
                <th className="py-1 px-2 text-right font-medium">Completado</th>
                <th className="py-1 px-2 text-right font-medium">Visitantes</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr
                  key={row.property_id}
                  className="border-b border-border/30 hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  <td className="py-1.5 pr-2">
                    <Link
                      href={`/admin/properties/${row.property_id}`}
                      className="hover:underline font-medium"
                    >
                      {row.address ?? `#${row.property_id}`}
                    </Link>
                    {row.location_name && (
                      <span className="ml-1.5 text-[10px] text-muted-foreground">
                        {row.location_name}
                      </span>
                    )}
                  </td>
                  <td className="py-1.5 px-2 text-right tabular-nums">{fmt(row.views)}</td>
                  <td className="py-1.5 px-2 text-right tabular-nums">{fmt(row.submits_started)}</td>
                  <td className="py-1.5 px-2 text-right tabular-nums">{fmt(row.submits)}</td>
                  <td className="py-1.5 px-2 text-right tabular-nums">{fmt(row.unique_visitors)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
