"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminSelect } from "@/components/admin/AdminSelect";
import type { PropertyRecentEvent } from "@/lib/admin/queries";

const EVENT_LABELS: Record<string, string> = {
  property_view: "Vista",
  agendar_visita_submit_started: "Envío iniciado",
  agendar_visita_verification_requested: "Verificación",
  agendar_visita_submit: "Visita creada",
};

type SortCol = "created_at" | "event_type" | "user";
type SortState = { col: SortCol; dir: "asc" | "desc" } | null;

interface PropertyEventsTableProps {
  events: PropertyRecentEvent[];
  total: number;
  currentPage: number;
  pageSize: number;
  currentEventsType: string;
  currentAttribution: string;
  currentEventsUserType: string;
}

function getDisplayName(event: PropertyRecentEvent): string {
  return event.user_name ?? (event.user_id ? event.user_id.slice(0, 8) : "Anónimo");
}

export function PropertyEventsTable({
  events,
  total,
  currentPage,
  pageSize,
  currentEventsType,
  currentAttribution,
  currentEventsUserType,
}: PropertyEventsTableProps) {
  const router = useRouter();
  const params = useSearchParams();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const [sort, setSort] = useState<SortState>(null);

  const sortedEvents = useMemo(() => {
    if (!sort) return events;
    const { col, dir } = sort;
    const mul = dir === "asc" ? 1 : -1;
    return [...events].sort((a, b) => {
      let av: string, bv: string;
      if (col === "created_at") {
        av = a.created_at;
        bv = b.created_at;
      } else if (col === "event_type") {
        av = EVENT_LABELS[a.event_type] ?? a.event_type;
        bv = EVENT_LABELS[b.event_type] ?? b.event_type;
      } else {
        av = getDisplayName(a).toLowerCase();
        bv = getDisplayName(b).toLowerCase();
      }
      return av < bv ? -mul : av > bv ? mul : 0;
    });
  }, [events, sort]);

  function handleSort(col: SortCol) {
    setSort((prev) => {
      if (prev?.col !== col) return { col, dir: "asc" };
      if (prev.dir === "asc") return { col, dir: "desc" };
      return null; // third click → no sort
    });
  }

  function SortIcon({ col }: { col: SortCol }) {
    if (sort?.col !== col) return <ChevronsUpDown className="h-3 w-3 opacity-40 inline ml-1" />;
    if (sort.dir === "asc") return <ChevronUp className="h-3 w-3 inline ml-1" />;
    return <ChevronDown className="h-3 w-3 inline ml-1" />;
  }

  function goToPage(p: number) {
    const sp = new URLSearchParams(params.toString());
    if (p <= 1) sp.delete("eventsPage");
    else sp.set("eventsPage", String(p));
    router.replace(`?${sp.toString()}`, { scroll: false });
  }

  function applyFilter(param: string, value: string) {
    const sp = new URLSearchParams(params.toString());
    if (value && value !== "all") {
      sp.set(param, value);
    } else {
      sp.delete(param);
    }
    sp.delete("eventsPage");
    router.replace(`?${sp.toString()}`, { scroll: false });
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
        {/* Filter bar */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <AdminSelect
            value={currentEventsType}
            onChange={(v) => applyFilter("eventsType", v)}
            options={[
              { value: "all", label: "Tipo: Todos" },
              { value: "property_view", label: "Vista" },
              { value: "agendar_visita_submit_started", label: "Envío iniciado" },
              { value: "agendar_visita_verification_requested", label: "Verificación" },
              { value: "agendar_visita_submit", label: "Visita creada" },
            ]}
          />
          <AdminSelect
            value={currentAttribution}
            onChange={(v) => applyFilter("eventsAttribution", v)}
            options={[
              { value: "all", label: "Atribución: Todas" },
              { value: "direct_session", label: "Sesión directa" },
              { value: "recovered_via_user", label: "Recuperado" },
              { value: "unattributed", label: "No atribuido" },
            ]}
          />
          <AdminSelect
            value={currentEventsUserType}
            onChange={(v) => applyFilter("eventsUserType", v)}
            options={[
              { value: "all", label: "Usuario: Todos" },
              { value: "auth", label: "Autenticados" },
              { value: "anon", label: "Anónimos" },
            ]}
          />
        </div>

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
                    <th className="py-1 px-2 text-left font-medium">
                      <button
                        onClick={() => handleSort("user")}
                        className="flex items-center gap-0.5 hover:text-foreground transition-colors"
                      >
                        Usuario <SortIcon col="user" />
                      </button>
                    </th>
                    <th className="py-1 px-2 text-left font-medium">Session</th>
                    <th className="py-1 pl-2 text-left font-medium">Atribución</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedEvents.map((event) => {
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
                              {getDisplayName(event)}
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
