import * as Sentry from "@sentry/react";

export function initSentry() {
  Sentry.init({
    dsn: "https://b83fa0ff1c7278415c53c75e2127ed41@o4509086245978112.ingest.de.sentry.io/4509086250434641",
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration()
    ],
    // Tracing
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
    // Set tracePropagationTargets to control which URLs distributed tracing should be enabled
    tracePropagationTargets: ["localhost", /^https:\/\/yourecommerce\.com\/api/],
    // Session Replay
    replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    replaysOnErrorSampleRate: 1.0
  });
}
