import { supabaseAdmin } from '@/lib/supabase/server';
import { ADMIN_AUTH_IDS } from '@/lib/constants/admin-users';

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
  verifTotalUsers: number;
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
    vhUsers,
    vtUsers,
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
    supabaseAdmin.from('verificaciones_hoggax').select('user_id').eq('hoggax_approved', true),
    supabaseAdmin.from('verificaciones_truora').select('user_id').eq('truora_document_verified', true),
  ]);

  const allVerifiedIds = new Set([
    ...(vhUsers.data ?? []).map((r) => r.user_id),
    ...(vtUsers.data ?? []).map((r) => r.user_id),
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
    verifTotalUsers: allVerifiedIds.size,
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
  views: number;
  submits_started: number;
  verifications_requested: number;
  submits: number;
}

export interface FunnelPair {
  consulta: FunnelData;
  visita: FunnelData;
}

export async function getConversionFunnel(periodDays: number | null): Promise<FunnelPair> {
  const cutoff = periodDays
    ? new Date(Date.now() - periodDays * 86400000).toISOString()
    : '2020-01-01T00:00:00Z';

  const { data: events } = await supabaseAdmin
    .from('property_events')
    .select('property_id, event_type, metadata')
    .gte('created_at', cutoff);

  if (!events || events.length === 0) {
    const empty: FunnelData = { views: 0, submits_started: 0, verifications_requested: 0, submits: 0 };
    return { consulta: { ...empty }, visita: { ...empty } };
  }

  // Fetch property info to classify each property's form type
  const propertyIds = [...new Set(events.map(e => e.property_id))];
  const { data: properties } = await supabaseAdmin
    .from('properties_read')
    .select('property_id, mob_plan, owner_account_type')
    .in('property_id', propertyIds);

  const propMap = new Map(properties?.map(p => [p.property_id, p]) ?? []);

  // Classify: VisitLeadForm when plan is acompanado/experiencia + owner is inquilino/dueño
  function isVisitaFlow(propertyId: number): boolean {
    const p = propMap.get(propertyId);
    if (!p) return false;
    return (p.mob_plan === 'acompanado' || p.mob_plan === 'experiencia')
      && (p.owner_account_type === 1 || p.owner_account_type === 2);
  }

  const consulta: FunnelData = { views: 0, submits_started: 0, verifications_requested: 0, submits: 0 };
  const visita: FunnelData = { views: 0, submits_started: 0, verifications_requested: 0, submits: 0 };

  for (const e of events) {
    const target = isVisitaFlow(e.property_id) ? visita : consulta;
    const meta = e.metadata as Record<string, unknown> | null;
    switch (e.event_type) {
      case 'property_view': {
        const count = meta?.source === 'clarity_backfill' && typeof meta.count === 'number' ? meta.count : 1;
        target.views += count;
        break;
      }
      case 'agendar_visita_submit_started': target.submits_started++; break;
      case 'agendar_visita_verification_requested': target.verifications_requested++; break;
      case 'agendar_visita_submit': target.submits++; break;
    }
  }

  return { consulta, visita };
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

// ── Shared run type ───────────────────────────────────────────────────────────

export interface CronRun {
  id: number;
  startedAt: string;
  finishedAt: string | null;
  status: string;
  stats?: Record<string, unknown> | null;
  // sync-specific flat fields (undefined for cron_job_log runs):
  propertiesAdded?: number;
  propertiesUpdated?: number;
  propertiesDeleted?: number;
  photosAdded?: number;
  photosRemoved?: number;
}

function todayART(): string {
  return new Date().toLocaleDateString('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
  });
}

function sumRunField(runs: CronRun[], field: keyof CronRun): number {
  return runs.reduce((acc, r) => acc + (Number(r[field]) || 0), 0);
}

function sumStatField(runs: CronRun[], key: string): number {
  return runs.reduce((acc, r) => {
    const v = r.stats?.[key];
    return acc + (typeof v === 'number' ? v : 0);
  }, 0);
}

function lastStatField(runs: CronRun[], key: string): unknown {
  for (const r of runs) {
    const v = r.stats?.[key];
    if (v != null) return v;
  }
  return null;
}

export interface SyncHealthData {
  days: SyncDay[];
  lastSync: { status: string; finishedAt: string } | null;
  recentErrors: { date: string; errors: string[] }[];
  runs: CronRun[];
  todayChips: {
    propertiesAdded: number;
    propertiesUpdated: number;
    propertiesDeleted: number;
    photosAdded: number;
  };
}

export async function getSyncHealth(): Promise<SyncHealthData> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();

  const { data } = await supabaseAdmin
    .from('cron_sync_log')
    .select('id, started_at, finished_at, status, properties_added, properties_updated, properties_deleted, photos_added, photos_removed, errors, error_message')
    .gte('started_at', sevenDaysAgo)
    .order('started_at', { ascending: true });

  if (!data?.length) return { days: [], lastSync: null, recentErrors: [], runs: [], todayChips: { propertiesAdded: 0, propertiesUpdated: 0, propertiesDeleted: 0, photosAdded: 0 } };

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
        timeZone: 'America/Argentina/Buenos_Aires',
      });
      recentErrors.push({ date: ts, errors: runErrors });
    }
  }

  const lastRow = data[data.length - 1];
  const today = todayART();

  // Reverse so newest runs come first (query is ascending)
  const runs: CronRun[] = data.map(row => ({
    id: row.id,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
    status: row.status,
    propertiesAdded: row.properties_added ?? 0,
    propertiesUpdated: row.properties_updated ?? 0,
    propertiesDeleted: row.properties_deleted ?? 0,
    photosAdded: row.photos_added ?? 0,
    photosRemoved: row.photos_removed ?? 0,
  })).reverse();

  const todayRuns = runs.filter(r =>
    new Date(r.startedAt).toLocaleDateString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
    }) === today
  );

  return {
    days: Array.from(byDay.values()),
    lastSync: {
      status: lastRow.status,
      finishedAt: lastRow.finished_at ?? lastRow.started_at,
    },
    recentErrors: recentErrors.reverse(),
    runs,
    todayChips: {
      propertiesAdded: sumRunField(todayRuns, 'propertiesAdded'),
      propertiesUpdated: sumRunField(todayRuns, 'propertiesUpdated'),
      propertiesDeleted: sumRunField(todayRuns, 'propertiesDeleted'),
      photosAdded: sumRunField(todayRuns, 'photosAdded'),
    },
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
  runs: CronRun[];
  todayChips: Record<string, unknown>;
}

