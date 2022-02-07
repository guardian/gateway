import { RoutingConfig } from '@/client/routes';
import * as Sentry from '@sentry/browser';
import { CaptureConsole } from '@sentry/integrations';
import type { CaptureContext } from '@sentry/types';

// Only send errors matching these regexes
const whitelistUrls = [
  /webpack-internal/,
  /localhost/,
  /assets\.guim\.co\.uk/,
  /ophan\.co\.uk/,
  /profile\.thegulocal\.com/,
];

// Ignore these errors
const ignoreErrors = [
  // https://docs.sentry.io/platforms/javascript/#decluttering-sentry
  "Can't execute code from a freed script",
  /InvalidStateError/gi,
  /Fetch error:/gi,
  'Network request failed',
  'NetworkError',
  'Failed to fetch',
  'This video is no longer available.',
  'UnknownError',
  'TypeError: Failed to fetch',
  'TypeError: NetworkError when attempting to fetch resource',
  'The quota has been exceeded',
];

const routingConfig: RoutingConfig = JSON.parse(
  document.getElementById('routingConfig')?.innerHTML ?? '{}',
);

const clientState = routingConfig.clientState;

const {
  sentryConfig: { stage, build, dsn },
} = clientState;

Sentry.init({
  enabled: true,
  ignoreErrors,
  whitelistUrls,
  dsn,
  environment: stage,
  integrations: [new CaptureConsole({ levels: ['error'] })],
  maxBreadcrumbs: 50,
  release: `gateway@${build}`,
  // sampleRate: // We use Math.random in init.ts to sample errors
  /*beforeSend(event) {
    // Skip sending events in certain situations
    const dontSend = stage === 'DEV';
    if (dontSend) {
      return null;
    }
    return event;
  },*/
});

export const reportError = (
  error: Error,
  feature?: string,
  captureContext?: CaptureContext | undefined,
): void => {
  Sentry.withScope(() => {
    if (feature) {
      Sentry.setTag('feature', feature);
    }
    Sentry.captureException(error, captureContext);
  });
};

export const reportMessage = (
  message: string,
  feature?: string,
  captureContext?: CaptureContext | undefined,
): void => {
  Sentry.withScope(() => {
    if (feature) {
      Sentry.setTag('feature', feature);
    }
    Sentry.captureMessage(message, captureContext);
  });
};
