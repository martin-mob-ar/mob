import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.2,

  // Session Replay (optional, low sample rate)
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,

  environment: process.env.VERCEL_ENV || process.env.NODE_ENV,
  enabled: process.env.NODE_ENV === "production",

  // Filter out known third-party errors that are not actionable
  ignoreErrors: [
    // Google Maps errors in limited browsers (e.g. Instagram WebView)
    /Could not load ".*"/,
    // Network failures from ad blockers blocking Google services
    "Failed to fetch",
    // Common browser noise
    "ResizeObserver loop",
    "ResizeObserver loop completed with undelivered notifications",
    // Navigation aborts
    "AbortError",
    // Instagram/WebView internal errors
    "Java object is gone",
    // Browser extensions
    /^chrome-extension:\/\//,
    /^moz-extension:\/\//,
  ],

  // Ignore errors originating from third-party scripts
  denyUrls: [
    // Google Tag Manager / Analytics
    /gtag\/js/i,
    /google-analytics\.com/i,
    /googletagmanager\.com/i,
    // Google Maps
    /maps\.googleapis\.com/i,
    /maps-api-v3/i,
    // Microsoft Clarity
    /clarity\.ms/i,
    // Anti-fraud / bot detection scripts
    /frame_ant/i,
    // Instagram / WebView internal scripts
    /^app:\/\//,
  ],
});