export async function getCronJobHealth(jobName: string): Promise<CronJobHealth> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();

  const { data } = await supabaseAdmin
    .from('cron_job_log')
    .select('id, started_at, finished_at, status, stats, error_message')
    .eq('job_name', jobName)
    .gte('started_at', sevenDaysAgo)
    .order('started_at', { ascending: true });

  if (!data?.length) return { days: [], lastRun: null, recentErrors: [], runs: [], todayChips: {} };

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
        timeZone: 'America/Argentina/Buenos_Aires',
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
  const today = todayART();

  // Reverse so newest runs come first (query is ascending)
  const runs: CronRun[] = data.map(row => ({
    id: row.id,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
    status: row.status,
    stats: row.stats as Record<string, unknown> | null,
  })).reverse();

  const todayRuns = runs.filter(r =>
    new Date(r.startedAt).toLocaleDateString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
    }) === today
  );

  // Per-job chip computation
  let todayChips: Record<string, unknown> = {};
  if (jobName === 'visitas') {
    todayChips = {
      reminder24h: sumStatField(todayRuns, 'reminder24h'),
      reminder2h: sumStatField(todayRuns, 'reminder2h'),
      postvisit: sumStatField(todayRuns, 'postvisit'),
    };
  } else if (jobName === 'exchange-rate') {
    todayChips = {
      rate: lastStatField(todayRuns, 'rate'),
      rebuilt: lastStatField(todayRuns, 'rebuilt'),
    };
  } else if (jobName === 'mailing-novedades') {
    todayChips = {
      emailsSent: sumStatField(todayRuns, 'emailsSent'),
      usersChecked: lastStatField(todayRuns, 'usersChecked'),
      skipped: sumStatField(todayRuns, 'skipped'),
    };
  } else if (jobName === 'ipc') {
    todayChips = {
      latestMonth: lastStatField(todayRuns, 'latestMonth'),
      latestRate: lastStatField(todayRuns, 'latestRate'),
      monthsUpserted: sumStatField(todayRuns, 'monthsUpserted'),
    };
  }

  return {
    days: Array.from(byDay.values()),
    lastRun: {
      status: lastRow.status,
      finishedAt: lastRow.finished_at ?? lastRow.started_at,
      stats: lastRow.stats as Record<string, unknown> | null,
    },
    recentErrors: recentErrors.reverse(),
    runs,
    todayChips,
  };
}

