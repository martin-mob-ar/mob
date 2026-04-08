/**
 * Google Tag Manager dataLayer push helper.
 * GTM must be loaded via layout.tsx for events to fire.
 */
export function gtmEvent(eventName: string, data?: Record<string, unknown>): void {
  if (typeof window !== 'undefined' && Array.isArray(window.dataLayer)) {
    window.dataLayer.push({ event: eventName, ...data });
  }
}
