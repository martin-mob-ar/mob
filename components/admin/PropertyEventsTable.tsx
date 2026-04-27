"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PropertyRecentEvent } from "@/lib/admin/queries";

const EVENT_LABELS: Record<string, string> = {
  property_view: "Vista",
  agendar_visita_submit_started: "Envío iniciado",
  agendar_visita_verification_requested: "Verificación",
  agendar_visita_submit: "Visita creada",
};

interface PropertyEventsTableProps {
  events: PropertyRecentEvent[];
  total: number;
  currentPage: number;
  pageSize: number;
  sortCol: "created_at" | "event_type";
  sortDir: "asc" | "desc";
}

export function PropertyEventsTable({
  events,
  total,
  currentPage,
  pageSize,
  sortCol,
  sortDir,
}: PropertyEventsTableProps) {
  const router = useRouter();
  const params = useSearchParams();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function updateParams(updates: Record<string, string | null>) {
    const sp = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null) sp.delete(key);
      else sp.set(key, value);
    }
    router.replace(`?${sp.toString()}`, { scroll: false });
  }

  function goToPage(p: number) {
    updateParams({ eventsPage: p <= 1 ? null : String(p) });
  }

  function handleSort(col: "created_at" | "event_type") {
    if (sortCol === col) {
      // Toggle direction
      const newDir = sortDir === "desc" ? "asc" : "desc";
      updateParams({
        eventsSort: col === "created_at" ? null : col,
        eventsDir: newDir === "desc" ? null : "asc",
        eventsPage: null, // reset to page 1
      });
    } else {
      // Switch column, default desc
      updateParams({
        eventsSort: col === "created_at" ? null : col,
        eventsDir: null,
        eventsPage: null,
      });
    }
  }

  function SortIcon({ col }: { col: "created_at" | "event_type" }) {
    if (sortCol !== col) return <ChevronsUpDown className="h-3 w-3 opacity-40 inline ml-1" />;
    if (sortDir === "asc") return <ChevronUp className="h-3 w-3 inline ml-1" />;
    return <ChevronDown className="h-3 w-3 inline ml-1" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Eventos recientes
          {total > 0 && (
            <span className="ml-2 text-xs font-normal text-muted-foreground tabular-nums">
              {total.toLocaleString("es-AR")} total
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 && total === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Sin eventos registrados.
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="py-1 pr-2 text-left font-medium">
                      <button
                        onClick={() => handleSort("created_at")}
                        className="flex items-center gap-0.5 hover:text-foreground transition-colors"
                      >
                        Fecha <SortIcon col="created_at" />
                      </button>
                    </th>
                    <th className="py-1 px-2 text-left font-medium">
                      <button
                        onClick={() => handleSort("event_type")}
                        className="flex items-center gap-0.5 hover:text-foreground transition-colors"
                      >
                        Tipo <SortIcon col="event_type" />
                      </button>
                    </th>
                    <th className="py-1 px-2 text-left font-medium">Usuario</th>
                    <th className="py-1 px-2 text-left font-medium">Session</th>
                    <th className="py-1 pl-2 text-left font-medium">Atribución</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => {
                    const attrStatus = event.metadata?.attribution_status;
                    const waHref =
                      event.user_phone && event.user_phone_country_code
                        ? `https://wa.me/${event.user_phone_country_code.replace("+", "")}${event.user_phone}`
                        : event.user_phone
                        ? `https://wa.me/${event.user_phone}`
                        : null;

                    return (
                      <tr key={event.id} className="border-b border-border/30">
                        <td className="py-1.5 pr-2 tabular-nums whitespace-nowrap">
                          {new Date(event.created_at).toLocaleString("es-AR", {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            timeZone: "America/Argentina/Buenos_Aires",
                          })}
                        </td>
                        <td className="py-1.5 px-2">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted whitespace-nowrap">
                            {EVENT_LABELS[event.event_type] ?? event.event_type}
                          </span>
                        </td>
                        <td className="py-1.5 px-2">
                          <div className="flex flex-col gap-0.5 min-w-0">
                            <span className="truncate max-w-[160px]">
                              {event.user_name ?? (event.user_id ? event.user_id.slice(0, 8) : "Anónimo")}
                            </span>
                            {event.user_id && (
                              <div className="flex items-center gap-2 flex-wrap">
                                {event.user_email && (
                                  <span className="text-[10px] text-muted-foreground truncate max-w-[160px]">
                                    {event.user_email}
                                  </span>
                                )}
                                {waHref && (
                                  <a
                                    href={waHref}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] text-green-600 hover:text-green-700 hover:underline whitespace-nowrap"
                                  >
                                    {event.user_phone_country_code
                                      ? `+${event.user_phone_country_code.replace("+", "")} ${event.user_phone}`
                                      : event.user_phone}
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-1.5 px-2 text-muted-foreground tabular-nums">
                          {event.session_id?.slice(0, 8) ?? "–"}
                        </td>
                        <td className="py-1.5 pl-2 text-muted-foreground whitespace-nowrap">
                          {attrStatus ? String(attrStatus).replace(/_/g, " ") : "–"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 text-xs text-muted-foreground">
                <span>
                  {total.toLocaleString("es-AR")} evento{total !== 1 ? "s" : ""} · página {currentPage} de {totalPages}
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
          </>
        )}
      </CardContent>
    </Card>
  );
}
