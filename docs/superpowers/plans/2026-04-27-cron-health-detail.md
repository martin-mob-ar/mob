# Cron Health Detail Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add stat chips and a toggleable paginated run log to each of the 5 cron cards in `/admin`, and track new property inserts separately from updates in the Tokko sync.

**Architecture:** All run data is fetched server-side alongside existing daily aggregates and passed as props to two new client components (`CronStatChips`, `CronRunLog`). No new API routes. `CronErrors` is deleted — errors surface as red rows inside `CronRunLog`.

**Tech Stack:** Next.js App Router, React, TypeScript, Supabase (PostgreSQL), Tailwind CSS, shadcn/ui

---

## File Map

| File | Action |
|------|--------|
| `supabase/migrations/20260427000001_cron_sync_log_properties_added.sql` | CREATE |
| `lib/sync/incremental.ts` | MODIFY — return `isNew` from `syncSingleProperty`, add `propertiesAdded` to stats |
| `app/api/cron/sync/route.ts` | MODIFY — add `propertiesAdded` to `totals` and all 3 log update calls |
| `lib/admin/queries.ts` | MODIFY — expand both query fns; add `CronRun` type, `runs[]`, `todayChips` |
| `components/admin/CronStatChips.tsx` | CREATE |
| `components/admin/CronRunLog.tsx` | CREATE |
| `components/admin/CronErrors.tsx` | DELETE |
| `app/admin/page.tsx` | MODIFY — swap `CronErrors` for new components in all 5 cards |

---

## Task 1: DB migration — add `properties_added` to `cron_sync_log`

**Files:**
- Create: `supabase/migrations/20260427000001_cron_sync_log_properties_added.sql`

- [ ] **Step 1: Create migration file**

```sql
-- supabase/migrations/20260427000001_cron_sync_log_properties_added.sql
ALTER TABLE public.cron_sync_log
  ADD COLUMN IF NOT EXISTS properties_added INTEGER NOT NULL DEFAULT 0;
```

- [ ] **Step 2: Apply to branch (develop)**

Use the Supabase MCP tool:
```
mcp__supabase__apply_migration
  project_id: mkxtgoqwbjxsuszcqcan
  name: cron_sync_log_properties_added
  query: <contents of migration file>
```

- [ ] **Step 3: Verify column exists on branch**

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'cron_sync_log' AND column_name = 'properties_added';
```

Expected: one row — `properties_added | integer | 0`

- [ ] **Step 4: Apply to production**

```
mcp__supabase__apply_migration
  project_id: ktuzzygtknginlzgksrj
  name: cron_sync_log_properties_added
  query: <same query>
```

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260427000001_cron_sync_log_properties_added.sql
git commit -m "feat: add properties_added column to cron_sync_log"
```

---

## Task 2: Track new inserts separately in sync service

**Files:**
- Modify: `lib/sync/incremental.ts`

The function `syncSingleProperty()` currently upserts and returns `{ propertyId }`. We need it to also return whether this was a new insert or an update. We check existence before the upsert.

- [ ] **Step 1: Locate `syncSingleProperty` signature and return**

Find the line (near line 513):
```typescript
const { data: upserted, error: upsertError } = await supabaseAdmin
  .from('properties')
  .upsert(propertyRow, { onConflict: 'tokko_id,user_id' })
  .select('id')
  .single();
```

And the return near line 539:
```typescript
return { propertyId };
```

- [ ] **Step 2: Add existence check before the upsert and return `isNew`**

Replace the block from just before the upsert call through the `return { propertyId }` line with:

```typescript
  // Check if this property already exists to track inserts vs updates
  const { data: existingProp } = await supabaseAdmin
    .from('properties')
    .select('id')
    .eq('tokko_id', tkkProp.id)
    .eq('user_id', userId)
    .maybeSingle();

  const { data: upserted, error: upsertError } = await supabaseAdmin
    .from('properties')
    .upsert(propertyRow, { onConflict: 'tokko_id,user_id' })
    .select('id')
    .single();

  if (upsertError) {
    throw new Error(`Property upsert failed: ${upsertError.message}`);
  }

  const propertyId = upserted.id;

  // ── Step 3: Sync operations ──
  await syncOperations(propertyId, tkkProp);

  // ── Step 4: Sync tags ──
  if (tkkProp.tags?.length) {
    const tagLinks = tkkProp.tags.map(tag => ({
      property_id: propertyId,
      tag_id: tag.id,
    }));
    await supabaseAdmin
      .from('tokko_property_property_tag')
      .upsert(tagLinks, { onConflict: 'property_id,tag_id', ignoreDuplicates: true });
  }

  return { propertyId, isNew: !existingProp };
```

