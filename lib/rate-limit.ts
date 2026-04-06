/**
 * Lightweight in-memory rate limiter for API routes.
 *
 * Uses a sliding window approach with periodic cleanup.
 * Works well on Vercel serverless — the same instance handles bursts,
 * so in-memory state provides effective protection against rapid abuse.
 *
 * For distributed rate limiting at higher scale, migrate to Upstash Redis.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 60 seconds
let cleanupScheduled = false;
function scheduleCleanup() {
  if (cleanupScheduled) return;
  cleanupScheduled = true;
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now > entry.resetAt) store.delete(key);
    }
  }, 60_000).unref();
}

/**
 * Check rate limit for a given identifier.
 *
 * @param identifier - Unique key (e.g., IP address)
 * @param route - Route name for namespacing (e.g., "leads", "ai-describe")
 * @param limit - Max requests allowed in the window
 * @param windowMs - Time window in milliseconds (default: 60_000 = 1 minute)
 * @returns { success, remaining, resetIn } — success=false means rate limited
 */
export function checkRateLimit(
  identifier: string,
  route: string,
  limit: number,
  windowMs: number = 60_000
): { success: boolean; remaining: number; resetIn: number } {
  scheduleCleanup();

  const key = `${route}:${identifier}`;
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    // New window
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, resetIn: windowMs };
  }

  if (entry.count >= limit) {
    // Rate limited
    return {
      success: false,
      remaining: 0,
      resetIn: entry.resetAt - now,
    };
  }

  // Increment
  entry.count++;
  return {
    success: true,
    remaining: limit - entry.count,
    resetIn: entry.resetAt - now,
  };
}

/**
 * Get the client IP from a request.
 * Uses x-forwarded-for (set by Vercel/reverse proxies) or falls back to x-real-ip.
 */
export function getClientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

/**
 * Create a rate-limited 429 response with standard headers.
 */
export function rateLimitResponse(resetIn: number) {
  return new Response(
    JSON.stringify({ error: 'Demasiadas solicitudes. Intentá de nuevo en unos minutos.' }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(Math.ceil(resetIn / 1000)),
      },
    }
  );
}
