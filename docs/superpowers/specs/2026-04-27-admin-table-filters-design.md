# Admin Table Filters — Design Spec

**Date:** 2026-04-27
**Status:** Approved

---

## Overview

Add inline filter controls to all three admin tables so that data can be narrowed without leaving the page. The visual pattern is Option A: filters sit in a horizontal bar directly above each table, extending the existing search input.

---

## Tables in Scope

| # | Table | Route | Pagination |
|---|---|---|---|
| 1 | Propiedades con más interacción | `/admin` | No (20 rows max) |
| 2 | Usuarios con más interacción | `/admin` | Yes (URL-based) |
| 3 | Eventos recientes | `/admin/properties/[id]` | Yes (URL-based) |

---

## Filter Strategy: Hybrid (client-side / URL-param)

- **Tables without pagination** → filters applied client-side in `useMemo`. No server round-trip.
- **Tables with pagination** → filters stored in URL params and applied server-side in the query. Ensures correct totals and paginated results across all pages.

This matches the existing pattern: `TopUsersTable` already uses `usersSearch` as a URL param for its text search.

---

## Table 1 — TopPropertiesTable

### New filter
| Control | Values | Default |
|---|---|---|
| Ordenar por | Vistas / Envíos iniciados / Completados / Visitantes únicos | Vistas |

### Implementation
- Add `sortBy` state: `"views" | "submits_started" | "submits" | "unique_visitors"` (default `"views"`)
- Extend the existing `useMemo` to sort `filtered` by the selected field descending
- Add `AdminSelect` component next to the existing search `Input`
- No URL param changes, no server changes

### Filter bar layout
```
[🔍 Buscar por dirección o ubicación...] [Ordenar por: Vistas ▾]
```

### Notes
- The server query (`getTopPropertiesByEngagement`) already sorts by `views` and returns the top 20. Client-side re-sort reorders within that set, which is the expected and acceptable behavior.
- The global `PeriodSelector` at the top of `/admin` already controls the dataset period for this table.

---

## Table 2 — TopUsersTable

### New filter
| Control | URL param | Values | Default |
|---|---|---|---|
| Tipo de usuario | `usersType` | `all` / `auth` / `anon` | `all` (omitted from URL) |

### Implementation

**`lib/admin/queries.ts` — `getTopUsersByEvents`:**
- Add `userType?: "all" | "auth" | "anon"` parameter (default `"all"`)
- After building the `byActor` map and before sorting, filter actors:
  - `"auth"` → keep only `actor.isAuthenticated === true`
  - `"anon"` → keep only `actor.isAuthenticated === false`
  - `"all"` → no filter

**`components/admin/TopUsersTable.tsx`:**
- Add `currentUsersType: "all" | "auth" | "anon"` prop
- Add `AdminSelect` next to search input
- On change: update `usersType` URL param, delete `usersPage` (reset to page 1)
- Use the same `useSearchParams + useRouter` pattern already in the component

**`app/admin/page.tsx`:**
- Read `usersType` from `searchParams`
- Pass to `getTopUsersByEvents` and as prop to `TopUsersTable`

### Filter bar layout
```
[🔍 Buscar usuario...] [Usuario: Todos ▾]
```

---

## Table 3 — PropertyEventsTable

### New filters
| Control | URL param | Values | Default |
|---|---|---|---|
| Tipo de evento | `eventsType` | `all` / `property_view` / `agendar_visita_submit_started` / `agendar_visita_verification_requested` / `agendar_visita_submit` | `all` |
| Atribución | `eventsAttribution` | `all` / `direct_session` / `recovered_via_user` / `unattributed` | `all` |
| Tipo de usuario | `eventsUserType` | `all` / `auth` / `anon` | `all` |

### Implementation

**`lib/admin/queries.ts` — `getPropertyRecentEvents`:**
- Add `filters?: { eventType?: string; attribution?: string; userType?: string }` parameter
- Apply to the Supabase query before `.range()`:
  - `eventType` (not `"all"`) → `.eq('event_type', eventType)`
  - `attribution` (not `"all"`) → `.filter('metadata->>attribution_status', 'eq', attribution)`
  - `userType === "auth"` → `.not('user_id', 'is', null)`
  - `userType === "anon"` → `.is('user_id', null)`
- Apply the same filters to the `count` query so pagination totals are accurate

**`components/admin/PropertyEventsTable.tsx`:**
- Add 3 props: `currentEventsType`, `currentAttribution`, `currentEventsUserType`
- Add 3 `AdminSelect` dropdowns above the table
- On any change: update the corresponding URL param, delete `eventsPage` (reset to page 1)
- Use the same `useSearchParams + useRouter` pattern

**`app/admin/properties/[id]/page.tsx`:**
- Read `eventsType`, `eventsAttribution`, `eventsUserType` from `searchParams`
- Pass to `getPropertyRecentEvents` as `filters`
- Pass current values as props to `PropertyEventsTable`

### Filter bar layout
```
[Tipo: Todos ▾] [Atribución: Todas ▾] [Usuario: Todos ▾]
```

---

## Shared Component — AdminSelect

**File:** `components/admin/AdminSelect.tsx`

A thin presentational wrapper around the existing shadcn `Select` component (`components/ui/select.tsx`). Provides consistent sizing (`h-8 text-sm`) matching the admin search `Input`.

```typescript
interface AdminSelectOption {
  value: string;
  label: string;
}
interface AdminSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: AdminSelectOption[];
}
```

No URL logic, no state. Each table handles its own URL updates internally.

---

## Files Changed

| File | Type | Change |
|---|---|---|
| `components/admin/AdminSelect.tsx` | **New** | Shared styled Select wrapper |
| `lib/admin/queries.ts` | Modified | `getTopUsersByEvents` + `getPropertyRecentEvents` accept filter params |
| `components/admin/TopPropertiesTable.tsx` | Modified | `sortBy` state + `useMemo` sort + `AdminSelect` |
| `components/admin/TopUsersTable.tsx` | Modified | `currentUsersType` prop + `AdminSelect` + URL update |
| `components/admin/PropertyEventsTable.tsx` | Modified | 3 filter props + 3 `AdminSelect` + URL updates |
| `app/admin/page.tsx` | Modified | Read `usersType` from `searchParams`, pass to query + component |
| `app/admin/properties/[id]/page.tsx` | Modified | Read 3 filter params, pass to query + component |

---

## URL Parameter Reference

All params use `router.replace` (no history entry). Omitted from URL when value is the default (`"all"`).

| Param | Table | Default | Resets |
|---|---|---|---|
| `usersType` | 2 | omitted | `usersPage` |
| `eventsType` | 3 | omitted | `eventsPage` |
| `eventsAttribution` | 3 | omitted | `eventsPage` |
| `eventsUserType` | 3 | omitted | `eventsPage` |

---

## Out of Scope

- Free-text search on Table 3 (no search input on events table — the table already has column sorting)
- Date range pickers per table (the global `PeriodSelector` on `/admin` serves this purpose; `/admin/properties/[id]` also has a `period` param)
- Export / download filtered results