- [ ] **Step 3: Add `propertiesAdded` to the stats object**

Find the stats object in `syncTargetIncremental` (near line 128 in route.ts context, but in incremental.ts itself). It looks like:
```typescript
const stats = {
  propertiesUpdated: 0,
  propertiesDeleted: 0,
  photosAdded: 0,
  photosRemoved: 0,
  errors: [] as string[],
  completed: false,
};
```

Add `propertiesAdded: 0` to the stats object:
```typescript
const stats = {
  propertiesAdded: 0,
  propertiesUpdated: 0,
  propertiesDeleted: 0,
  photosAdded: 0,
  photosRemoved: 0,
  errors: [] as string[],
  completed: false,
};
```

- [ ] **Step 4: Update the counter in the caller**

Find the block around line 218:
```typescript
const result = await syncSingleProperty(target.userId, target.companyId, tkkProp, cache);
if (result) {
  const photoDiff = await diffAndSyncPhotos(result.propertyId, tkkProp.photos);
  stats.photosAdded += photoDiff.added;
  stats.photosRemoved += photoDiff.removed;
  stats.propertiesUpdated++;
  if (photoDiff.added > 0) needsPhotoMigration = true;
}
```

Replace `stats.propertiesUpdated++` with:
```typescript
const result = await syncSingleProperty(target.userId, target.companyId, tkkProp, cache);
if (result) {
  const photoDiff = await diffAndSyncPhotos(result.propertyId, tkkProp.photos);
  stats.photosAdded += photoDiff.added;
  stats.photosRemoved += photoDiff.removed;
  if (result.isNew) {
    stats.propertiesAdded++;
  } else {
    stats.propertiesUpdated++;
  }
  if (photoDiff.added > 0) needsPhotoMigration = true;
}
```

- [ ] **Step 5: Commit**

```bash
git add lib/sync/incremental.ts
git commit -m "feat: track new property inserts vs updates in sync stats"
```

---

## Task 3: Log `properties_added` in sync cron route

**Files:**
- Modify: `app/api/cron/sync/route.ts`

- [ ] **Step 1: Add `propertiesAdded` to `totals`**

Find (around line 127):
```typescript
const totals = {
  targetsProcessed: 0,
  propertiesUpdated: 0,
  propertiesDeleted: 0,
  photosAdded: 0,
  photosRemoved: 0,
  errors: [] as string[],
};
```

Replace with:
```typescript
const totals = {
  targetsProcessed: 0,
  propertiesAdded: 0,
  propertiesUpdated: 0,
  propertiesDeleted: 0,
  photosAdded: 0,
  photosRemoved: 0,
  errors: [] as string[],
};
```

- [ ] **Step 2: Accumulate `propertiesAdded` from each target's stats**

Find (around line 146):
```typescript
totals.propertiesUpdated += stats.propertiesUpdated;
totals.propertiesDeleted += stats.propertiesDeleted;
totals.photosAdded += stats.photosAdded;
totals.photosRemoved += stats.photosRemoved;
```

Replace with:
```typescript
totals.propertiesAdded += stats.propertiesAdded;
totals.propertiesUpdated += stats.propertiesUpdated;
totals.propertiesDeleted += stats.propertiesDeleted;
totals.photosAdded += stats.photosAdded;
totals.photosRemoved += stats.photosRemoved;
```

- [ ] **Step 3: Add `properties_added` to all 3 log update calls**

There are 3 `.update()` calls on `cron_sync_log` (mid-loop progress, chain finalize, and final completion). Each one currently has:
```typescript
properties_updated: totals.propertiesUpdated,
properties_deleted: totals.propertiesDeleted,
```

Add `properties_added: totals.propertiesAdded,` before `properties_updated` in all 3 occurrences. The 3 locations are:
- Around line 169 (mid-loop update every 10 targets)
- Around line 202 (chain — not-all-processed path)
- Around line 249 (final completion)

