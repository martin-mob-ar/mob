import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

// Filter out Next.js navigation errors (notFound / redirect) before sending to Sentry.
// Sentry.captureRequestError does not filter these, causing noisy false-positive alerts.
export const onRequestError: typeof Sentry.captureRequestError = (
  error,
  request,
  context
) => {
  const digest = (error as Error & { digest?: string }).digest;
  if (
    typeof digest === "string" &&
    (digest === "NEXT_NOT_FOUND" ||
      digest === "NEXT_HTTP_ERROR_FALLBACK;404" ||
      digest.startsWith("NEXT_REDIRECT;"))
  ) {
    return;
  }
  Sentry.captureRequestError(error, request, context);
};
