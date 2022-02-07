import { setupSentry } from '@/client/lib/sentry/setup';
import { RoutingConfig } from '@/client/routes';

// Define Gateway Sentry configuration object and bootstrap Sentry so it loads
// on the page if the user is opted in.

// Only send errors matching these regexes
const allowUrls = [
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

setupSentry({
  dsn,
  environment: stage,
  maxBreadcrumbs: 50,
  release: `gateway@${build}`,
  allowUrls,
  ignoreErrors,
});
