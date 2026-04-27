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
import { PlanDonutToggle } from "@/components/admin/charts/PlanDonutToggle";
import { SyncHealthChart } from "@/components/admin/charts/SyncHealthChart";
import { CronJobChart } from "@/components/admin/charts/CronJobChart";
import { CronStatChips, type StatChip } from "@/components/admin/CronStatChips";
import { CronRunLog, type CronRunColumn } from "@/components/admin/CronRunLog";
import TopPropertiesTable from "@/components/admin/TopPropertiesTable";
import TopUsersTable from "@/components/admin/TopUsersTable";
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
  getTopPropertiesByEngagement,
  getTopUsersByEvents,
} from "@/lib/admin/queries";

function parsePeriod(raw: string | undefined): number | null {
  if (!raw || raw === "all") return null;
  const n = parseInt(raw, 10);
  return isNaN(n) ? 30 : n;
}


export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; usersPage?: string; usersSearch?: string }>;
}) {
  const { period: rawPeriod, usersPage: rawUsersPage, usersSearch } = await searchParams;
  const periodDays = parsePeriod(rawPeriod);
  const usersPage = Math.max(1, parseInt(rawUsersPage ?? "1", 10) || 1);

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
    mailingCron,
    ipcCron,
    topProperties,
    topUsers,
  ] = await Promise.all([
    getKpis(periodDays),
    getSignupsByDay(periodDays),
    getNewPropertiesByDay(periodDays),
    getPropertiesByType(),
    getPropertiesByLocation(),
    getLeadsByDay(periodDays),
    getConversionFunnel(periodDays),
    getPlanDistribution(),
    getPriceStats(),
    getSyncHealth(),
    getCronJobHealth("visitas"),
    getCronJobHealth("exchange-rate"),
    getCronJobHealth("mailing-novedades"),
    getCronJobHealth("ipc"),
    getTopPropertiesByEngagement(
      periodDays
        ? new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString()
        : '2020-01-01T00:00:00Z',
      20,
    ),
    getTopUsersByEvents(periodDays, usersPage, 20, usersSearch),
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
          value={kpis.verifTotalUsers}
          subtitle={`Hoggax: ${kpis.verifHoggaxUsers} · Truora: ${kpis.verifTruoraUsers}`}
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
          <div className="flex items-baseline gap-2">
            <CardTitle className="text-base">Embudo de conversión</CardTitle>
            <span className="text-xs text-muted-foreground">desde 17 abr 2026</span>
          </div>
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
            <PlanDonutToggle todas={plans.todas} duenoDir={plans.duenoDir} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Precios de alquiler</CardTitle>
          </CardHeader>
          <CardContent>
            {prices.boxplots.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Sin datos de precios
              </p>
            ) : (
              <div className="space-y-6">
                {prices.boxplots.map(({ currency, boxplot: b }) => {
                  const range = b.whiskerHigh - b.whiskerLow;
                  const pct = (v: number) => Math.min(100, Math.max(0, ((v - b.whiskerLow) / range) * 100));
                  const fmt = (v: number) => `$${v.toLocaleString("es-AR")}`;
                  return (
                    <div key={currency} className="space-y-2">
                      <p className="text-sm font-medium">
                        {currency}{" "}
                        <span className="font-normal text-muted-foreground">
                          · {b.count.toLocaleString("es-AR")} propiedades · valor total en ARS
                        </span>
                      </p>
                      {/* Visual boxplot */}
                      <div className="relative mx-2 h-10">
                        <div className="absolute top-1/2 h-px w-full -translate-y-1/2 bg-muted-foreground/40" />
                        <div className="absolute left-0 top-1/2 h-4 w-px -translate-y-1/2 bg-muted-foreground/40" />
                        <div className="absolute right-0 top-1/2 h-4 w-px -translate-y-1/2 bg-muted-foreground/40" />
                        <div
                          className="absolute top-1/2 h-8 -translate-y-1/2 rounded-sm border border-blue-400 bg-blue-100 dark:border-blue-600 dark:bg-blue-950"
                          style={{ left: `${pct(b.q1)}%`, width: `${pct(b.q3) - pct(b.q1)}%` }}
                        />
                        <div
                          className="absolute top-1/2 h-8 w-0.5 -translate-y-1/2 bg-blue-600 dark:bg-blue-400"
                          style={{ left: `${pct(b.median)}%` }}
                        />
                      </div>
                      {/* Labels */}
                      <div className="grid grid-cols-5 gap-1 text-center text-xs">
                        <div>
                          <p className="text-muted-foreground">Mín</p>
                          <p className="font-medium tabular-nums">{fmt(b.whiskerLow)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Q1</p>
                          <p className="font-medium tabular-nums">{fmt(b.q1)}</p>
                        </div>
                        <div>
                          <p className="text-blue-600 dark:text-blue-400">Mediana</p>
                          <p className="font-semibold tabular-nums">{fmt(b.median)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Q3</p>
                          <p className="font-medium tabular-nums">{fmt(b.q3)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Máx</p>
                          <p className="font-medium tabular-nums">{fmt(b.whiskerHigh)}</p>
                        </div>
                      </div>
                      {b.outliers > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {b.outliers} ({Math.round((b.outliers / b.count) * 100)}%) outlier{b.outliers > 1 ? "s" : ""} fuera del rango
                        </p>
                      )}
                    </div>
                  );
                })}
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
                    timeZone: "America/Argentina/Buenos_Aires",
                  })}
                </p>
              )}
            </CardHeader>
            <CardContent>
              <CronStatChips chips={[
                { label: `+${sync.todayChips.propertiesAdded} nuevas hoy`, color: "green" },
                { label: `↺ ${sync.todayChips.propertiesUpdated} actualizadas hoy`, color: "blue" },
                { label: `✕ ${sync.todayChips.propertiesDeleted} eliminadas hoy`, color: "red" },
                { label: `+${sync.todayChips.photosAdded} fotos hoy`, color: "purple" },
              ] satisfies StatChip[]} />
              <SyncHealthChart data={sync.days} />
              <CronRunLog
                runs={sync.runs}
                columns={[
                  { header: "Hora",   field: "startedAt",        format: "time",  color: "text-sky-400" },
                  { header: "Nuevas", field: "propertiesAdded",                    color: "text-green-400" },
                  { header: "Act.",   field: "propertiesUpdated",                  color: "text-sky-300" },
                  { header: "Elim.",  field: "propertiesDeleted",                  color: "text-red-400" },
                  { header: "Fotos+", field: "photosAdded",                        color: "text-purple-400" },
                  { header: "Fotos−", field: "photosRemoved",                      color: "text-amber-400" },
                ] satisfies CronRunColumn[]}
              />
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
                      timeZone: "America/Argentina/Buenos_Aires",
                    }
                  )}
                </p>
              )}
            </CardHeader>
            <CardContent>
              <CronStatChips chips={[
                { label: `🔔 ${Number(visitasCron.todayChips.reminder24h ?? 0)} recordatorios 24h hoy`, color: "blue" },
                { label: `⏰ ${Number(visitasCron.todayChips.reminder2h ?? 0)} recordatorios 2h hoy`, color: "purple" },
                { label: `✅ ${Number(visitasCron.todayChips.postvisit ?? 0)} post-visita hoy`, color: "green" },
              ] satisfies StatChip[]} />
              <CronJobChart data={visitasCron.days} />
              <CronRunLog
                runs={visitasCron.runs}
                columns={[
                  { header: "Hora",        field: "startedAt", format: "time",  color: "text-sky-400" },
                  { header: "24h",         statsField: "reminder24h",            color: "text-sky-300" },
                  { header: "2h",          statsField: "reminder2h",             color: "text-purple-300" },
                  { header: "Post-visita", statsField: "postvisit",              color: "text-green-400" },
                ] satisfies CronRunColumn[]}
              />
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
                      timeZone: "America/Argentina/Buenos_Aires",
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
              <CronStatChips chips={[
                ...(exchangeRateCron.todayChips.rate != null
                  ? [{ label: `$ ${Number(exchangeRateCron.todayChips.rate).toLocaleString("es-AR")} ARS/USD hoy`, color: "green" as const }]
                  : []),
                ...(exchangeRateCron.todayChips.rebuilt != null
                  ? [{ label: `↺ ${Number(exchangeRateCron.todayChips.rebuilt)} recalculados`, color: "blue" as const }]
                  : []),
              ]} />
              <CronJobChart data={exchangeRateCron.days} />
              <CronRunLog
                runs={exchangeRateCron.runs}
                columns={[
                  { header: "Fecha",        field: "startedAt", format: "date" },
                  { header: "ARS/USD",      statsField: "rate",    format: "currency-ar", color: "text-green-400" },
                  { header: "Recalculados", statsField: "rebuilt",                         color: "text-sky-300" },
                ] satisfies CronRunColumn[]}
              />
            </CardContent>
          </Card>

          {/* Mailing novedades cron */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Cron mailing novedades</CardTitle>
                {mailingCron.lastRun && (
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${
                      mailingCron.lastRun.status === "completed"
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  />
                )}
              </div>
              {mailingCron.lastRun && (
                <p className="text-xs text-muted-foreground">
                  {new Date(mailingCron.lastRun.finishedAt).toLocaleString(
                    "es-AR",
                    {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: "America/Argentina/Buenos_Aires",
                    }
                  )}
                  {mailingCron.lastRun.stats &&
                    "emailsSent" in mailingCron.lastRun.stats && (
                      <>
                        {" "}
                        · {Number(mailingCron.lastRun.stats.emailsSent)} emails
                      </>
                    )}
                </p>
              )}
            </CardHeader>
            <CardContent>
              <CronStatChips chips={[
                { label: `✉ ${Number(mailingCron.todayChips.emailsSent ?? 0)} emails hoy`, color: "green" },
                { label: `👥 ${Number(mailingCron.todayChips.usersChecked ?? 0)} revisados`, color: "blue" },
                ...(Number(mailingCron.todayChips.skipped ?? 0) > 0
                  ? [{ label: `— ${Number(mailingCron.todayChips.skipped)} saltados`, color: "gray" as const }]
                  : []),
              ] satisfies StatChip[]} />
              <CronJobChart data={mailingCron.days} />
              <CronRunLog
                runs={mailingCron.runs}
                columns={[
                  { header: "Hora",      field: "startedAt", format: "time", color: "text-sky-400" },
                  { header: "Emails",    statsField: "emailsSent",             color: "text-green-400" },
                  { header: "Revisados", statsField: "usersChecked",           color: "text-sky-300" },
                  { header: "Saltados",  statsField: "skipped" },
                  { header: "Chain",     statsField: "chain",                  color: "text-amber-400" },
                ] satisfies CronRunColumn[]}
              />
            </CardContent>
          </Card>

          {/* IPC cron */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Cron IPC</CardTitle>
                {ipcCron.lastRun && (
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${
                      ipcCron.lastRun.status === "completed"
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  />
                )}
              </div>
              {ipcCron.lastRun && (
                <p className="text-xs text-muted-foreground">
                  {new Date(ipcCron.lastRun.finishedAt).toLocaleString(
                    "es-AR",
                    {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: "America/Argentina/Buenos_Aires",
                    }
                  )}
                  {ipcCron.lastRun.stats &&
                    "latestMonth" in ipcCron.lastRun.stats && (
                      <>
                        {" "}
                        · {String(ipcCron.lastRun.stats.latestMonth)}{" "}
                        {Number(ipcCron.lastRun.stats.latestRate).toFixed(1)}%
                      </>
                    )}
                </p>
              )}
            </CardHeader>
            <CardContent>
              <CronStatChips chips={[
                ...(ipcCron.todayChips.latestMonth != null
                  ? [{ label: `📈 ${String(ipcCron.todayChips.latestMonth)}: ${Number(ipcCron.todayChips.latestRate).toFixed(1)}% IPC`, color: "green" as const }]
                  : []),
                ...(Number(ipcCron.todayChips.monthsUpserted ?? 0) > 0
                  ? [{ label: `${Number(ipcCron.todayChips.monthsUpserted)} meses actualizados`, color: "blue" as const }]
                  : []),
              ]} />
              <CronJobChart data={ipcCron.days} />
              <CronRunLog
                runs={ipcCron.runs}
                columns={[
                  { header: "Fecha",      field: "startedAt", format: "date" },
                  { header: "Último mes", statsField: "latestMonth",                    color: "text-sky-300" },
                  { header: "IPC %",      statsField: "latestRate", format: "percent1", color: "text-green-400" },
                ] satisfies CronRunColumn[]}
              />
            </CardContent>
          </Card>
        </div>

        {/* Property Engagement */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Propiedades con más interacción</CardTitle>
          </CardHeader>
          <CardContent>
            <TopPropertiesTable data={topProperties} />
          </CardContent>
        </Card>

        {/* User Engagement */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Usuarios con más interacción</CardTitle>
          </CardHeader>
          <CardContent>
            <TopUsersTable
              data={topUsers.rows}
              breakdowns={topUsers.breakdowns}
              totalActors={topUsers.totalActors}
              currentPage={usersPage}
              pageSize={20}
              currentSearch={usersSearch ?? ""}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