Each should become:
```typescript
properties_added: totals.propertiesAdded,
properties_updated: totals.propertiesUpdated,
properties_deleted: totals.propertiesDeleted,
```

- [ ] **Step 4: Verify build passes**

```bash
cd c:/Proyectos/mob/mob && npm run build 2>&1 | tail -20
```

Expected: no TypeScript errors related to the changed files.

- [ ] **Step 5: Commit**

```bash
git add app/api/cron/sync/route.ts
git commit -m "feat: log properties_added to cron_sync_log"
```

---

## Task 4: Expand admin queries — add `runs[]` and `todayChips`

**Files:**
- Modify: `lib/admin/queries.ts`

- [ ] **Step 1: Add `CronRun` type and helpers after existing imports**

Add after the last existing interface (before `getSyncHealth`):

```typescript
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
```

- [ ] **Step 2: Update `SyncHealthData` interface**

Find:
```typescript
export interface SyncHealthData {
  days: SyncDay[];
  lastSync: { status: string; finishedAt: string } | null;
  recentErrors: { date: string; errors: string[] }[];
}
```

Replace with:
```typescript
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
```

- [ ] **Step 3: Update `getSyncHealth()` — expand select and return `runs` + `todayChips`**

Find the select line:
```typescript
.select('started_at, finished_at, status, properties_updated, errors, error_message')
```

Replace with:
```typescript
.select('id, started_at, finished_at, status, properties_added, properties_updated, properties_deleted, photos_added, photos_removed, errors, error_message')
```

Then find the `return {` at the bottom of the function and replace with:

```typescript
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
```

- [ ] **Step 4: Update `CronJobHealth` interface**

Find:
```typescript
export interface CronJobHealth {
  days: CronJobDay[];
  lastRun: { status: string; finishedAt: string; stats: Record<string, unknown> | null } | null;
  recentErrors: { date: string; message: string }[];
}
```

Replace with:
```typescript
export interface CronJobHealth {
  days: CronJobDay[];
  lastRun: { status: string; finishedAt: string; stats: Record<string, unknown> | null } | null;
  recentErrors: { date: string; message: string }[];
  runs: CronRun[];
  todayChips: Record<string, unknown>;
}
```

- [ ] **Step 5: Update `getCronJobHealth()` — expand to return `runs` + `todayChips`**

Find the select line:
```typescript
.select('started_at, finished_at, status, stats, error_message')
```

Replace with:
```typescript
.select('id, started_at, finished_at, status, stats, error_message')
```

Then find the `return {` at the bottom of the function and replace with:

```typescript
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
```

- [ ] **Step 6: Verify build passes**

```bash
cd c:/Proyectos/mob/mob && npm run build 2>&1 | tail -20
```

Expected: no TypeScript errors.

- [ ] **Step 7: Commit**

```bash
git add lib/admin/queries.ts
git commit -m "feat: expand cron health queries with runs and todayChips"
```

---

## Task 5: Create `CronStatChips` component

**Files:**
- Create: `components/admin/CronStatChips.tsx`

- [ ] **Step 1: Write the component**

```tsx
// components/admin/CronStatChips.tsx

export type ChipColor = 'green' | 'red' | 'blue' | 'purple' | 'amber' | 'gray';

export interface StatChip {
  label: string;
  color: ChipColor;
}

const colorClasses: Record<ChipColor, string> = {
  green:  'bg-green-950 text-green-400',
  red:    'bg-red-950 text-red-300',
  blue:   'bg-sky-950 text-sky-300',
  purple: 'bg-purple-950 text-purple-300',
  amber:  'bg-amber-950 text-amber-300',
  gray:   'bg-muted text-muted-foreground border',
};

interface CronStatChipsProps {
  chips: StatChip[];
}

export function CronStatChips({ chips }: CronStatChipsProps) {
  if (chips.length === 0) return null;
  return (
    <div className="mb-3 flex flex-wrap gap-1.5">
      {chips.map((chip, i) => (
        <span
          key={i}
          className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${colorClasses[chip.color]}`}
        >
          {chip.label}
        </span>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Verify build passes**

```bash
cd c:/Proyectos/mob/mob && npm run build 2>&1 | tail -10
```

- [ ] **Step 3: Commit**

