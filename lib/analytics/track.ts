/**
 * Client-side analytics helpers for first-party event tracking.
 *
 * Session ID is stored in sessionStorage (per-tab, survives same-tab navigations).
 * The server-set `mob_anon_id` httpOnly cookie is the canonical anon identity,
 * but the client-generated sessionId is used as a fallback for the first request
 * (before the cookie round-trips) and for forwarding into form POST bodies.
 */

const SESSION_KEY = 'mob:analytics_sid';

export type ClientEventType =
  | 'property_view'
  | 'agendar_visita_submit_started';

/** Get or create a per-session analytics ID (sessionStorage-backed). */
export function getAnalyticsSessionId(): string {
  if (typeof window === 'undefined') return '';
  let sid = sessionStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, sid);
  }
  return sid;
}

/**
 * Fire a property event to the first-party analytics endpoint.
 * Fire-and-forget — never blocks UI or throws.
 */
export function trackPropertyEvent(
  propertyId: number,
  eventType: ClientEventType,
  metadata?: Record<string, unknown>,
) {
  if (!propertyId) return;
  fetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      propertyId,
      eventType,
      sessionId: getAnalyticsSessionId(),
      ...(metadata ? { metadata } : {}),
    }),
    keepalive: true,
  }).catch(() => {});
}
