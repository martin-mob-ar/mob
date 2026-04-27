# Admin Table Filters Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add inline filter dropdowns to all three admin tables — sort control on TopPropertiesTable (client-side), user-type filter on TopUsersTable (URL param), and three filters on PropertyEventsTable (URL params).

**Architecture:** Hybrid approach — the one table without pagination (TopPropertiesTable) uses client-side `useMemo` sorting; the two paginated tables use URL params so filters apply across all pages, following the pattern already used by `usersSearch`. A shared `AdminSelect` component wraps shadcn's existing `Select` at `h-8 text-sm` for consistent sizing.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, shadcn/ui (`Select` from `@radix-ui/react-select`), Supabase PostgREST client.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `components/admin/AdminSelect.tsx` | **Create** | Presentational Select wrapper, `h-8 text-sm`, no state |
| `components/admin/TopPropertiesTable.tsx` | Modify | Add `sortBy` state + sort in `useMemo` + `AdminSelect` |
| `lib/admin/queries.ts` | Modify | `getTopUsersByEvents` + `getPropertyRecentEvents` accept filter params |
| `components/admin/TopUsersTable.tsx` | Modify | Add `currentUsersType` prop + `AdminSelect` + URL update |
| `app/admin/page.tsx` | Modify | Read `usersType` from `searchParams`, pass to query + component |
| `components/admin/PropertyEventsTable.tsx` | Modify | Add 3 filter props + 3 `AdminSelect` + URL updates |
| `app/admin/properties/[id]/page.tsx` | Modify | Read 3 filter params, pass to query + component |

---

## Task 1: Create AdminSelect shared component

**Files:**
- Create: `components/admin/AdminSelect.tsx`

- [ ] **Step 1: Create the file**

```tsx
// components/admin/AdminSelect.tsx
"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface AdminSelectOption {
  value: string;
  label: string;
}

interface AdminSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: AdminSelectOption[];
}

export function AdminSelect({ value, onChange, options }: AdminSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-8 text-sm w-auto min-w-[130px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

- [ ] **Step 2: Verify types**

Run from `c:/Proyectos/mob/mob`:
```bash
npx tsc --noEmit
```
Expected: no errors related to the new file.

- [ ] **Step 3: Commit**

```bash
git add components/admin/AdminSelect.tsx
git commit -m "feat(admin): add AdminSelect shared filter component"
```

---

## Task 2: TopPropertiesTable — sort dropdown (client-side)

**Files:**
- Modify: `components/admin/TopPropertiesTable.tsx`

The current file has a `useMemo` that filters by search text. We extend it to also sort by the selected field, and add the `AdminSelect` next to the existing search `Input`.

- [ ] **Step 1: Add `sortBy` state and extend `useMemo`**

Replace the existing imports and the top of the component (lines 1–26) with:

```tsx
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AdminSelect } from "@/components/admin/AdminSelect";
import type { PropertyEngagementRow } from "@/lib/admin/queries";

type SortField = "views" | "submits_started" | "submits" | "unique_visitors";

interface TopPropertiesTableProps {
  data: PropertyEngagementRow[];
}

export default function TopPropertiesTable({ data }: TopPropertiesTableProps) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortField>("views");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const result = term
      ? data.filter(
          (row) =>
            (row.address && row.address.toLowerCase().includes(term)) ||
            (row.location_name && row.location_name.toLowerCase().includes(term))
        )
      : data;
    return [...result].sort((a, b) => b[sortBy] - a[sortBy]);
  }, [data, search, sortBy]);
```

- [ ] **Step 2: Replace the search-only filter bar with search + sort**

Find the existing filter bar section (the `<div className="relative mb-3">` block) and replace it with:

```tsx
      {/* Filter bar */}
      <div className="flex items-center gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por dirección o ubicación..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-8 h-8 text-sm"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <AdminSelect
          value={sortBy}
          onChange={(v) => setSortBy(v as SortField)}
          options={[
            { value: "views", label: "Vistas" },
            { value: "submits_started", label: "Envíos iniciados" },
            { value: "submits", label: "Completados" },
            { value: "unique_visitors", label: "Visitantes únicos" },
          ]}
        />
      </div>
```

- [ ] **Step 3: Verify types**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Smoke-check in browser**

```bash
npm run dev
```
Open `http://localhost:3000/admin`. Verify:
- "Ordenar por" dropdown appears next to the search box on the properties table
- Changing to "Visitantes únicos" re-sorts the rows descending by that column
- Search still works alongside sort

- [ ] **Step 5: Commit**