```bash
git add components/admin/CronStatChips.tsx
git commit -m "feat: add CronStatChips component"
```

---

## Task 6: Create `CronRunLog` component

**Files:**
- Create: `components/admin/CronRunLog.tsx`

- [ ] **Step 1: Write the component**

```tsx
// components/admin/CronRunLog.tsx
'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { CronRun } from '@/lib/admin/queries';

export interface CronRunColumn {
  header: string;
  getValue: (run: CronRun) => string | number | null | undefined;
  color?: string; // Tailwind text-color class
}

interface CronRunLogProps {
  runs: CronRun[];
  columns: CronRunColumn[];
  pageSize?: number;
}

const statusStyles: Record<string, string> = {
  completed: 'bg-green-950 text-green-400',
  failed:    'bg-red-950 text-red-300',
  chained:   'bg-sky-950 text-sky-300',
  running:   'bg-muted text-muted-foreground',
};

const statusLabels: Record<string, string> = {
  completed: 'ok',
  failed:    'err',
  chained:   'chain',
  running:   '...',
};

export function CronRunLog({ runs, columns, pageSize = 5 }: CronRunLogProps) {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);

  if (runs.length === 0) return null;

  const totalPages = Math.ceil(runs.length / pageSize);
  const pageRuns = runs.slice(page * pageSize, page * pageSize + pageSize);

  return (
    <div className="mt-2 border-t pt-2">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        <span>Últimas ejecuciones</span>
        <span className="ml-auto text-[10px]">{runs.length} registros</span>
      </button>

      {open && (
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                {columns.map((col, i) => (
                  <th key={i} className="pb-1 pr-3 font-normal">{col.header}</th>
                ))}
                <th className="pb-1 font-normal">Estado</th>
              </tr>
            </thead>
            <tbody>
              {pageRuns.map((run) => (
                <tr key={run.id} className="border-b border-border/40 last:border-0">
                  {columns.map((col, i) => {
                    const val = col.getValue(run);
                    return (
                      <td
                        key={i}
                        className={`py-1 pr-3 tabular-nums ${col.color ?? 'text-muted-foreground'}`}
                      >
                        {val == null ? <span className="opacity-30">—</span> : val}
                      </td>
                    );
                  })}
                  <td className="py-1">
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${statusStyles[run.status] ?? statusStyles.running}`}>
                      {statusLabels[run.status] ?? run.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>pág. {page + 1} / {totalPages}</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setPage(p => p - 1)}
                  disabled={page === 0}
                  className="rounded border px-2 py-0.5 disabled:opacity-40 hover:bg-muted"
                >
                  ←
                </button>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= totalPages - 1}
                  className="rounded border px-2 py-0.5 disabled:opacity-40 hover:bg-muted"
                >
                  →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify build passes**

```bash
cd c:/Proyectos/mob/mob && npm run build 2>&1 | tail -10
```

- [ ] **Step 3: Commit**

```bash
git add components/admin/CronRunLog.tsx
git commit -m "feat: add CronRunLog component with toggle and pagination"
```

---

## Task 7: Wire up new components in admin page

**Files:**
- Modify: `app/admin/page.tsx`
- Delete: `components/admin/CronErrors.tsx`

- [ ] **Step 1: Update imports at the top of `app/admin/page.tsx`**

Find:
```typescript
import { SyncHealthChart } from "@/components/admin/charts/SyncHealthChart";
import { CronJobChart } from "@/components/admin/charts/CronJobChart";
import { CronErrors } from "@/components/admin/CronErrors";
```

Replace with:
```typescript
import { SyncHealthChart } from "@/components/admin/charts/SyncHealthChart";
import { CronJobChart } from "@/components/admin/charts/CronJobChart";
import { CronStatChips, type StatChip } from "@/components/admin/CronStatChips";
import { CronRunLog, type CronRunColumn } from "@/components/admin/CronRunLog";
```

- [ ] **Step 2: Add a `formatTime` helper near the top of the component (after imports, before the default export)**

```typescript
function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Argentina/Buenos_Aires',
  });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    timeZone: 'America/Argentina/Buenos_Aires',
  });
}
```

- [ ] **Step 3: Replace Tokko sync card `<CardContent>`**

