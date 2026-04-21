"use client";

import Link from "next/link";
import type { PropertyEngagementRow } from "@/lib/admin/queries";

interface TopPropertiesTableProps {
  data: PropertyEngagementRow[];
}

export default function TopPropertiesTable({ data }: TopPropertiesTableProps) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        Sin datos de interacción en este período.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="py-2 pr-3 font-medium">Propiedad</th>
            <th className="py-2 px-2 font-medium text-right tabular-nums">Vistas</th>
            <th className="py-2 px-2 font-medium text-right tabular-nums">Visitantes</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => {
            return (
              <tr key={row.property_id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                <td className="py-2 pr-3 max-w-[280px] truncate">
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
                <td className="py-2 px-2 text-right tabular-nums">{row.views.toLocaleString("es-AR")}</td>
                <td className="py-2 px-2 text-right tabular-nums">{row.unique_visitors.toLocaleString("es-AR")}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
