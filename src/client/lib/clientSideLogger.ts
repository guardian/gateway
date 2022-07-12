import { BaseLogger } from '@/shared/lib/baseLogger';
import { LogLevel } from '@/shared/model/Logger';
import * as Sentry from '@sentry/browser';
import { SeverityLevel } from '@sentry/browser';
import { Extras } from '@sentry/types';

const getSentryLevel = (level: LogLevel): SeverityLevel => {
  switch (level) {
    case LogLevel.ERROR:
      return 'error';
    case LogLevel.INFO:
      return 'info';
    case LogLevel.WARN:
      return 'warning';
    default:
      return 'log';
  }
};

class ClientSideLogger extends BaseLogger {
  // eslint-disable-next-line
  log(level: LogLevel, message: string, error?: any, extra?: Extras) {
    // Wrap the log in a new Sentry transaction.
    // Setting `sampled` to true ensures that it is logged every time.
    const transaction = Sentry.startTransaction({
      name: 'logger-event',
      sampled: true,
    });

    if (
      level === LogLevel.ERROR &&
      error &&
      typeof error === 'object' &&
      error.stack &&
      typeof error.message === 'string'
    ) {
      Sentry.captureException(error, { extra });
      return transaction?.finish();
    }

    if (error) {
      Sentry.captureMessage(`${message} - ${error}`, {
        level: getSentryLevel(level),
        extra,
      });
      return transaction?.finish();
    }

    // should it be needed, `extra` is a free-form object that we can use to add additional debug info to Sentry logs.
    Sentry.captureMessage(message, { level: getSentryLevel(level), extra });
    return transaction?.finish();
  }

  // eslint-disable-next-line
  info(message: string, error?: any, extra?: Extras) {
    return this.log(LogLevel.INFO, message, error, extra);
  }

  // eslint-disable-next-line
  warn(message: string, error?: any, extra?: Extras) {
    return this.log(LogLevel.WARN, message, error, extra);
  }

  // eslint-disable-next-line
  error(message: string, error?: any, extra?: Extras) {
    return this.log(LogLevel.ERROR, message, error, extra);
  }
}

export const logger = new ClientSideLogger();
