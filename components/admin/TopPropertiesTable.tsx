"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { PropertyEngagementRow } from "@/lib/admin/queries";

interface TopPropertiesTableProps {
  data: PropertyEngagementRow[];
}

export default function TopPropertiesTable({ data }: TopPropertiesTableProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return data;
    return data.filter(
      (row) =>
        (row.address && row.address.toLowerCase().includes(term)) ||
        (row.location_name && row.location_name.toLowerCase().includes(term))
    );
  }, [data, search]);

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
      {/* Search input */}
      <div className="relative mb-3">
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

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          Sin resultados para &ldquo;{search}&rdquo;
        </p>
      ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-sm table-fixed">
          <colgroup>
            <col />
            <col className="w-20" />
            <col className="w-24" />
            <col className="w-24" />
            <col className="w-20" />
            <col className="w-24" />
          </colgroup>
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="py-2 pr-3 font-medium">Propiedad</th>
              <th className="py-2 px-2 font-medium text-right">Vistas</th>
              <th className="py-2 px-2 font-medium text-right">Envío inic.</th>
              <th className="py-2 px-2 font-medium text-right">Completado</th>
              <th className="py-2 px-2 font-medium text-right">Total</th>
              <th className="py-2 px-2 font-medium text-right">Visitantes</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => {
              const total = row.views + row.submits_started + row.verifications_requested + row.submits;
              return (
                <tr key={row.property_id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-2 pr-3 truncate">
                    <Link
                      href={`/admin/properties/${row.property_id}`}
                      className="text-primary hover:underline font-medium"
                    >
                      {row.address || `Propiedad #${row.property_id}`}
                    </Link>
                    {row.location_name && (
                      <span className="text-muted-foreground ml-1 text-xs">
                        · {row.location_name}
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-2 text-right tabular-nums">{fmt(row.views)}</td>
                  <td className="py-2 px-2 text-right tabular-nums">{fmt(row.submits_started)}</td>
                  <td className="py-2 px-2 text-right tabular-nums">{fmt(row.submits)}</td>
                  <td className="py-2 px-2 text-right tabular-nums font-semibold">{fmt(total)}</td>
                  <td className="py-2 px-2 text-right tabular-nums">{fmt(row.unique_visitors)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
}
