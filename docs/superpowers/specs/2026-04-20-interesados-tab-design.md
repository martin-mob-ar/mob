# Interesados Tab — Property Detail (B2B)

**Route**: `/gestion/propiedad/[propertyId]`
**Date**: 2026-04-20

## Goal

Replace the current empty/mock "Interesados" tab with real analytics showing the property owner how much interest their listing is generating. The tab becomes an engagement dashboard for a single property.

## What It Shows

### 1. Stats Row (two cards, side by side)

**Card 1 — "Personas que vieron"**
- Primary number: unique viewers (deduplicated by `user_id` or `session_id`)
- Secondary detail: total views (e.g. "142 vistas totales")

**Card 2 — "Guardados"**
- Primary number: count of users who saved/favorited this property
- Subtitle: "personas guardaron esta propiedad"

### 2. Views Trend Chart

- **Type**: Area chart (Recharts — already installed)
- **X-axis**: Dates since property publication, auto-grouped:
  - ≤30 days → daily
  - ≤180 days → weekly
  - >180 days → monthly
- **Y-axis**: View count per period
- **Style**: Subtle fill with primary color, matching existing UI tokens

### 3. Empty State

If zero views and zero saves: friendly message explaining that stats will appear once the property starts getting visits.

## Data Sources

### property_events table (views)
```sql
-- Unique viewers
SELECT COUNT(DISTINCT COALESCE(user_id, session_id, ip_hash))
FROM property_events
WHERE property_id = :id AND event_type = 'property_view';

-- Total views
SELECT COUNT(*)
FROM property_events
WHERE property_id = :id AND event_type = 'property_view';

-- Daily series for chart
SELECT DATE(created_at) AS day, COUNT(*) AS views
FROM property_events
WHERE property_id = :id AND event_type = 'property_view'
GROUP BY DATE(created_at)
ORDER BY day;
```

### favoritos table (saves)
```sql
SELECT COUNT(*)
FROM favoritos
WHERE property_id = :id;
```

## Architecture

**Server-only approach** — all data fetched in the page server component (`app/gestion/propiedad/[propertyId]/page.tsx`), passed as props to `PropertyDetailView`.

No new API routes. No client-side fetching.

### Props added to PropertyDetailView:
```typescript
interesadosStats: {
  uniqueViewers: number;
  totalViews: number;
  savesCount: number;
  viewsSeries: Array<{ date: string; views: number }>;
}
```

### Chart component:
New client component `components/panel/InteresadosChart.tsx` using Recharts `AreaChart`. Marked `'use client'` since Recharts requires client rendering.

## Scope Boundaries

**In scope:**
- Stats cards + trend chart in Interesados tab
- Server-side data fetching
- Empty state

**Out of scope (future work):**
- Visitas presenciales tab content (visita leads)
- Lead stage management
- Notifications to owner on new views/saves
- Comparative analytics (vs similar properties)

## Tab Assignment Recap

| Tab | Content |
|-----|---------|
| **Interesados** | Views stats + saves count + trend chart (this spec) |
| **Visitas presenciales** | Visita leads from `leads` + `visitas` tables (future) |
| **Contrato** | Existing contract/operation info (unchanged) |

## Files to Create/Modify

| File | Action |
|------|--------|
| `app/gestion/propiedad/[propertyId]/page.tsx` | Add queries for views, saves, series; pass as props |
| `views/panel/PropertyDetailView.tsx` | Receive new props, render stats cards + chart in Interesados tab |
| `components/panel/InteresadosChart.tsx` | New — Recharts AreaChart client component |
