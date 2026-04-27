# Cron Health Detail — Design Spec

**Date:** 2026-04-27
**Status:** Approved

---

## Overview

Enhance the "Salud de crons (7 días)" section in `/admin` to show rich per-run stats for each cron card. Currently each card shows only a bar chart and an error list. After this change each card will show:

1. **Stat chips** — today's aggregated totals as colored badges, above the chart
2. **Bar chart** — unchanged (existing `SyncHealthChart` / `CronJobChart`)
3. **"Últimas ejecuciones" toggle + paginated run log** — below the chart, replacing `CronErrors`

---

## Scope

Five cron cards are affected:

| Card | Log table | Frequency |
|------|-----------|-----------|
| Tokko sync | `cron_sync_log` | Hourly |
| Cron visitas | `cron_job_log` (job_name=`visitas`) | Every 30 min |
| Cron tipo de cambio | `cron_job_log` (job_name=`exchange-rate`) | Daily |
| Cron mailing novedades | `cron_job_log` (job_name=`mailing-novedades`) | Daily |
| Cron IPC | `cron_job_log` (job_name=`ipc`) | Daily |

Nothing outside the admin section changes. No new API routes. Charts are untouched.

---

## Section 1 — Data layer

### 1a. Schema migration — `cron_sync_log`

Add one column:

```sql
ALTER TABLE public.cron_sync_log
  ADD COLUMN properties_added INTEGER NOT NULL DEFAULT 0;
```

Migration file: `supabase/migrations/20260427000001_cron_sync_log_properties_added.sql`
Apply to branch first, then production.

### 1b. Sync route — count new inserts separately

File: `app/api/cron/sync/route.ts`

Currently the sync service logs `propertiesUpdated` (upserts — new + edited combined). After this change it must distinguish inserts from updates.

**Mechanism:** When upserting properties to Supabase, use the `select` return with a raw count or leverage the upsert response. The simplest approach: before each batch upsert, fetch the set of existing property IDs for that company; after the upsert, any ID not previously present is a new insert. Track `propertiesAdded` and `propertiesUpdated` (edited only) separately in the `totals` object.

All three places that write to `cron_sync_log` (mid-chain, final, and error paths) must include `properties_added: totals.propertiesAdded`.

### 1c. Query changes — `lib/admin/queries.ts`

**`CronRun` type** (new, shared):

```ts
export interface CronRun {
  id: number
  startedAt: string
  finishedAt: string | null
  status: string                              // 'completed' | 'failed' | 'running' | 'chained'
  stats?: Record<string, unknown> | null      // for cron_job_log runs
  // cron_sync_log flat fields (undefined for job_log runs):
  propertiesAdded?: number
  propertiesUpdated?: number
  propertiesDeleted?: number
  photosAdded?: number
  photosRemoved?: number
}
```

**`getSyncHealth()`** — expand to:
- Fetch `properties_added`, `properties_deleted`, `photos_added`, `photos_removed` (currently missing from select)
- Return `runs: CronRun[]` — the full raw rows for the 7-day window, sorted descending by `started_at`
- Add `todayChips` computed from runs where date = today in ART timezone:
  - `propertiesAdded` sum, `propertiesUpdated` sum, `propertiesDeleted` sum, `photosAdded` sum

**`getCronJobHealth()`** — expand to:
- Return `runs: CronRun[]` — full raw rows, sorted descending
- Add `todayChips` computed from today's runs by reading `stats` JSONB per job:

| job_name | chip fields |
|----------|-------------|
| `visitas` | `stats.reminder24h` sum, `stats.reminder2h` sum, `stats.postvisit` sum |
| `exchange-rate` | last run's `stats.rate`, last run's `stats.rebuilt` |
| `mailing-novedades` | `stats.emailsSent` sum, last run's `stats.usersChecked`, `stats.skipped` sum |
| `ipc` | last run's `stats.latestMonth`, last run's `stats.latestRate`, `stats.monthsUpserted` sum |

**`SyncHealthData`** interface — add `runs: CronRun[]` and `todayChips: Record<string, number | string>`
**`CronJobHealth`** interface — add `runs: CronRun[]` and `todayChips: Record<string, number | string>`

---

## Section 2 — New components

### 2a. `components/admin/CronStatChips.tsx`

Server-compatible (no `'use client'` needed — pure display).

```ts
interface StatChip {
  label: string
  color: 'green' | 'red' | 'blue' | 'purple' | 'amber' | 'gray'
}

interface CronStatChipsProps {
  chips: StatChip[]
}
```

Renders a `flex-wrap` row of small pill badges. Color → Tailwind class mapping:
- `green` → `bg-green-950 text-green-400`
- `red` → `bg-red-950 text-red-300`
- `blue` → `bg-sky-950 text-sky-300`
- `purple` → `bg-purple-950 text-purple-300`
- `amber` → `bg-amber-950 text-amber-300`
- `gray` → `bg-muted text-muted-foreground border`

### 2b. `components/admin/CronRunLog.tsx`

`'use client'` component.

```ts
interface CronRunColumn {
  header: string
  getValue: (run: CronRun) => string | number | null | undefined
  color?: string   // Tailwind text color class, e.g. 'text-green-400'
}

interface CronRunLogProps {
  runs: CronRun[]
  columns: CronRunColumn[]
  pageSize?: number   // default: 5
}
```

