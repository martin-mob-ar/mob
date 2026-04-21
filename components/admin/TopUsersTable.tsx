"use client";

import { useState, Fragment } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, User, Globe } from "lucide-react";
import { AnimateHeight } from "@/components/ui/animate-height";
import { Button } from "@/components/ui/button";
import type { UserEventRow, UserPropertyBreakdownRow } from "@/lib/admin/queries";

interface TopUsersTableProps {
  data: UserEventRow[];
  breakdowns: Record<string, UserPropertyBreakdownRow[]>;
  totalActors: number;
  currentPage: number;
  pageSize: number;
}

export default function TopUsersTable({
  data,
  breakdowns,
  totalActors,
  currentPage,
  pageSize,
}: TopUsersTableProps) {
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const router = useRouter();
  const params = useSearchParams();

  const totalPages = Math.max(1, Math.ceil(totalActors / pageSize));

  function toggleExpand(key: string) {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function goToPage(p: number) {
    const sp = new URLSearchParams(params.toString());
    if (p <= 1) sp.delete("usersPage");
    else sp.set("usersPage", String(p));
    router.replace(`?${sp.toString()}`, { scroll: false });
  }

  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        Sin datos de interacción en este período.
      </p>
    );
  }

  const fmt = (n: number) => n.toLocaleString("es-AR");

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm table-fixed">
          <colgroup>
            <col className="w-6" />
            <col />
            <col className="w-20" />
            <col className="w-24" />
            <col className="w-24" />
            <col className="w-20" />
          </colgroup>
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="py-2 font-medium"></th>
              <th className="py-2 pr-3 font-medium">Usuario</th>
              <th className="py-2 px-2 font-medium text-right">Vistas</th>
              <th className="py-2 px-2 font-medium text-right">Envío inic.</th>
              <th className="py-2 px-2 font-medium text-right">Completado</th>
              <th className="py-2 px-2 font-medium text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => {
              const isExpanded = expandedKeys.has(row.actorKey);
              const propertyRows = breakdowns[row.actorKey] ?? [];

              return (
                <Fragment key={row.actorKey}>
                  {/* Main row */}
                  <tr
                    onClick={() => toggleExpand(row.actorKey)}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    <td className="py-2 pl-1">
                      <ChevronRight
                        className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${
                          isExpanded ? "rotate-90" : ""
                        }`}
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <span className="flex items-center gap-1.5 min-w-0">
                        {row.isAuthenticated ? (
                          <User className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                        ) : (
                          <Globe className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                        )}
                        <span className="truncate">{row.displayName}</span>
                      </span>
                    </td>
                    <td className="py-2 px-2 text-right tabular-nums">{fmt(row.property_view)}</td>
                    <td className="py-2 px-2 text-right tabular-nums">{fmt(row.agendar_visita_submit_started)}</td>
                    <td className="py-2 px-2 text-right tabular-nums">{fmt(row.agendar_visita_submit)}</td>
                    <td className="py-2 px-2 text-right tabular-nums font-semibold">{fmt(row.total)}</td>
                  </tr>

                  {/* Expanded property breakdown */}
                  <tr>
                    <td colSpan={6} className="p-0">
                      <AnimateHeight show={isExpanded}>
                        <div className="bg-muted/20 border-b border-border/50">
                          <table className="w-full text-xs table-fixed">
                            <colgroup>
                              <col />
                              <col className="w-20" />
                              <col className="w-24" />
                              <col className="w-24" />
                              <col className="w-20" />
                            </colgroup>
                            <thead>
                              <tr className="text-muted-foreground">
                                <th className="py-1.5 pl-10 pr-3 font-medium text-left">Propiedad</th>
                                <th className="py-1.5 px-2 font-medium text-right">Vistas</th>
                                <th className="py-1.5 px-2 font-medium text-right">Envío</th>
                                <th className="py-1.5 px-2 font-medium text-right">Comp.</th>
                                <th className="py-1.5 px-2 font-medium text-right">Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {propertyRows.map((prop) => (
                                <tr key={prop.property_id} className="border-t border-border/30 hover:bg-muted/30 transition-colors">
                                  <td className="py-1.5 pl-10 pr-3 truncate">
                                    <Link
                                      href={`/admin/properties/${prop.property_id}`}
                                      className="text-primary hover:underline"
                                    >
                                      {prop.address || `#${prop.property_id}`}
                                    </Link>
                                    {prop.location_name && (
                                      <span className="text-muted-foreground ml-1">
                                        · {prop.location_name}
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-1.5 px-2 text-right tabular-nums">{fmt(prop.property_view)}</td>
                                  <td className="py-1.5 px-2 text-right tabular-nums">{fmt(prop.agendar_visita_submit_started)}</td>
                                  <td className="py-1.5 px-2 text-right tabular-nums">{fmt(prop.agendar_visita_submit)}</td>
                                  <td className="py-1.5 px-2 text-right tabular-nums font-medium">{fmt(prop.total)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </AnimateHeight>
                    </td>
                  </tr>
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 text-sm text-muted-foreground">
          <span>
            {fmt(totalActors)} usuario{totalActors !== 1 ? "s" : ""} · página {currentPage} de {totalPages}
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => goToPage(currentPage - 1)}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => goToPage(currentPage + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