Find:
```tsx
          <CardContent>
              <SyncHealthChart data={sync.days} />
              <CronErrors errors={sync.recentErrors} />
            </CardContent>
```

Replace with:
```tsx
          <CardContent>
              <CronStatChips chips={[
                { label: `+${sync.todayChips.propertiesAdded} nuevas hoy`, color: 'green' },
                { label: `↺ ${sync.todayChips.propertiesUpdated} actualizadas hoy`, color: 'blue' },
                { label: `✕ ${sync.todayChips.propertiesDeleted} eliminadas hoy`, color: 'red' },
                { label: `+${sync.todayChips.photosAdded} fotos hoy`, color: 'purple' },
              ] satisfies StatChip[]} />
              <SyncHealthChart data={sync.days} />
              <CronRunLog
                runs={sync.runs}
                columns={[
                  { header: 'Hora',   getValue: r => formatTime(r.startedAt),   color: 'text-sky-400' },
                  { header: 'Nuevas', getValue: r => r.propertiesAdded,          color: 'text-green-400' },
                  { header: 'Act.',   getValue: r => r.propertiesUpdated,         color: 'text-sky-300' },
                  { header: 'Elim.',  getValue: r => r.propertiesDeleted,         color: 'text-red-400' },
                  { header: 'Fotos+', getValue: r => r.photosAdded,              color: 'text-purple-400' },
                  { header: 'Fotos−', getValue: r => r.photosRemoved,            color: 'text-amber-400' },
                ] satisfies CronRunColumn[]}
              />
            </CardContent>
```

- [ ] **Step 4: Replace visitas card `<CardContent>`**

Find:
```tsx
            <CardContent>
              <CronJobChart data={visitasCron.days} />
              <CronErrors errors={visitasCron.recentErrors} />
            </CardContent>
```

Replace with:
```tsx
            <CardContent>
              <CronStatChips chips={[
                { label: `🔔 ${Number(visitasCron.todayChips.reminder24h ?? 0)} recordatorios 24h hoy`, color: 'blue' },
                { label: `⏰ ${Number(visitasCron.todayChips.reminder2h ?? 0)} recordatorios 2h hoy`, color: 'purple' },
                { label: `✅ ${Number(visitasCron.todayChips.postvisit ?? 0)} post-visita hoy`, color: 'green' },
              ] satisfies StatChip[]} />
              <CronJobChart data={visitasCron.days} />
              <CronRunLog
                runs={visitasCron.runs}
                columns={[
                  { header: 'Hora',        getValue: r => formatTime(r.startedAt),        color: 'text-sky-400' },
                  { header: '24h',         getValue: r => r.stats?.reminder24h as number, color: 'text-sky-300' },
                  { header: '2h',          getValue: r => r.stats?.reminder2h as number,  color: 'text-purple-300' },
                  { header: 'Post-visita', getValue: r => r.stats?.postvisit as number,   color: 'text-green-400' },
                ] satisfies CronRunColumn[]}
              />
            </CardContent>
```

- [ ] **Step 5: Replace tipo de cambio card `<CardContent>`**

Find:
```tsx
            <CardContent>
              <CronJobChart data={exchangeRateCron.days} />
              <CronErrors errors={exchangeRateCron.recentErrors} />
            </CardContent>
```

Replace with:
```tsx
            <CardContent>
              <CronStatChips chips={[
                ...(exchangeRateCron.todayChips.rate != null
                  ? [{ label: `$ ${Number(exchangeRateCron.todayChips.rate).toLocaleString('es-AR')} ARS/USD hoy`, color: 'green' as const }]
                  : []),
                ...(exchangeRateCron.todayChips.rebuilt != null
                  ? [{ label: `↺ ${Number(exchangeRateCron.todayChips.rebuilt)} recalculados`, color: 'blue' as const }]
                  : []),
              ]} />
              <CronJobChart data={exchangeRateCron.days} />
              <CronRunLog
                runs={exchangeRateCron.runs}
                columns={[
                  { header: 'Fecha',        getValue: r => formatDate(r.startedAt) },
                  { header: 'ARS/USD',      getValue: r => r.stats?.rate != null ? Number(r.stats.rate).toLocaleString('es-AR') : null, color: 'text-green-400' },
                  { header: 'Recalculados', getValue: r => r.stats?.rebuilt as number, color: 'text-sky-300' },
                ] satisfies CronRunColumn[]}
              />
            </CardContent>
```