```bash
git add components/admin/TopPropertiesTable.tsx
git commit -m "feat(admin): add sortBy filter to TopPropertiesTable"
```

---

## Task 3: Update getTopUsersByEvents query — add userType filter

**Files:**
- Modify: `lib/admin/queries.ts`

- [ ] **Step 1: Add `userType` parameter and apply filter**

Find the `getTopUsersByEvents` function signature:
```typescript
export async function getTopUsersByEvents(
  periodDays: number | null,
  page: number = 1,
  pageSize: number = 20,
  search?: string,
): Promise<TopUsersResult> {
```

Replace it with:
```typescript
export async function getTopUsersByEvents(
  periodDays: number | null,
  page: number = 1,
  pageSize: number = 20,
  search?: string,
  userType?: "all" | "auth" | "anon",
): Promise<TopUsersResult> {
```

Then find the line:
```typescript
  // Sort actors by total interactions
  const sorted = Array.from(byActor.entries())
    .sort((a, b) => b[1].total - a[1].total);

  // If searching, resolve matching actor keys before pagination
  let filtered = sorted;
```

Replace it with:
```typescript
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
```

- [ ] **Step 2: Verify types**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/admin/queries.ts
git commit -m "feat(admin): add userType filter to getTopUsersByEvents"
```

---

## Task 4: Wire usersType in /admin page + TopUsersTable component

**Files:**
- Modify: `app/admin/page.tsx`
- Modify: `components/admin/TopUsersTable.tsx`

### Part A — page.tsx

- [ ] **Step 1: Read `usersType` from searchParams and pass it through**

In `app/admin/page.tsx`, find:
```typescript
export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; usersPage?: string; usersSearch?: string }>;
}) {
  const { period: rawPeriod, usersPage: rawUsersPage, usersSearch } = await searchParams;
```

Replace with:
```typescript
export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; usersPage?: string; usersSearch?: string; usersType?: string }>;
}) {
  const { period: rawPeriod, usersPage: rawUsersPage, usersSearch, usersType: rawUsersType } = await searchParams;
  const usersType = (rawUsersType === "auth" || rawUsersType === "anon") ? rawUsersType : "all";
```

Find the `getTopUsersByEvents` call:
```typescript
    getTopUsersByEvents(periodDays, usersPage, 20, usersSearch),
```
Replace with:
```typescript
    getTopUsersByEvents(periodDays, usersPage, 20, usersSearch, usersType),
```

Find the `<TopUsersTable` JSX:
```tsx
          <TopUsersTable
            data={topUsers.rows}
            breakdowns={topUsers.breakdowns}
            totalActors={topUsers.totalActors}
            currentPage={usersPage}
            pageSize={20}
            currentSearch={usersSearch ?? ""}
          />
```
Replace with:
```tsx
          <TopUsersTable
            data={topUsers.rows}
            breakdowns={topUsers.breakdowns}
            totalActors={topUsers.totalActors}
            currentPage={usersPage}
            pageSize={20}
            currentSearch={usersSearch ?? ""}
            currentUsersType={usersType}
          />
```

### Part B — TopUsersTable.tsx

- [ ] **Step 2: Add `currentUsersType` prop and user type filter control**

Find the `TopUsersTableProps` interface:
```typescript
interface TopUsersTableProps {
  data: UserEventRow[];
  breakdowns: Record<string, UserPropertyBreakdownRow[]>;
  totalActors: number;
  currentPage: number;
  pageSize: number;
  currentSearch: string;
}
```
Replace with:
```typescript
interface TopUsersTableProps {
  data: UserEventRow[];
  breakdowns: Record<string, UserPropertyBreakdownRow[]>;
  totalActors: number;
  currentPage: number;
  pageSize: number;
  currentSearch: string;
  currentUsersType: "all" | "auth" | "anon";
}
```

Find the destructuring in the function signature:
```typescript
export default function TopUsersTable({
  data,
  breakdowns,
  totalActors,
  currentPage,
  pageSize,
  currentSearch,
}: TopUsersTableProps) {
```
Replace with:
```typescript
export default function TopUsersTable({
  data,
  breakdowns,
  totalActors,
  currentPage,
  pageSize,
  currentSearch,
  currentUsersType,
}: TopUsersTableProps) {
```

- [ ] **Step 3: Add import and applyUsersType function**

Add `AdminSelect` to the imports at the top of the file (after the existing imports):
```typescript
import { AdminSelect } from "@/components/admin/AdminSelect";
```

Add `applyUsersType` right after the existing `clearSearch` function:
```typescript
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
```

- [ ] **Step 4: Add the filter dropdown to the search bar**

Find the existing search bar JSX. It currently looks like:
```tsx
      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          ...
        />
        {searchValue && (
          <button ...>
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
```

Replace the entire search div wrapper with a flex row that contains both the search and the new select:
```tsx
      {/* Filter bar */}
      <div className="flex items-center gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar usuario..."
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
```

- [ ] **Step 5: Verify types**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 6: Smoke-check in browser**

Open `http://localhost:3000/admin`. Verify:
- "Todos / Autenticados / Anónimos" dropdown appears next to the users search box
- Selecting "Autenticados" updates the URL to `?usersType=auth` and re-fetches, showing only rows where the user icon is the person icon (not globe)
- Selecting "Anónimos" shows only globe-icon rows
- "Todos" removes `usersType` from the URL
- Changing user type resets to page 1

- [ ] **Step 7: Commit**

```bash
git add app/admin/page.tsx components/admin/TopUsersTable.tsx
git commit -m "feat(admin): add usersType filter to TopUsersTable"
```

---

## Task 5: Update getPropertyRecentEvents query — add event filters

**Files:**
- Modify: `lib/admin/queries.ts`

- [ ] **Step 1: Add filters parameter to getPropertyRecentEvents**

Find the existing function signature:
```typescript
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
```

Replace the entire block (from the signature down to `.range(from, to)`) with:

```typescript
export async function getPropertyRecentEvents(
  propertyId: number,
  page: number = 1,
  pageSize: number = 50,
  filters?: { eventType?: string; attribution?: string; userType?: string },
): Promise<PropertyRecentEventsResult> {
  // Count query — apply same filters for accurate pagination totals
  let countQuery = supabaseAdmin
    .from('property_events')
    .select('id', { count: 'exact', head: true })
    .eq('property_id', propertyId);

  if (filters?.eventType && filters.eventType !== "all") {
    countQuery = countQuery.eq('event_type', filters.eventType);
  }
  if (filters?.attribution && filters.attribution !== "all") {
    countQuery = countQuery.filter('metadata->>attribution_status', 'eq', filters.attribution);
  }
  if (filters?.userType === "auth") {
    countQuery = countQuery.not('user_id', 'is', null);
  } else if (filters?.userType === "anon") {
    countQuery = countQuery.is('user_id', null);
  }

  const { count } = await countQuery;

  const total = count ?? 0;
  if (total === 0) return { events: [], total: 0 };

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // Data query — same filters
  let dataQuery = supabaseAdmin
    .from('property_events')
    .select('id, event_type, user_id, session_id, metadata, created_at')
    .eq('property_id', propertyId)
    .order('created_at', { ascending: false });

  if (filters?.eventType && filters.eventType !== "all") {
    dataQuery = dataQuery.eq('event_type', filters.eventType);
  }
  if (filters?.attribution && filters.attribution !== "all") {
    dataQuery = dataQuery.filter('metadata->>attribution_status', 'eq', filters.attribution);
  }
  if (filters?.userType === "auth") {
    dataQuery = dataQuery.not('user_id', 'is', null);
  } else if (filters?.userType === "anon") {
    dataQuery = dataQuery.is('user_id', null);
  }

  const { data: events } = await dataQuery.range(from, to);
```

- [ ] **Step 2: Verify types**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/admin/queries.ts
git commit -m "feat(admin): add event filters to getPropertyRecentEvents"
```

---

## Task 6: Wire event filters in property page + PropertyEventsTable component

**Files:**
- Modify: `app/admin/properties/[id]/page.tsx`
- Modify: `components/admin/PropertyEventsTable.tsx`

### Part A — property page

- [ ] **Step 1: Read filter params from searchParams**

Find:
```typescript
  searchParams: Promise<{ period?: string; eventsPage?: string }>;
}) {
  const { id: rawId } = await params;
  const propertyId = parseInt(rawId, 10);
  if (isNaN(propertyId)) notFound();

  const { period: rawPeriod, eventsPage: rawEventsPage } = await searchParams;
```

Replace with:
```typescript
  searchParams: Promise<{ period?: string; eventsPage?: string; eventsType?: string; eventsAttribution?: string; eventsUserType?: string }>;
}) {
  const { id: rawId } = await params;
  const propertyId = parseInt(rawId, 10);
  if (isNaN(propertyId)) notFound();

  const { period: rawPeriod, eventsPage: rawEventsPage, eventsType, eventsAttribution, eventsUserType } = await searchParams;

  const eventsFilters = {
    eventType: eventsType ?? "all",
    attribution: eventsAttribution ?? "all",
    userType: (eventsUserType === "auth" || eventsUserType === "anon") ? eventsUserType : "all",
  };
```

Find the `getPropertyRecentEvents` call:
```typescript
    getPropertyRecentEvents(propertyId, eventsPage, 50),
```
Replace with:
```typescript
    getPropertyRecentEvents(propertyId, eventsPage, 50, eventsFilters),
```

Find the `<PropertyEventsTable` JSX:
```tsx
      <PropertyEventsTable
        events={eventsResult.events}
        total={eventsResult.total}
        currentPage={eventsPage}
        pageSize={50}
      />
```
Replace with:
```tsx
      <PropertyEventsTable
        events={eventsResult.events}
        total={eventsResult.total}
        currentPage={eventsPage}
        pageSize={50}
        currentEventsType={eventsFilters.eventType}
        currentAttribution={eventsFilters.attribution}
        currentEventsUserType={eventsFilters.userType}
      />
```

### Part B — PropertyEventsTable.tsx

- [ ] **Step 2: Add filter props to the interface**

Find:
```typescript
interface PropertyEventsTableProps {
  events: PropertyRecentEvent[];
  total: number;
  currentPage: number;
  pageSize: number;
}
```
Replace with:
```typescript
interface PropertyEventsTableProps {
  events: PropertyRecentEvent[];
  total: number;
  currentPage: number;
  pageSize: number;
  currentEventsType: string;
  currentAttribution: string;
  currentEventsUserType: string;
}
```

- [ ] **Step 3: Destructure new props**

Find:
```typescript
export function PropertyEventsTable({
  events,
  total,
  currentPage,
  pageSize,
}: PropertyEventsTableProps) {
```
Replace with:
```typescript
export function PropertyEventsTable({
  events,
  total,
  currentPage,
  pageSize,
  currentEventsType,
  currentAttribution,
  currentEventsUserType,
}: PropertyEventsTableProps) {
```

- [ ] **Step 4: Add AdminSelect import and applyFilter helper**

Add to the existing imports at the top of the file:
```typescript
import { AdminSelect } from "@/components/admin/AdminSelect";
```

Add `applyFilter` right after the `goToPage` function:
```typescript
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
```

- [ ] **Step 5: Add filter bar above the table**

Inside `<CardContent>`, find:
```tsx
        {events.length === 0 && total === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Sin eventos registrados.
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
```

Replace with:
```tsx
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
```

- [ ] **Step 6: Verify types**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 7: Smoke-check in browser**

Open `http://localhost:3000/admin`, click any property row to go to `/admin/properties/{id}`. Verify:
- Three dropdowns appear above the events table: "Tipo: Todos", "Atribución: Todas", "Usuario: Todos"
- Selecting "Vista" updates the URL to `?eventsType=property_view` and re-fetches showing only view events
- Selecting "Sesión directa" in Attribution shows only events with `attribution_status = direct_session`
- Selecting "Anónimos" shows only events without a user name
- Each filter change resets the table to page 1
- The total count shown in the table header updates to reflect the filtered count
- Resetting a filter back to "Todos" removes the param from the URL

- [ ] **Step 8: Commit**

```bash
git add app/admin/properties/[id]/page.tsx components/admin/PropertyEventsTable.tsx
git commit -m "feat(admin): add event filters to PropertyEventsTable"
```

---

## Self-Review Checklist

**Spec coverage:**
- ✅ Table 1: `sortBy` dropdown with Vistas/Envíos iniciados/Completados/Visitantes únicos
- ✅ Table 2: `usersType` URL param with Todos/Autenticados/Anónimos
- ✅ Table 3: `eventsType`, `eventsAttribution`, `eventsUserType` URL params
- ✅ `AdminSelect` wrapping shadcn Select at `h-8 text-sm`
- ✅ Filters on Table 2 & 3 reset pagination to page 1
- ✅ Count query in `getPropertyRecentEvents` also applies filters (accurate pagination totals)
- ✅ All params omitted from URL when value is `"all"`

**Type consistency:**
- `SortField` defined in Task 2, used only in Task 2 ✅
- `AdminSelectOption` exported from Task 1, used in Tasks 2, 4, 6 ✅
- `filters` param shape `{ eventType, attribution, userType }` defined in Task 5, used in Task 6 ✅
- `currentEventsType`, `currentAttribution`, `currentEventsUserType` defined in Task 6 Part B, passed in Task 6 Part A ✅
- `currentUsersType` defined in Task 4 Part B, passed in Task 4 Part A ✅
