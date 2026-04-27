"use client";

import { useState, useRef, useEffect, Fragment } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, User, Globe, Search, X } from "lucide-react";
import { AnimateHeight } from "@/components/ui/animate-height";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminSelect } from "@/components/admin/AdminSelect";
import type { UserEventRow, UserPropertyBreakdownRow } from "@/lib/admin/queries";

interface TopUsersTableProps {
  data: UserEventRow[];
  breakdowns: Record<string, UserPropertyBreakdownRow[]>;
  totalActors: number;
  currentPage: number;
  pageSize: number;
  currentSearch: string;
  currentUsersType: "all" | "auth" | "anon";
}

export default function TopUsersTable({
  data,
  breakdowns,
  totalActors,
  currentPage,
  pageSize,
  currentSearch,
  currentUsersType,
}: TopUsersTableProps) {
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const [searchValue, setSearchValue] = useState(currentSearch);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();
  const params = useSearchParams();

  // Keep local state in sync with server prop
  useEffect(() => {
    setSearchValue(currentSearch);
  }, [currentSearch]);

  function applySearch(value: string) {
    const sp = new URLSearchParams(params.toString());
    if (value.trim()) {
      sp.set("usersSearch", value.trim());
    } else {
      sp.delete("usersSearch");
    }
    sp.delete("usersPage"); // reset to page 1 on new search
    router.replace(`?${sp.toString()}`, { scroll: false });
  }

  function handleSearchChange(value: string) {
    setSearchValue(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => applySearch(value), 400);
  }

  function clearSearch() {
    setSearchValue("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    applySearch("");
  }

  function applyUsersType(value: string) {
    const sp = new URLSearchParams(params.toString());
    if (value && value !== "all") {
      sp.set("usersType", value);
    } else {
      sp.delete("usersType");
    }
    sp.delete("usersPage");
    router.replace(`?${sp.toString()}`, { scroll: false });
  }

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

  if (data.length === 0 && !currentSearch) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        Sin datos de interacción en este período.
      </p>
    );
  }

  const fmt = (n: number) => n.toLocaleString("es-AR");

  return (
    <div>
      {/* Filter bar */}
      <div className="flex items-center gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-8 pr-8 h-8 text-sm"
          />
          {searchValue && (
            <button
              onClick={clearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <AdminSelect
          value={currentUsersType}
          onChange={applyUsersType}
          options={[
            { value: "all", label: "Todos" },
            { value: "auth", label: "Autenticados" },
            { value: "anon", label: "Anónimos" },
          ]}
        />
      </div>

      {data.length === 0 && currentSearch ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          Sin resultados para &ldquo;{currentSearch}&rdquo;
        </p>
      ) : (
      <>
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
                      <div className="flex items-start gap-1.5 min-w-0">
                        {row.isAuthenticated ? (
                          <User className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        ) : (
                          <Globe className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className="truncate">{row.displayName}</span>
                          {(row.email || row.phone) && (
                            <div className="flex items-center gap-2 flex-wrap">
                              {row.email && (
                                <span className="text-[10px] text-muted-foreground truncate max-w-[160px]">
                                  {row.email}
                                </span>
                              )}
                              {row.phone && (() => {
                                const waHref = row.phone_country_code
                                  ? `https://wa.me/${row.phone_country_code.replace("+", "")}${row.phone}`
                                  : `https://wa.me/${row.phone}`;
                                return (
                                  <a
                                    href={waHref}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-[10px] text-green-600 hover:text-green-700 hover:underline whitespace-nowrap"
                                  >
                                    {row.phone_country_code
                                      ? `+${row.phone_country_code.replace("+", "")} ${row.phone}`
                                      : row.phone}
                                  </a>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                      </div>
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
      </>
      )}
    </div>
  );
}