// ── Property Engagement Analytics ──────────────────────────────────────────

export interface PropertyEngagementRow {
  property_id: number;
  address: string | null;
  location_name: string | null;
  views: number;
  submits_started: number;
  verifications_requested: number;
  submits: number;
  unique_visitors: number;
}

export async function getTopPropertiesByEngagement(cutoff: string, limit = 50): Promise<PropertyEngagementRow[]> {
  // Fetch all events with pagination (PostgREST default limit is 1000 rows)
  const PAGE_SIZE = 1000;
  let allEvents: { property_id: number; event_type: string; user_id: string | null; session_id: string | null; metadata: unknown }[] = [];
  let from = 0;

  for (;;) {
    const { data: page, error } = await supabaseAdmin
      .from('property_events')
      .select('property_id, event_type, user_id, session_id, metadata')
      .gte('created_at', cutoff)
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      console.error('[Admin] getTopPropertiesByEngagement error:', error.message);
      return [];
    }

    if (!page || page.length === 0) break;
    allEvents = allEvents.concat(page);
    if (page.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  const events = allEvents;
  if (events.length === 0) return [];

  // Fetch property owners to filter out self-clicks
  const propertyIds = [...new Set(events.map(e => e.property_id))];
  const { data: properties } = await supabaseAdmin
    .from('properties_read')
    .select('property_id, address, location_name, user_id')
    .in('property_id', propertyIds);

  const propMap = new Map(properties?.map(p => [p.property_id, p]) ?? []);

  // Filter out owner self-clicks, then aggregate
  const filtered = events.filter(e => {
    if (!e.user_id) return true; // anonymous events always pass
    const owner = propMap.get(e.property_id);
    return !owner || e.user_id !== owner.user_id;
  });

  if (filtered.length === 0) return [];

  // Aggregate in JS
  const byProperty = new Map<number, {
    views: number; submits_started: number;
    verifications_requested: number; submits: number;
    visitors: Set<string>;
  }>();

  for (const e of filtered) {
    let entry = byProperty.get(e.property_id);
    if (!entry) {
      entry = { views: 0, submits_started: 0, verifications_requested: 0, submits: 0, visitors: new Set() };
      byProperty.set(e.property_id, entry);
    }
    const visitorKey = e.user_id ?? e.session_id ?? 'anon';
    entry.visitors.add(visitorKey);
    const meta = e.metadata as Record<string, unknown> | null;
    switch (e.event_type) {
      case 'property_view': {
        // Backfill rows carry the real count in metadata.count
        const count = meta?.source === 'clarity_backfill' && typeof meta.count === 'number' ? meta.count : 1;
        entry.views += count;
        break;
      }
      case 'agendar_visita_submit_started': entry.submits_started++; break;
      case 'agendar_visita_verification_requested': entry.verifications_requested++; break;
      case 'agendar_visita_submit': entry.submits++; break;
    }
  }

  return Array.from(byProperty.entries())
    .sort((a, b) => b[1].views - a[1].views)
    .slice(0, limit)
    .map(([pid, stats]) => ({
      property_id: pid,
      address: propMap.get(pid)?.address ?? null,
      location_name: propMap.get(pid)?.location_name ?? null,
      views: stats.views,
      submits_started: stats.submits_started,
      verifications_requested: stats.verifications_requested,
      submits: stats.submits,
      unique_visitors: stats.visitors.size,
    }));
}

export interface PropertyEventStats {
  totals: {
    views: number;
    submits_started: number;
    verifications_requested: number;
    submits: number;
    unique_visitors: number;
  };
  daily: Array<{
    date: string;
    views: number;
    submits_started: number;
    verifications_requested: number;
    submits: number;
  }>;
}

export async function getPropertyEventStats(propertyId: number, cutoff: string): Promise<PropertyEventStats> {
  const { data: events } = await supabaseAdmin
    .from('property_events')
    .select('event_type, user_id, session_id, created_at, metadata')
    .eq('property_id', propertyId)
    .gte('created_at', cutoff)
    .order('created_at', { ascending: true });

  // Fetch property owner to filter out self-views
  const { data: property } = await supabaseAdmin
    .from('properties')
    .select('user_id')
    .eq('id', propertyId)
    .single();
  const ownerId = property?.user_id;

  const totals = { views: 0, submits_started: 0, verifications_requested: 0, submits: 0 };
  const visitors = new Set<string>();
  const byDay = new Map<string, { date: string; views: number; submits_started: number; verifications_requested: number; submits: number }>();

  for (const e of (events ?? []).filter(ev => !ev.user_id || ev.user_id !== ownerId)) {
    const day = (e.created_at as string).slice(0, 10);
    if (!byDay.has(day)) {
      byDay.set(day, { date: day, views: 0, submits_started: 0, verifications_requested: 0, submits: 0 });
    }
    const dayEntry = byDay.get(day)!;
    visitors.add(e.user_id ?? e.session_id ?? 'anon');

    switch (e.event_type) {
      case 'property_view': {
        const meta = e.metadata as Record<string, unknown> | null;
        const count = meta?.source === 'clarity_backfill' && typeof meta.count === 'number' ? meta.count : 1;
        totals.views += count;
        dayEntry.views += count;
        break;
      }
      case 'agendar_visita_submit_started': totals.submits_started++; dayEntry.submits_started++; break;
      case 'agendar_visita_verification_requested': totals.verifications_requested++; dayEntry.verifications_requested++; break;
      case 'agendar_visita_submit': totals.submits++; dayEntry.submits++; break;
    }
  }

  return {
    totals: { ...totals, unique_visitors: visitors.size },
    daily: Array.from(byDay.values()),
  };
}

export interface PropertyRecentEvent {
  id: number;
  event_type: string;
  user_id: string | null;
  session_id: string | null;
  user_name: string | null;
  user_email: string | null;
  user_phone: string | null;
  user_phone_country_code: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface PropertyRecentEventsResult {
  events: PropertyRecentEvent[];
  total: number;
}

export async function getPropertyRecentEvents(
  propertyId: number,
  page: number = 1,
  pageSize: number = 50,
): Promise<PropertyRecentEventsResult> {
  // Count total events for this property
  const { count } = await supabaseAdmin
    .from('property_events')
    .select('id', { count: 'exact', head: true })
    .eq('property_id', propertyId);

  const total = count ?? 0;
  if (total === 0) return { events: [], total: 0 };

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data: events } = await supabaseAdmin
    .from('property_events')
    .select('id, event_type, user_id, session_id, metadata, created_at')
    .eq('property_id', propertyId)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (!events || events.length === 0) return { events: [], total };

  // Fetch user info for any events with user_id
  const userIds = [...new Set(events.filter(e => e.user_id).map(e => e.user_id!))];
  const userMap = new Map<string, { name: string | null; email: string | null; phone: string | null; phone_cc: string | null }>();
  if (userIds.length > 0) {
    const { data: users } = await supabaseAdmin
      .from('users')
      .select('id, name, email, telefono, telefono_country_code')
      .in('id', userIds);
    for (const u of users ?? []) {
      userMap.set(u.id, {
        name: u.name ?? null,
        email: u.email ?? null,
        phone: u.telefono ?? null,
        phone_cc: u.telefono_country_code ?? null,
      });
    }
  }

  const mappedEvents: PropertyRecentEvent[] = events.map(e => {
    const userInfo = e.user_id ? userMap.get(e.user_id) : undefined;
    return {
      id: e.id as number,
      event_type: e.event_type,
      user_id: e.user_id,
      session_id: e.session_id,
      user_name: userInfo?.name ?? null,
      user_email: userInfo?.email ?? null,
      user_phone: userInfo?.phone ?? null,
      user_phone_country_code: userInfo?.phone_cc ?? null,
      metadata: e.metadata as Record<string, unknown> | null,
      created_at: e.created_at,
    };
  });

  return { events: mappedEvents, total };
}

// ── Top Users by Events ─────────────────────────────────────────────────────

export interface UserEventRow {
  actorKey: string;
  isAuthenticated: boolean;
  displayName: string;
  email: string | null;
  phone: string | null;
  phone_country_code: string | null;
  property_view: number;
  agendar_visita_submit_started: number;
  agendar_visita_verification_requested: number;
  agendar_visita_submit: number;
  total: number;
}

export interface UserPropertyBreakdownRow {
  property_id: number;
  address: string | null;
  location_name: string | null;
  property_view: number;
  agendar_visita_submit_started: number;
  agendar_visita_verification_requested: number;
  agendar_visita_submit: number;
  total: number;
}

export interface TopUsersResult {
  rows: UserEventRow[];
  totalActors: number;
  breakdowns: Record<string, UserPropertyBreakdownRow[]>;
}

const EVENT_TYPES = [
  'property_view',
  'agendar_visita_submit_started',
  'agendar_visita_verification_requested',
  'agendar_visita_submit',
] as const;

type EventType = (typeof EVENT_TYPES)[number];

function emptyCounts(): Record<EventType, number> {
  return {
    property_view: 0,
    agendar_visita_submit_started: 0,
    agendar_visita_verification_requested: 0,
    agendar_visita_submit: 0,
  };
}

export async function getTopUsersByEvents(
  periodDays: number | null,
  page: number = 1,
  pageSize: number = 20,
  search?: string,
  userType?: "all" | "auth" | "anon",
): Promise<TopUsersResult> {
  const cutoff = periodDays
    ? new Date(Date.now() - periodDays * 86400000).toISOString()
    : '2020-01-01T00:00:00Z';

  const { data: events } = await supabaseAdmin
    .from('property_events')
    .select('user_id, session_id, event_type, property_id, metadata')
    .gte('created_at', cutoff);

  if (!events || events.length === 0) {
    return { rows: [], totalActors: 0, breakdowns: {} };
  }

  // Aggregate by actor
  const byActor = new Map<string, {
    isAuthenticated: boolean;
    userId: string | null;
    counts: Record<EventType, number>;
    total: number;
    byProperty: Map<number, { counts: Record<EventType, number>; total: number }>;
    leadId: number | null;
    visitaId: number | null;
  }>();

  for (const e of events) {
    const key = e.user_id ?? e.session_id;
    if (!key) continue;
    if (e.user_id && ADMIN_AUTH_IDS.includes(e.user_id)) continue;

    let actor = byActor.get(key);
    if (!actor) {
      actor = {
        isAuthenticated: !!e.user_id,
        userId: e.user_id,
        counts: emptyCounts(),
        total: 0,
        byProperty: new Map(),
        leadId: null,
        visitaId: null,
      };
      byActor.set(key, actor);
    }

    const meta = e.metadata as Record<string, unknown> | null;
    const count = e.event_type === 'property_view' && meta?.source === 'clarity_backfill' && typeof meta.count === 'number'
      ? meta.count : 1;

    // Capture lead/visita ID from submit events for email lookup
    if (e.event_type === 'agendar_visita_submit' && meta) {
      if (typeof meta.lead_id === 'number' && !actor.leadId) actor.leadId = meta.lead_id;
      if (typeof meta.visita_id === 'number' && !actor.visitaId) actor.visitaId = meta.visita_id;
    }

    if (e.event_type in actor.counts) {
      actor.counts[e.event_type as EventType] += count;
    }
    actor.total += count;

    // Per-property sub-aggregation
    let propEntry = actor.byProperty.get(e.property_id);
    if (!propEntry) {
      propEntry = { counts: emptyCounts(), total: 0 };
      actor.byProperty.set(e.property_id, propEntry);
    }
    if (e.event_type in propEntry.counts) {
      propEntry.counts[e.event_type as EventType] += count;
    }
    propEntry.total += count;
  }

  // Sort actors by total interactions
  const sorted = Array.from(byActor.entries())
    .sort((a, b) => b[1].total - a[1].total);

  // Apply userType filter before search/pagination
  let filtered = sorted;
  if (userType === "auth") {
    filtered = filtered.filter(([, actor]) => actor.isAuthenticated);
  } else if (userType === "anon") {
    filtered = filtered.filter(([, actor]) => !actor.isAuthenticated);
  }

  // If searching, resolve matching actor keys before pagination
  if (search && search.trim().length > 0) {
    const term = search.trim().toLowerCase();

    // Find matching authenticated user IDs by name/email
    const matchingUserIds = new Set<string>();
    const allAuthIds = sorted
      .filter(([, a]) => a.isAuthenticated && a.userId)
      .map(([, a]) => a.userId!);

    if (allAuthIds.length > 0) {
      const { data: matchedUsers } = await supabaseAdmin
        .from('users')
        .select('id, name, email')
        .in('id', allAuthIds)
        .or(`name.ilike.%${term}%,email.ilike.%${term}%`);
      for (const u of matchedUsers ?? []) {
        matchingUserIds.add(u.id);
      }
    }

    // Find matching anonymous actors via leads email
    const matchingLeadIds = new Set<number>();
    const allLeadIds = sorted
      .filter(([, a]) => !a.isAuthenticated && a.leadId)
      .map(([, a]) => a.leadId!);

    if (allLeadIds.length > 0) {
      const { data: matchedLeads } = await supabaseAdmin
        .from('leads')
        .select('id')
        .in('id', allLeadIds)
        .ilike('email', `%${term}%`);
      for (const l of matchedLeads ?? []) {
        matchingLeadIds.add(l.id);
      }
    }

    // Find matching anonymous actors via visitas email
    const matchingVisitaIds = new Set<number>();
    const allVisitaIds = sorted
      .filter(([, a]) => !a.isAuthenticated && a.visitaId)
      .map(([, a]) => a.visitaId!);

    if (allVisitaIds.length > 0) {
      const { data: matchedVisitas } = await supabaseAdmin
        .from('visitas')
        .select('id')
        .in('id', allVisitaIds)
        .ilike('requester_email', `%${term}%`);
      for (const v of matchedVisitas ?? []) {
        matchingVisitaIds.add(v.id);
      }
    }

    filtered = sorted.filter(([key, actor]) => {
      if (actor.isAuthenticated && actor.userId && matchingUserIds.has(actor.userId)) return true;
      if (!actor.isAuthenticated && actor.leadId && matchingLeadIds.has(actor.leadId)) return true;
      if (!actor.isAuthenticated && actor.visitaId && matchingVisitaIds.has(actor.visitaId)) return true;
      // Also match on session key prefix for anonymous actors
      if (key.toLowerCase().includes(term)) return true;
      return false;
    });
  }

  const totalActors = filtered.length;
  const pageSlice = filtered.slice((page - 1) * pageSize, page * pageSize);

  // Fetch user names for authenticated actors in page
  const authUserIds = pageSlice
    .filter(([, a]) => a.isAuthenticated && a.userId)
    .map(([, a]) => a.userId!);

  const userMap = new Map<string, { name: string | null; email: string | null; phone: string | null; phone_cc: string | null }>();
  if (authUserIds.length > 0) {
    const { data: users } = await supabaseAdmin
      .from('users')
      .select('id, name, email, telefono, telefono_country_code')
      .in('id', authUserIds);
    for (const u of users ?? []) {
      userMap.set(u.id, { name: u.name, email: u.email, phone: u.telefono ?? null, phone_cc: u.telefono_country_code ?? null });
    }
  }

  // Fetch emails for anonymous actors from leads/visitas
  const anonEmailMap = new Map<string, string>();
  const leadIds: number[] = [];
  const visitaIds: number[] = [];
  const leadIdToActor = new Map<number, string>();
  const visitaIdToActor = new Map<number, string>();

  for (const [key, actor] of pageSlice) {
    if (actor.isAuthenticated) continue;
    if (actor.leadId) {
      leadIds.push(actor.leadId);
      leadIdToActor.set(actor.leadId, key);
    } else if (actor.visitaId) {
      visitaIds.push(actor.visitaId);
      visitaIdToActor.set(actor.visitaId, key);
    }
  }

  if (leadIds.length > 0) {
    const { data: leads } = await supabaseAdmin
      .from('leads')
      .select('id, email')
      .in('id', leadIds);
    for (const l of leads ?? []) {
      const actorKey = leadIdToActor.get(l.id);
      if (actorKey && l.email) anonEmailMap.set(actorKey, l.email);
    }
  }
  if (visitaIds.length > 0) {
    const { data: visitas } = await supabaseAdmin
      .from('visitas')
      .select('id, requester_email')
      .in('id', visitaIds);
    for (const v of visitas ?? []) {
      const actorKey = visitaIdToActor.get(v.id);
      if (actorKey && v.requester_email && !anonEmailMap.has(actorKey)) {
        anonEmailMap.set(actorKey, v.requester_email);
      }
    }
  }

  // Fetch property info for breakdowns
  const allPropertyIds = new Set<number>();
  for (const [, actor] of pageSlice) {
    for (const pid of actor.byProperty.keys()) {
      allPropertyIds.add(pid);
    }
  }

  const propMap = new Map<number, { address: string | null; location_name: string | null }>();
  if (allPropertyIds.size > 0) {
    const { data: props } = await supabaseAdmin
      .from('properties_read')
      .select('property_id, address, location_name')
      .in('property_id', [...allPropertyIds]);
    for (const p of props ?? []) {
      propMap.set(p.property_id, { address: p.address, location_name: p.location_name });
    }
  }

  // Build result
  const rows: UserEventRow[] = pageSlice.map(([key, actor]) => {
    const userInfo = actor.userId ? userMap.get(actor.userId) : null;
    let displayName: string;
    if (actor.isAuthenticated && userInfo) {
      displayName = userInfo.name || userInfo.email || key.slice(0, 8);
    } else {
      displayName = anonEmailMap.get(key) || key.slice(0, 8) + '...';
    }

    return {
      actorKey: key,
      isAuthenticated: actor.isAuthenticated,
      displayName,
      email: userInfo?.email ?? null,
      phone: userInfo?.phone ?? null,
      phone_country_code: userInfo?.phone_cc ?? null,
      ...actor.counts,
      total: actor.total,
    };
  });

  const breakdowns: Record<string, UserPropertyBreakdownRow[]> = {};
  for (const [key, actor] of pageSlice) {
    breakdowns[key] = Array.from(actor.byProperty.entries())
      .sort((a, b) => b[1].total - a[1].total)
      .map(([pid, entry]) => ({
        property_id: pid,
        address: propMap.get(pid)?.address ?? null,
        location_name: propMap.get(pid)?.location_name ?? null,
        ...entry.counts,
        total: entry.total,
      }));
  }

  return { rows, totalActors, breakdowns };
}

export interface AttributionBreakdown {
  direct_session: number;
  recovered_via_user: number;
  unattributed: number;
}

export async function getPropertyAttributionBreakdown(propertyId: number, cutoff: string): Promise<AttributionBreakdown> {
  const { data: events } = await supabaseAdmin
    .from('property_events')
    .select('metadata')
    .eq('property_id', propertyId)
    .eq('event_type', 'agendar_visita_submit')
    .gte('created_at', cutoff);

  const result: AttributionBreakdown = { direct_session: 0, recovered_via_user: 0, unattributed: 0 };
  for (const e of events ?? []) {
    const status = (e.metadata as Record<string, unknown>)?.attribution_status;
    if (status === 'direct_session') result.direct_session++;
    else if (status === 'recovered_via_user') result.recovered_via_user++;
    else result.unattributed++;
  }
  return result;
}
