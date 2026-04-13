import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.2,

  // Session Replay
  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV,
  enabled: process.env.NODE_ENV === "production",

  // Ignore common non-actionable errors
  ignoreErrors: [
    // AbortErrors from navigation, Supabase Auth locks, and React transitions
    /AbortError/,
    /signal is aborted/,
    /The user aborted a request/,
    // Third-party: Twitter/X in-app browser WebView scroll handler
    /webkit\.messageHandlers/,
    // Third-party: Microsoft Clarity internal errors
    /clarity\.js/,
  ],

  // Filter out errors from browser extensions (e.g. MetaMask inpage.js)
  denyUrls: [/^app:\/\//, /extensions\//i, /^chrome-extension:\/\//, /^moz-extension:\/\//],
  beforeSend(event) {
    const frames = event.exception?.values?.[0]?.stacktrace?.frames;
    if (frames?.some((f) => f.filename?.includes("inpage.js"))) return null;
    return event;
  },
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
