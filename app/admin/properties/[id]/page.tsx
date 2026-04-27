import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Eye, Send, ShieldCheck, CheckCircle, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/admin/KpiCard";
import { PropertyEventsTable } from "@/components/admin/PropertyEventsTable";
import { supabaseAdmin } from "@/lib/supabase/server";
import {
  getPropertyEventStats,
  getPropertyRecentEvents,
  getPropertyAttributionBreakdown,
} from "@/lib/admin/queries";

function parsePeriod(raw: string | undefined): number | null {
  if (!raw || raw === "all") return null;
  const n = parseInt(raw, 10);
  return isNaN(n) ? 30 : n;
}

export default async function PropertyDetailAdminPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ period?: string; eventsPage?: string }>;
}) {
  const { id: rawId } = await params;
  const propertyId = parseInt(rawId, 10);
  if (isNaN(propertyId)) notFound();

  const { period: rawPeriod, eventsPage: rawEventsPage } = await searchParams;
  const periodDays = parsePeriod(rawPeriod);
  const cutoff = periodDays
    ? new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString()
    : "2020-01-01T00:00:00Z";

  const eventsPage = Math.max(1, parseInt(rawEventsPage ?? "1", 10) || 1);

  // Fetch property info + analytics in parallel
  const [propertyResult, stats, eventsResult, attribution] = await Promise.all([
    supabaseAdmin
      .from("properties_read")
      .select("property_id, address, location_name, parent_location_name, slug, property_type_name, cover_photo_thumb, owner_name, user_id")
      .eq("property_id", propertyId)
      .maybeSingle(),
    getPropertyEventStats(propertyId, cutoff),
    getPropertyRecentEvents(propertyId, eventsPage, 50),
    getPropertyAttributionBreakdown(propertyId, cutoff),
  ]);

  const property = propertyResult.data;
  if (!property) notFound();

  const { totals } = stats;
  const verifCompletionRate =
    totals.verifications_requested > 0
      ? ((totals.submits / totals.verifications_requested) * 100).toFixed(1)
      : "–";

  const periodLabel = periodDays ? `últimos ${periodDays} días` : "todo";

  // Funnel data
  const funnelSteps = [
    { label: "Vistas", value: totals.views },
    { label: "Envío iniciado", value: totals.submits_started },
    { label: "Verificación", value: totals.verifications_requested },
    { label: "Completado", value: totals.submits },
  ];
  const funnelMax = Math.max(...funnelSteps.map((s) => s.value), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link
          href="/admin"
          className="mt-1 h-8 w-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold tracking-tight truncate">
            {property.address || `Propiedad #${propertyId}`}
          </h1>
          <p className="text-sm text-muted-foreground">
            {[property.location_name, property.parent_location_name].filter(Boolean).join(", ")}
            {property.property_type_name && ` · ${property.property_type_name}`}
            {property.owner_name && ` · ${property.owner_name}`}
          </p>
          <div className="flex gap-2 mt-1">
            {property.slug && (
              <Link
                href={`/propiedad/${property.slug}`}
                className="text-xs text-primary hover:underline"
                target="_blank"
              >
                Ver publicación →
              </Link>
            )}
            <span className="text-xs text-muted-foreground">Período: {periodLabel}</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiCard icon={Eye} label="Vistas" value={totals.views} />
        <KpiCard icon={Send} label="Envíos" value={totals.submits_started} />
        <KpiCard icon={ShieldCheck} label="Verificaciones" value={totals.verifications_requested} />
        <KpiCard icon={CheckCircle} label="Completados" value={totals.submits} />
        <KpiCard icon={Users} label="Visitantes únicos" value={totals.unique_visitors} subtitle={verifCompletionRate !== "–" ? `${verifCompletionRate}% verif.` : undefined} />
      </div>

      {/* Funnel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Funnel de conversión</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {funnelSteps.map((step, i) => {
              const width = (step.value / funnelMax) * 100;
              const prev = i > 0 ? funnelSteps[i - 1].value : null;
              const dropoff =
                prev && prev > 0 ? `${((step.value / prev) * 100).toFixed(0)}%` : null;
              return (
                <div key={step.label} className="flex items-center gap-3">
                  <span className="w-28 text-right text-xs text-muted-foreground shrink-0">
                    {step.label}
                  </span>
                  <div className="flex-1 h-7 bg-muted rounded relative overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-primary/70 rounded transition-all"
                      style={{ width: `${Math.max(width, 1)}%` }}
                    />
                    <span className="absolute inset-0 flex items-center justify-end pr-2 text-xs font-medium tabular-nums">
                      {step.value.toLocaleString("es-AR")}
                      {dropoff && (
                        <span className="ml-1 text-muted-foreground">({dropoff})</span>
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Attribution Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Atribución de envíos</CardTitle>
          </CardHeader>
          <CardContent>
            {totals.submits === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Sin envíos completados en este período.
              </p>
            ) : (
              <div className="space-y-3">
                {[
                  { label: "Sesión directa", value: attribution.direct_session, color: "bg-green-500" },
                  { label: "Recuperado via usuario", value: attribution.recovered_via_user, color: "bg-blue-500" },
                  { label: "No atribuido", value: attribution.unattributed, color: "bg-muted-foreground" },
                ].map((item) => {
                  const total = attribution.direct_session + attribution.recovered_via_user + attribution.unattributed;
                  const pct = total > 0 ? ((item.value / total) * 100).toFixed(0) : "0";
                  return (
                    <div key={item.label} className="flex items-center gap-3">
                      <div className={`h-3 w-3 rounded-full ${item.color} shrink-0`} />
                      <span className="flex-1 text-sm">{item.label}</span>
                      <span className="text-sm font-medium tabular-nums">{item.value}</span>
                      <span className="text-xs text-muted-foreground tabular-nums w-10 text-right">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Daily Time Series */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Eventos por día</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.daily.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Sin datos en este período.
              </p>
            ) : (
              <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-background">
                    <tr className="border-b text-muted-foreground">
                      <th className="py-1 pr-2 text-left font-medium">Fecha</th>
                      <th className="py-1 px-1 text-right font-medium">Vistas</th>
                      <th className="py-1 px-1 text-right font-medium">Envíos</th>
                      <th className="py-1 px-1 text-right font-medium">Verif.</th>
                      <th className="py-1 pl-1 text-right font-medium">Comp.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.daily.map((day) => (
                      <tr key={day.date} className="border-b border-border/30">
                        <td className="py-1 pr-2 tabular-nums">{day.date}</td>
                        <td className="py-1 px-1 text-right tabular-nums">{day.views}</td>
                        <td className="py-1 px-1 text-right tabular-nums">{day.submits_started}</td>
                        <td className="py-1 px-1 text-right tabular-nums">{day.verifications_requested}</td>
                        <td className="py-1 pl-1 text-right tabular-nums">{day.submits}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Events */}
      <PropertyEventsTable
        events={eventsResult.events}
        total={eventsResult.total}
        currentPage={eventsPage}
        pageSize={50}
      />
    </div>
  );
}
