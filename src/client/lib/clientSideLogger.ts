import { BaseLogger } from '@/shared/lib/baseLogger';
import { LogLevel } from '@/shared/model/Logger';
import * as Sentry from '@sentry/browser';

const getSentryLevel = (level: LogLevel) => {
  switch (level) {
    case LogLevel.ERROR:
      return Sentry.Severity.Error;
    case LogLevel.INFO:
      return Sentry.Severity.Info;
    case LogLevel.WARN:
      return Sentry.Severity.Warning;
    default:
      return Sentry.Severity.Log;
  }
};

class ClientSideLogger extends BaseLogger {
  // eslint-disable-next-line
  log(level: LogLevel, message: string, error?: any) {
    if (
      error &&
      typeof error === 'object' &&
      error.stack &&
      typeof error.message === 'string'
    ) {
      return Sentry.captureException(error);
    }

    if (error) {
      return Sentry.captureMessage(
        `${message} - ${error}`,
        getSentryLevel(level),
      );
    }

    return Sentry.captureMessage(message, getSentryLevel(level));
  }
}

export const logger = new ClientSideLogger();
