/**
 * Microsoft Clarity custom tags and events.
 * @see https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-api
 */

/** Set a custom tag (key-value) on the current Clarity session. */
export function claritySet(key: string, value: string): void {
  if (typeof window !== 'undefined' && typeof window.clarity === 'function') {
    window.clarity('set', key, value);
  }
}

/** Track a custom event in Clarity. */
export function clarityEvent(name: string): void {
  if (typeof window !== 'undefined' && typeof window.clarity === 'function') {
    window.clarity('event', name);
  }
}

/** Identify a user across Clarity sessions. */
export function clarityIdentify(userId: string): void {
  if (typeof window !== 'undefined' && typeof window.clarity === 'function') {
    window.clarity('identify', userId);
  }
}
