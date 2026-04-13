import { supabaseAdmin } from '@/lib/supabase/server';

// ── KPIs ─────────────────────────────────────────────────────────────────────

export interface KpiData {
  totalUsers: number;
  newUsers: number;
  activeProperties: number;
  draftProperties: number;
  pausedProperties: number;
  totalLeads: number;
  periodLeads: number;
  totalVisitas: number;
  periodVisitas: number;
  totalFavoritos: number;
  periodFavoritos: number;
  verifHoggaxTotal: number;
  verifHoggaxApproved: number;
  verifTruoraTotal: number;
  verifTruoraVerified: number;
}

export async function getKpis(periodDays: number | null): Promise<KpiData> {
  const cutoff = periodDays
    ? new Date(Date.now() - periodDays * 86400000).toISOString()
    : '1970-01-01T00:00:00Z';

  const [
    usersTotal,
    usersNew,
    propsActive,
    propsDraft,
    propsPaused,
    leadsTotal,
    leadsPeriod,
    visitasTotal,
    visitasPeriod,
    favTotal,
    favPeriod,
    vhTotal,
    vhApproved,
    vtTotal,
    vtVerified,
  ] = await Promise.all([
    supabaseAdmin.from('users').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).gte('created_at', cutoff),
    supabaseAdmin.from('properties_read').select('*', { count: 'exact', head: true }).eq('owner_verified', true),
    supabaseAdmin.from('properties').select('*', { count: 'exact', head: true }).not('draft_step', 'is', null).is('deleted_at', null),
    supabaseAdmin.from('properties').select('*', { count: 'exact', head: true }).neq('status', 2).is('deleted_at', null).is('draft_step', null),
    supabaseAdmin.from('leads').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('leads').select('*', { count: 'exact', head: true }).gte('created_at', cutoff),
    supabaseAdmin.from('visitas').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('visitas').select('*', { count: 'exact', head: true }).gte('created_at', cutoff),
    supabaseAdmin.from('favoritos').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('favoritos').select('*', { count: 'exact', head: true }).gte('created_at', cutoff),
    supabaseAdmin.from('verificaciones_hoggax').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('verificaciones_hoggax').select('*', { count: 'exact', head: true }).eq('hoggax_approved', true),
    supabaseAdmin.from('verificaciones_truora').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('verificaciones_truora').select('*', { count: 'exact', head: true }).eq('truora_document_verified', true),
  ]);

  return {
    totalUsers: usersTotal.count ?? 0,
    newUsers: usersNew.count ?? 0,
    activeProperties: propsActive.count ?? 0,
    draftProperties: propsDraft.count ?? 0,
    pausedProperties: propsPaused.count ?? 0,
    totalLeads: leadsTotal.count ?? 0,
    periodLeads: leadsPeriod.count ?? 0,
    totalVisitas: visitasTotal.count ?? 0,
    periodVisitas: visitasPeriod.count ?? 0,
    totalFavoritos: favTotal.count ?? 0,
    periodFavoritos: favPeriod.count ?? 0,
    verifHoggaxTotal: vhTotal.count ?? 0,
    verifHoggaxApproved: vhApproved.count ?? 0,
    verifTruoraTotal: vtTotal.count ?? 0,
    verifTruoraVerified: vtVerified.count ?? 0,
  };
}

// ── Signups by day ───────────────────────────────────────────────────────────

export interface SignupDay {
  date: string;
  inquilino: number;
  dueno: number;
  inmobiliaria: number;
  sin_tipo: number;
}

export async function getSignupsByDay(periodDays: number | null): Promise<SignupDay[]> {
  const cutoff = periodDays
    ? new Date(Date.now() - periodDays * 86400000).toISOString()
    : '1970-01-01T00:00:00Z';

  const { data } = await supabaseAdmin
    .from('users')
    .select('created_at, account_type')
    .gte('created_at', cutoff)
    .order('created_at', { ascending: true });

  if (!data?.length) return [];

  const byDay = new Map<string, SignupDay>();
  for (const row of data) {
    const date = row.created_at.slice(0, 10);
    if (!byDay.has(date)) {
      byDay.set(date, { date, inquilino: 0, dueno: 0, inmobiliaria: 0, sin_tipo: 0 });
    }
    const day = byDay.get(date)!;
    switch (row.account_type) {
      case 1: day.inquilino++; break;
      case 2: day.dueno++; break;
      case 3: case 4: day.inmobiliaria++; break;
      default: day.sin_tipo++; break;
    }
  }
  return Array.from(byDay.values());
}