**Behavior:**
- Default state: collapsed (toggle closed)
- Toggle label: "Últimas ejecuciones ▾" / "▴ Ocultar"
- Status column is always appended as the last column:
  - `completed` → green pill "ok"
  - `failed` → red pill "err"
  - `chained` → blue pill "chain"
  - `running` → gray pill "..."
- Pagination: `← pág. N / total →` below the rows; prev/next buttons disabled at boundaries
- Runs are pre-sorted descending by `startedAt` (done in the query)

**`CronErrors` is removed** — its file can be deleted; errors are now visible as red "err" rows inline.

---

## Section 3 — Admin page changes

File: `app/admin/page.tsx`

For each cron card, the `<CardContent>` block changes from:

```jsx
<CardContent>
  <SyncHealthChart data={sync.days} />   {/* or CronJobChart */}
  <CronErrors errors={sync.recentErrors} />
</CardContent>
```

to:

```jsx
<CardContent>
  <CronStatChips chips={computedChips} />
  <SyncHealthChart data={sync.days} />   {/* unchanged */}
  <CronRunLog runs={sync.runs} columns={syncColumns} />
</CardContent>
```

### Per-card column configs

**Tokko sync** (`syncColumns`):
```ts
[
  { header: 'Hora',    getValue: r => formatTime(r.startedAt), color: 'text-sky-400' },
  { header: 'Nuevas',  getValue: r => r.propertiesAdded,       color: 'text-green-400' },
  { header: 'Act.',    getValue: r => r.propertiesUpdated,      color: 'text-sky-300' },
  { header: 'Elim.',   getValue: r => r.propertiesDeleted,      color: 'text-red-400' },
  { header: 'Fotos+',  getValue: r => r.photosAdded,           color: 'text-purple-400' },
  { header: 'Fotos−',  getValue: r => r.photosRemoved,         color: 'text-amber-400' },
]
```

**Visitas**:
```ts
[
  { header: 'Hora',       getValue: r => formatTime(r.startedAt) },
  { header: '24h',        getValue: r => r.stats?.reminder24h,   color: 'text-sky-300' },
  { header: '2h',         getValue: r => r.stats?.reminder2h,    color: 'text-purple-300' },
  { header: 'Post-visita',getValue: r => r.stats?.postvisit,     color: 'text-green-400' },
]
```

**Tipo de cambio**:
```ts
[
  { header: 'Fecha',        getValue: r => formatDate(r.startedAt) },
  { header: 'ARS/USD',      getValue: r => r.stats?.rate,          color: 'text-green-400' },
  { header: 'Recalculados', getValue: r => r.stats?.rebuilt,       color: 'text-sky-300' },
]
```

**Mailing novedades**:
```ts
[
  { header: 'Hora',      getValue: r => formatTime(r.startedAt) },
  { header: 'Emails',    getValue: r => r.stats?.emailsSent,    color: 'text-green-400' },
  { header: 'Revisados', getValue: r => r.stats?.usersChecked,  color: 'text-sky-300' },
  { header: 'Saltados',  getValue: r => r.stats?.skipped,       color: 'text-muted-foreground' },
  { header: 'Chain',     getValue: r => r.stats?.chain,         color: 'text-amber-400' },
]
```

**IPC**:
```ts
[
  { header: 'Fecha',      getValue: r => formatDate(r.startedAt) },
  { header: 'Último mes', getValue: r => r.stats?.latestMonth,  color: 'text-sky-300' },
  { header: 'IPC %',      getValue: r => r.stats?.latestRate != null ? `${Number(r.stats.latestRate).toFixed(1)}%` : null, color: 'text-green-400' },
]
```

### Chip computation (in admin page)

Chips are derived from query results before rendering. `formatChips` helpers are defined locally in `page.tsx`.

Example for Tokko sync:
```ts
const todayART = new Date().toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })
const todayRuns = sync.runs.filter(r =>
  new Date(r.startedAt).toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' }) === todayART
)
const syncChips: StatChip[] = [
  { label: `+${sum(todayRuns, 'propertiesAdded')} nuevas hoy`, color: 'green' },
  { label: `↺ ${sum(todayRuns, 'propertiesUpdated')} actualizadas hoy`, color: 'blue' },
  { label: `✕ ${sum(todayRuns, 'propertiesDeleted')} eliminadas hoy`, color: 'red' },
  { label: `📷 +${sum(todayRuns, 'photosAdded')} fotos hoy`, color: 'purple' },
]
```

---

## Files changed

| File | Change |
|------|--------|
| `supabase/migrations/20260427000001_cron_sync_log_properties_added.sql` | NEW — adds `properties_added` column |
| `app/api/cron/sync/route.ts` | Track insert vs update in property upsert |
| `lib/admin/queries.ts` | Expand both query functions; add `CronRun` type |
| `components/admin/CronStatChips.tsx` | NEW |
| `components/admin/CronRunLog.tsx` | NEW — replaces `CronErrors` |
| `components/admin/CronErrors.tsx` | DELETE |
| `app/admin/page.tsx` | Add chips + run log to each card; remove `CronErrors` usage |

---

## Out of scope

- No changes to bar charts (`SyncHealthChart`, `CronJobChart`)
- No new API routes
- No changes to any cron route other than the sync route (`properties_added` tracking)
- No mobile-specific layout changes
- No runs older than 7 days (existing window)