- [ ] **Step 6: Replace mailing card `<CardContent>`**

Find:
```tsx
            <CardContent>
              <CronJobChart data={mailingCron.days} />
              <CronErrors errors={mailingCron.recentErrors} />
            </CardContent>
```

Replace with:
```tsx
            <CardContent>
              <CronStatChips chips={[
                { label: `✉ ${Number(mailingCron.todayChips.emailsSent ?? 0)} emails hoy`, color: 'green' },
                { label: `👥 ${Number(mailingCron.todayChips.usersChecked ?? 0)} revisados`, color: 'blue' },
                ...(Number(mailingCron.todayChips.skipped ?? 0) > 0
                  ? [{ label: `— ${Number(mailingCron.todayChips.skipped)} saltados`, color: 'gray' as const }]
                  : []),
              ] satisfies StatChip[]} />
              <CronJobChart data={mailingCron.days} />
              <CronRunLog
                runs={mailingCron.runs}
                columns={[
                  { header: 'Hora',      getValue: r => formatTime(r.startedAt),            color: 'text-sky-400' },
                  { header: 'Emails',    getValue: r => r.stats?.emailsSent as number,       color: 'text-green-400' },
                  { header: 'Revisados', getValue: r => r.stats?.usersChecked as number,     color: 'text-sky-300' },
                  { header: 'Saltados',  getValue: r => r.stats?.skipped as number },
                  { header: 'Chain',     getValue: r => r.stats?.chain as number,            color: 'text-amber-400' },
                ] satisfies CronRunColumn[]}
              />
            </CardContent>
```

- [ ] **Step 7: Replace IPC card `<CardContent>`**

Find:
```tsx
            <CardContent>
              <CronJobChart data={ipcCron.days} />
              <CronErrors errors={ipcCron.recentErrors} />
            </CardContent>
```

Replace with:
```tsx
            <CardContent>
              <CronStatChips chips={[
                ...(ipcCron.todayChips.latestMonth != null
                  ? [{ label: `📈 ${String(ipcCron.todayChips.latestMonth)}: ${Number(ipcCron.todayChips.latestRate).toFixed(1)}% IPC`, color: 'green' as const }]
                  : []),
                ...(Number(ipcCron.todayChips.monthsUpserted ?? 0) > 0
                  ? [{ label: `${Number(ipcCron.todayChips.monthsUpserted)} meses actualizados`, color: 'blue' as const }]
                  : []),
              ]} />
              <CronJobChart data={ipcCron.days} />
              <CronRunLog
                runs={ipcCron.runs}
                columns={[
                  { header: 'Fecha',      getValue: r => formatDate(r.startedAt) },
                  { header: 'Último mes', getValue: r => r.stats?.latestMonth as string, color: 'text-sky-300' },
                  { header: 'IPC %',      getValue: r => r.stats?.latestRate != null ? `${Number(r.stats.latestRate).toFixed(1)}%` : null, color: 'text-green-400' },
                ] satisfies CronRunColumn[]}
              />
            </CardContent>
```

- [ ] **Step 8: Delete `CronErrors.tsx`**

```bash
rm c:/Proyectos/mob/mob/components/admin/CronErrors.tsx
```

- [ ] **Step 9: Full build and lint**

```bash
cd c:/Proyectos/mob/mob && npm run lint && npm run build 2>&1 | tail -30
```

Expected: no errors. If lint errors appear on unused `recentErrors` properties in queries.ts, they can be left as-is (they remain in the return type for backwards compatibility but are no longer consumed).

- [ ] **Step 10: Commit**

```bash
git add app/admin/page.tsx
git rm components/admin/CronErrors.tsx
git commit -m "feat: add stat chips and run log to all cron health cards"
```

---

## Final verification

- [ ] Run `npm run dev` and open `http://localhost:3000/admin`
- [ ] Confirm all 5 cron cards show colored stat chips above their charts
- [ ] Confirm "Últimas ejecuciones" toggle opens and closes on each card
- [ ] Confirm pagination prev/next works and shows "pág. N / total"
- [ ] Confirm bar charts are unchanged
- [ ] Push to `develop` branch and verify Vercel preview build passes