// ── New properties by day ────────────────────────────────────────────────────

export interface PropertyDay {
  date: string;
  tokko: number;
  manual: number;
}

export async function getNewPropertiesByDay(periodDays: number | null): Promise<PropertyDay[]> {
  const cutoff = periodDays
    ? new Date(Date.now() - periodDays * 86400000).toISOString()
    : '1970-01-01T00:00:00Z';

  const { data } = await supabaseAdmin
    .from('properties_read')
    .select('property_created_at, tokko_id')
    .eq('owner_verified', true)
    .gte('property_created_at', cutoff)
    .order('property_created_at', { ascending: true });

  if (!data?.length) return [];

  const byDay = new Map<string, PropertyDay>();
  for (const row of data) {
    const date = (row.property_created_at as string).slice(0, 10);
    if (!byDay.has(date)) {
      byDay.set(date, { date, tokko: 0, manual: 0 });
    }
    const day = byDay.get(date)!;
    if (row.tokko_id !== null) day.tokko++;
    else day.manual++;
  }
  return Array.from(byDay.values());
}

// ── Properties by type ───────────────────────────────────────────────────────

export interface PropertyTypeCount {
  name: string;
  count: number;
}

export async function getPropertiesByType(): Promise<PropertyTypeCount[]> {
  const { data } = await supabaseAdmin
    .from('properties_read')
    .select('property_type_name')
    .eq('owner_verified', true);

  if (!data?.length) return [];

  const counts = new Map<string, number>();
  for (const row of data) {
    const name = row.property_type_name || 'Sin tipo';
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

// ── Properties by location ───────────────────────────────────────────────────

export interface LocationCount {
  location: string;
  state: string;
  count: number;
}

export async function getPropertiesByLocation(): Promise<LocationCount[]> {
  const { data } = await supabaseAdmin
    .from('properties_read')
    .select('location_name, state_name')
    .eq('owner_verified', true);

  if (!data?.length) return [];

  const counts = new Map<string, { location: string; state: string; count: number }>();
  for (const row of data) {
    const locName = row.location_name || 'Desconocido';
    const stateName = row.state_name || '';
    const key = `${locName}|${stateName}`;
    if (!counts.has(key)) {
      counts.set(key, { location: locName, state: stateName, count: 0 });
    }
    counts.get(key)!.count++;
  }

  return Array.from(counts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);
}

// ── Leads by day ─────────────────────────────────────────────────────────────

export interface LeadDay {
  date: string;
  count: number;
}

export async function getLeadsByDay(periodDays: number | null): Promise<LeadDay[]> {
  const cutoff = periodDays
    ? new Date(Date.now() - periodDays * 86400000).toISOString()
    : '1970-01-01T00:00:00Z';

  const { data } = await supabaseAdmin
    .from('leads')
    .select('created_at')
    .gte('created_at', cutoff)
    .order('created_at', { ascending: true });

  if (!data?.length) return [];

  const byDay = new Map<string, number>();
  for (const row of data) {
    const date = row.created_at.slice(0, 10);
    byDay.set(date, (byDay.get(date) ?? 0) + 1);
  }

  return Array.from(byDay.entries()).map(([date, count]) => ({ date, count }));
}

// ── Conversion funnel ────────────────────────────────────────────────────────

export interface FunnelData {
  leads: number;
  visitas: number;
  visitasConfirmed: number;
  visitasCompleted: number;
  reservas: number;
}

export async function getConversionFunnel(): Promise<FunnelData> {
  const [leads, visitas, confirmed, completed, rented] = await Promise.all([
    supabaseAdmin.from('leads').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('visitas').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('visitas').select('*', { count: 'exact', head: true }).eq('status', 'confirmed'),
    supabaseAdmin.from('visitas').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
    supabaseAdmin.from('operaciones').select('*', { count: 'exact', head: true }).eq('status', 'rented'),
  ]);

  return {
    leads: leads.count ?? 0,
    visitas: visitas.count ?? 0,
    visitasConfirmed: confirmed.count ?? 0,
    visitasCompleted: completed.count ?? 0,
    reservas: rented.count ?? 0,
  };
}

// ── Plan distribution ────────────────────────────────────────────────────────

export interface PlanCount {
  plan: string;
  count: number;
}

export interface PlanDistribution {
  todas: PlanCount[];
  duenoDir: PlanCount[];
}

export async function getPlanDistribution(): Promise<PlanDistribution> {
  const { data } = await supabaseAdmin
    .from('properties_read')
    .select('mob_plan, owner_account_type')
    .eq('owner_verified', true)
    .not('mob_plan', 'is', null);

  if (!data?.length) return { todas: [], duenoDir: [] };

  const todasCounts = new Map<string, number>();
  const duenoCounts = new Map<string, number>();

  for (const row of data) {
    const plan = row.mob_plan || 'sin plan';
    todasCounts.set(plan, (todasCounts.get(plan) ?? 0) + 1);
    if (row.owner_account_type === 1 || row.owner_account_type === 2) {
      duenoCounts.set(plan, (duenoCounts.get(plan) ?? 0) + 1);
    }
  }

  const toSorted = (m: Map<string, number>) =>
    Array.from(m.entries())
      .map(([plan, count]) => ({ plan, count }))
      .sort((a, b) => b.count - a.count);

  return { todas: toSorted(todasCounts), duenoDir: toSorted(duenoCounts) };
}

// ── Price stats ──────────────────────────────────────────────────────────────

export interface CurrencyCount {
  currency: string;
  count: number;
}

export interface BoxplotData {
  whiskerLow: number;
  q1: number;
  median: number;
  q3: number;
  whiskerHigh: number;
  avg: number;
  count: number;
  outliers: number;
}

export interface CurrencyBoxplot {
  currency: string;
  boxplot: BoxplotData;
}

export interface PriceStatsData {
  boxplots: CurrencyBoxplot[];
}

function percentile(sorted: number[], p: number): number {
  const idx = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

function buildBoxplot(values: number[]): BoxplotData | null {
  const sorted = values.filter((v) => v > 0).sort((a, b) => a - b);
  if (sorted.length === 0) return null;

  const q1 = Math.round(percentile(sorted, 25));
  const q3 = Math.round(percentile(sorted, 75));
  const iqr = q3 - q1;
  const lowerFence = q1 - 1.5 * iqr;
  const upperFence = q3 + 1.5 * iqr;
  const whiskerLow = sorted.find((v) => v >= lowerFence) ?? sorted[0];
  const whiskerHigh = [...sorted].reverse().find((v) => v <= upperFence) ?? sorted[sorted.length - 1];

  return {
    whiskerLow,
    q1,
    median: Math.round(percentile(sorted, 50)),
    q3,
    whiskerHigh,
    avg: Math.round(sorted.reduce((a, b) => a + b, 0) / sorted.length),
    count: sorted.length,
    outliers: sorted.filter((v) => v < lowerFence || v > upperFence).length,
  };
}

export async function getPriceStats(): Promise<PriceStatsData> {
  const { data } = await supabaseAdmin
    .from('properties_read')
    .select('currency, valor_total_primary')
    .eq('owner_verified', true);

  if (!data?.length) return { boxplots: [] };

  // Group valor_total_primary by currency
  const byCurrency = new Map<string, number[]>();
  for (const row of data) {
    const cur = row.currency || 'ARS';
    if (!byCurrency.has(cur)) byCurrency.set(cur, []);
    byCurrency.get(cur)!.push(Number(row.valor_total_primary));
  }

  const boxplots: CurrencyBoxplot[] = [];
  // Show ARS first, then USD, then any others
  const order = ['ARS', 'USD'];
  const keys = [...order.filter((k) => byCurrency.has(k)), ...[...byCurrency.keys()].filter((k) => !order.includes(k))];

  for (const currency of keys) {
    const bp = buildBoxplot(byCurrency.get(currency)!);
    if (bp) boxplots.push({ currency, boxplot: bp });
  }

  return { boxplots };
}

// ── Sync health ──────────────────────────────────────────────────────────────

export interface SyncDay {
  date: string;
  completed: number;
  withErrors: number;
  failed: number;
  propertiesUpdated: number;
  errors: number;
}

export interface SyncHealthData {
  days: SyncDay[];
  lastSync: { status: string; finishedAt: string } | null;
  recentErrors: { date: string; errors: string[] }[];
}

export async function getSyncHealth(): Promise<SyncHealthData> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();

  const { data } = await supabaseAdmin
    .from('cron_sync_log')
    .select('started_at, finished_at, status, properties_updated, errors, error_message')
    .gte('started_at', sevenDaysAgo)
    .order('started_at', { ascending: true });

  if (!data?.length) return { days: [], lastSync: null, recentErrors: [] };

  const byDay = new Map<string, SyncDay>();
  const recentErrors: { date: string; errors: string[] }[] = [];

  for (const row of data) {
    const date = row.started_at.slice(0, 10);
    if (!byDay.has(date)) {
      byDay.set(date, { date, completed: 0, withErrors: 0, failed: 0, propertiesUpdated: 0, errors: 0 });
    }
    const day = byDay.get(date)!;
    const errorsList = Array.isArray(row.errors) ? row.errors as string[] : [];
    const hasErrors = errorsList.length > 0 || !!row.error_message;

    if (row.status === 'failed') day.failed++;
    else if (row.status === 'completed' && hasErrors) day.withErrors++;
    else if (row.status === 'completed') day.completed++;

    day.propertiesUpdated += row.properties_updated ?? 0;
    day.errors += errorsList.length;

    // Collect error details
    const runErrors: string[] = [];
    if (row.error_message) runErrors.push(row.error_message);
    if (errorsList.length > 0) runErrors.push(...errorsList);
    if (runErrors.length > 0) {
      const ts = new Date(row.started_at).toLocaleString('es-AR', {
        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
      });
      recentErrors.push({ date: ts, errors: runErrors });
    }
  }

  const lastRow = data[data.length - 1];

  return {
    days: Array.from(byDay.values()),
    lastSync: {
      status: lastRow.status,
      finishedAt: lastRow.finished_at ?? lastRow.started_at,
    },
    recentErrors: recentErrors.reverse(),
  };
}

// ── Cron job health ───────────────────────────────────────────────────────────

export interface CronJobDay {
  date: string;
  completed: number;
  failed: number;
}

export interface CronJobHealth {
  days: CronJobDay[];
  lastRun: { status: string; finishedAt: string; stats: Record<string, unknown> | null } | null;
  recentErrors: { date: string; message: string }[];
}

export async function getCronJobHealth(jobName: string): Promise<CronJobHealth> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();

  const { data } = await supabaseAdmin
    .from('cron_job_log')
    .select('started_at, finished_at, status, stats, error_message')
    .eq('job_name', jobName)
    .gte('started_at', sevenDaysAgo)
    .order('started_at', { ascending: true });

  if (!data?.length) return { days: [], lastRun: null, recentErrors: [] };

  const byDay = new Map<string, CronJobDay>();
  const recentErrors: { date: string; message: string }[] = [];

  for (const row of data) {
    const date = row.started_at.slice(0, 10);
    if (!byDay.has(date)) {
      byDay.set(date, { date, completed: 0, failed: 0 });
    }
    const day = byDay.get(date)!;
    if (row.status === 'completed') day.completed++;
    else if (row.status === 'failed') day.failed++;

    // Collect errors from failed runs
    if (row.status === 'failed') {
      const ts = new Date(row.started_at).toLocaleString('es-AR', {
        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
      });
      // error_message for top-level failures
      if (row.error_message) {
        recentErrors.push({ date: ts, message: row.error_message });
      }
      // errorDetails from stats JSONB (visitas cron stores per-item errors here)
      const stats = row.stats as Record<string, unknown> | null;
      const details = stats?.errorDetails;
      if (Array.isArray(details)) {
        for (const d of details) {
          recentErrors.push({ date: ts, message: String(d) });
        }
      }
    }
  }

  const lastRow = data[data.length - 1];
  return {
    days: Array.from(byDay.values()),
    lastRun: {
      status: lastRow.status,
      finishedAt: lastRow.finished_at ?? lastRow.started_at,
      stats: lastRow.stats as Record<string, unknown> | null,
    },
    recentErrors: recentErrors.reverse(),
  };
}
