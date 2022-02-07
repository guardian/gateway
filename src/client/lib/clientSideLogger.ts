import { BaseLogger } from '@/shared/lib/baseLogger';
import { LogLevel } from '@/shared/model/Logger';
import { Severity } from '@sentry/browser';
import type { CaptureContext, Extras } from '@sentry/types';

const getSentryLevel = (level: LogLevel) => {
  switch (level) {
    case LogLevel.ERROR:
      return Severity.Error;
    case LogLevel.INFO:
      return Severity.Info;
    case LogLevel.WARN:
      return Severity.Warning;
    default:
      return Severity.Log;
  }
};

class ClientSideLogger extends BaseLogger {
  // eslint-disable-next-line
  log(
    level: LogLevel,
    message: string,
    error?: any,
    extra?: Extras,
    alwaysSample?: boolean,
  ) {
    if (typeof window !== 'undefined' && window.guardian?.modules) {
      const { reportError, reportMessage } = window.guardian?.modules?.sentry;

      if (
        level === LogLevel.ERROR &&
        error &&
        typeof error === 'object' &&
        error.stack &&
        typeof error.message === 'string'
      ) {
        reportError(error, undefined, { extra }, alwaysSample);
      }

      const captureContext: CaptureContext = {
        level: getSentryLevel(level),
        extra,
      };

      if (error) {
        reportMessage(
          `${message} - ${error}`,
          undefined,
          captureContext,
          alwaysSample,
        );
      }

      // should it be needed, `extra` is a free-form object that we can use to add additional debug info to Sentry logs.
      reportMessage(message, undefined, captureContext, alwaysSample);
    }
  }

  // We default `alwaysSample` to true here because currently, for ever explicit of the client side logger we want to ensure we send the event to Gateway.

  // eslint-disable-next-line
  info(message: string, error?: any, extra?: Extras, alwaysSample = true) {
    return this.log(LogLevel.INFO, message, error, extra, alwaysSample);
  }

  // eslint-disable-next-line
  warn(message: string, error?: any, extra?: Extras, alwaysSample = true) {
    return this.log(LogLevel.WARN, message, error, extra, alwaysSample);
  }

  // eslint-disable-next-line
  error(message: string, error?: any, extra?: Extras, alwaysSample = true) {
    return this.log(LogLevel.ERROR, message, error, extra, alwaysSample);
  }
}

export const logger = new ClientSideLogger();
