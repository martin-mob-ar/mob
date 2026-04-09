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

export async function getPlanDistribution(): Promise<PlanCount[]> {
  const { data } = await supabaseAdmin
    .from('operaciones')
    .select('planMobElegido')
    .not('planMobElegido', 'is', null);

  if (!data?.length) return [];

  const counts = new Map<string, number>();
  for (const row of data) {
    const plan = row.planMobElegido || 'sin plan';
    counts.set(plan, (counts.get(plan) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([plan, count]) => ({ plan, count }))
    .sort((a, b) => b.count - a.count);
}

// ── Price stats ──────────────────────────────────────────────────────────────

export interface PriceStats {
  currency: string;
  count: number;
  avg: number;
  min: number;
  max: number;
}

export async function getPriceStats(): Promise<PriceStats[]> {
  const { data } = await supabaseAdmin
    .from('operaciones')
    .select('price, currency')
    .eq('status', 'available')
    .gt('price', 0);

  if (!data?.length) return [];

  const byCurrency = new Map<string, number[]>();
  for (const row of data) {
    const cur = row.currency || 'ARS';
    if (!byCurrency.has(cur)) byCurrency.set(cur, []);
    byCurrency.get(cur)!.push(Number(row.price));
  }

  return Array.from(byCurrency.entries()).map(([currency, prices]) => ({
    currency,
    count: prices.length,
    avg: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
    min: Math.min(...prices),
    max: Math.max(...prices),
  }));
}

// ── Sync health ──────────────────────────────────────────────────────────────

export interface SyncDay {
  date: string;
  completed: number;
  failed: number;
  propertiesUpdated: number;
  errors: number;
}

export async function getSyncHealth(): Promise<{
  days: SyncDay[];
  lastSync: { status: string; finishedAt: string } | null;
}> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();

  const { data } = await supabaseAdmin
    .from('cron_sync_log')
    .select('started_at, finished_at, status, properties_updated, errors')
    .gte('started_at', sevenDaysAgo)
    .order('started_at', { ascending: true });

  if (!data?.length) return { days: [], lastSync: null };

  const byDay = new Map<string, SyncDay>();
  for (const row of data) {
    const date = row.started_at.slice(0, 10);
    if (!byDay.has(date)) {
      byDay.set(date, { date, completed: 0, failed: 0, propertiesUpdated: 0, errors: 0 });
    }
    const day = byDay.get(date)!;
    if (row.status === 'completed') day.completed++;
    else if (row.status === 'failed') day.failed++;
    day.propertiesUpdated += row.properties_updated ?? 0;
    day.errors += Array.isArray(row.errors) ? row.errors.length : 0;
  }

  const lastRow = data[data.length - 1];

  return {
    days: Array.from(byDay.values()),
    lastSync: {
      status: lastRow.status,
      finishedAt: lastRow.finished_at ?? lastRow.started_at,
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
}

export async function getCronJobHealth(jobName: string): Promise<CronJobHealth> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();

  const { data } = await supabaseAdmin
    .from('cron_job_log')
    .select('started_at, finished_at, status, stats')
    .eq('job_name', jobName)
    .gte('started_at', sevenDaysAgo)
    .order('started_at', { ascending: true });

  if (!data?.length) return { days: [], lastRun: null };

  const byDay = new Map<string, CronJobDay>();
  for (const row of data) {
    const date = row.started_at.slice(0, 10);
    if (!byDay.has(date)) {
      byDay.set(date, { date, completed: 0, failed: 0 });
    }
    const day = byDay.get(date)!;
    if (row.status === 'completed') day.completed++;
    else if (row.status === 'failed') day.failed++;
  }

  const lastRow = data[data.length - 1];
  return {
    days: Array.from(byDay.values()),
    lastRun: {
      status: lastRow.status,
      finishedAt: lastRow.finished_at ?? lastRow.started_at,
      stats: lastRow.stats as Record<string, unknown> | null,
    },
  };
}
