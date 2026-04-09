import { Suspense } from "react";
import {
  Users,
  Building2,
  MessageSquare,
  CalendarCheck,
  Heart,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/admin/KpiCard";
import { PeriodSelector } from "@/components/admin/PeriodSelector";
import { FunnelChart } from "@/components/admin/FunnelChart";
import { SignupsChart } from "@/components/admin/charts/SignupsChart";
import { SignupsCumulativeChart } from "@/components/admin/charts/SignupsCumulativeChart";
import { PropertiesChart } from "@/components/admin/charts/PropertiesChart";
import { PropertiesCumulativeChart } from "@/components/admin/charts/PropertiesCumulativeChart";
import { PropertyTypeBar } from "@/components/admin/charts/PropertyTypeBar";
import { LocationBar } from "@/components/admin/charts/LocationBar";
import { LeadsChart } from "@/components/admin/charts/LeadsChart";
import { PlanDonut } from "@/components/admin/charts/PlanDonut";
import { SyncHealthChart } from "@/components/admin/charts/SyncHealthChart";
import { CronJobChart } from "@/components/admin/charts/CronJobChart";
import {
  getKpis,
  getSignupsByDay,
  getNewPropertiesByDay,
  getPropertiesByType,
  getPropertiesByLocation,
  getLeadsByDay,
  getConversionFunnel,
  getPlanDistribution,
  getPriceStats,
  getSyncHealth,
  getCronJobHealth,
} from "@/lib/admin/queries";

function parsePeriod(raw: string | undefined): number | null {
  if (!raw || raw === "all") return null;
  const n = parseInt(raw, 10);
  return isNaN(n) ? 30 : n;
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { period: rawPeriod } = await searchParams;
  const periodDays = parsePeriod(rawPeriod);

  // Fetch all data in parallel
  const [
    kpis,
    signups,
    newProperties,
    propertyTypes,
    locations,
    leads,
    funnel,
    plans,
    prices,
    sync,
    visitasCron,
    exchangeRateCron,
  ] = await Promise.all([
    getKpis(periodDays),
    getSignupsByDay(periodDays),
    getNewPropertiesByDay(periodDays),
    getPropertiesByType(),
    getPropertiesByLocation(),
    getLeadsByDay(periodDays),
    getConversionFunnel(),
    getPlanDistribution(),
    getPriceStats(),
    getSyncHealth(),
    getCronJobHealth("visitas"),
    getCronJobHealth("exchange-rate"),
  ]);

  const periodLabel = periodDays ? `últimos ${periodDays} días` : "todo el tiempo";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Métricas de {periodLabel}
          </p>
        </div>
        <Suspense>
          <PeriodSelector />
        </Suspense>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <KpiCard
          icon={Users}
          label="Usuarios"
          value={kpis.totalUsers}
          subtitle={`+${kpis.newUsers} en periodo`}
        />
        <KpiCard
          icon={Building2}
          label="Propiedades activas"
          value={kpis.activeProperties}
          subtitle={`${kpis.draftProperties} borrador · ${kpis.pausedProperties} pausadas`}
        />
        <KpiCard
          icon={MessageSquare}
          label="Leads"
          value={kpis.periodLeads}
          subtitle={`${kpis.totalLeads} total`}
        />
        <KpiCard
          icon={CalendarCheck}
          label="Visitas"
          value={kpis.periodVisitas}
          subtitle={`${kpis.totalVisitas} total`}
        />
        <KpiCard
          icon={Heart}
          label="Favoritos"
          value={kpis.periodFavoritos}
          subtitle={`${kpis.totalFavoritos} total`}
        />
        <KpiCard
          icon={ShieldCheck}
          label="Verificaciones"
          value={kpis.verifHoggaxApproved + kpis.verifTruoraVerified}
          subtitle={`Hoggax: ${kpis.verifHoggaxApproved}/${kpis.verifHoggaxTotal} · Truora: ${kpis.verifTruoraVerified}/${kpis.verifTruoraTotal}`}
        />
      </div>

      {/* User Registration Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Registro de usuarios por día</CardTitle>
          </CardHeader>
          <CardContent>
            <SignupsChart data={signups} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Registro de usuarios acumulado</CardTitle>
          </CardHeader>
          <CardContent>
            <SignupsCumulativeChart data={signups} />
          </CardContent>
        </Card>
      </div>

      {/* Inventory */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Por tipo de propiedad</CardTitle>
          </CardHeader>
          <CardContent>
            <PropertyTypeBar data={propertyTypes} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              Por ubicación (top 15)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LocationBar data={locations} />
          </CardContent>
        </Card>
      </div>

      {/* Property Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Nuevas propiedades por día</CardTitle>
          </CardHeader>
          <CardContent>
            <PropertiesChart data={newProperties} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total propiedades acumulado</CardTitle>
          </CardHeader>
          <CardContent>
            <PropertiesCumulativeChart data={newProperties} />
          </CardContent>
        </Card>
      </div>

      {/* Engagement */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Leads por día</CardTitle>
        </CardHeader>
        <CardContent>
          <LeadsChart data={leads} />
        </CardContent>
      </Card>

      {/* Conversion */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Embudo de conversión</CardTitle>
        </CardHeader>
        <CardContent>
          <FunnelChart data={funnel} />
        </CardContent>
      </Card>

      {/* Revenue & Plans */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Distribución de planes</CardTitle>
          </CardHeader>
          <CardContent>
            <PlanDonut data={plans} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Precios por moneda</CardTitle>
          </CardHeader>
          <CardContent>
            {prices.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Sin datos de precios
              </p>
            ) : (
              <div className="space-y-4">
                {prices.map((p) => (
                  <div key={p.currency} className="rounded-lg border p-4">
                    <div className="mb-2 text-sm font-medium">{p.currency}</div>
                    <div className="grid grid-cols-4 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Propiedades</p>
                        <p className="font-medium tabular-nums">
                          {p.count.toLocaleString("es-AR")}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Promedio</p>
                        <p className="font-medium tabular-nums">
                          ${p.avg.toLocaleString("es-AR")}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Mínimo</p>
                        <p className="font-medium tabular-nums">
                          ${p.min.toLocaleString("es-AR")}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Máximo</p>
                        <p className="font-medium tabular-nums">
                          ${p.max.toLocaleString("es-AR")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cron Health */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">
          Salud de crons (7 días)
        </h2>
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Tokko Sync */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Tokko sync</CardTitle>
                {sync.lastSync && (
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${
                      sync.lastSync.status === "completed"
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  />
                )}
              </div>
              {sync.lastSync && (
                <p className="text-xs text-muted-foreground">
                  {new Date(sync.lastSync.finishedAt).toLocaleString("es-AR", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
            </CardHeader>
            <CardContent>
              <SyncHealthChart data={sync.days} />
            </CardContent>
          </Card>

          {/* Visitas cron */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Cron visitas</CardTitle>
                {visitasCron.lastRun && (
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${
                      visitasCron.lastRun.status === "completed"
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  />
                )}
              </div>
              {visitasCron.lastRun && (
                <p className="text-xs text-muted-foreground">
                  {new Date(visitasCron.lastRun.finishedAt).toLocaleString(
                    "es-AR",
                    {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </p>
              )}
            </CardHeader>
            <CardContent>
              <CronJobChart data={visitasCron.days} />
            </CardContent>
          </Card>

          {/* Exchange rate cron */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Cron tipo de cambio</CardTitle>
                {exchangeRateCron.lastRun && (
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${
                      exchangeRateCron.lastRun.status === "completed"
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  />
                )}
              </div>
              {exchangeRateCron.lastRun && (
                <p className="text-xs text-muted-foreground">
                  {new Date(exchangeRateCron.lastRun.finishedAt).toLocaleString(
                    "es-AR",
                    {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                  {exchangeRateCron.lastRun.stats &&
                    "rate" in exchangeRateCron.lastRun.stats && (
                      <>
                        {" "}
                        · $
                        {Number(
                          exchangeRateCron.lastRun.stats.rate
                        ).toLocaleString("es-AR")}
                      </>
                    )}
                </p>
              )}
            </CardHeader>
            <CardContent>
              <CronJobChart data={exchangeRateCron.days} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
