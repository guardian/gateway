import * as Sentry from '@sentry/browser';
import type { CaptureContext } from '@sentry/types';

export const init = (options?: Sentry.BrowserOptions) => {
  Sentry.init(options);

  return {
    reportError: (
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
    },

    reportMessage: (
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
    },
  };
};
