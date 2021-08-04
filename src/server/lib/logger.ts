import { Logger, LogLevel } from '@/server/models/Logger';
import { createLogger, transports } from 'winston';
import { formatWithOptions, InspectOptions } from 'util';

const winstonLogger = createLogger({
  transports: [new transports.Console()],
});

const loggingOptions: InspectOptions = {
  depth: 10,
  breakLength: 2000,
  maxStringLength: 2000,
  compact: true,
};

// eslint-disable-next-line
const formatLogParam = (message?: any) =>
  formatWithOptions(loggingOptions, message);

export const logger: Logger = {
  // eslint-disable-next-line
  log(level: LogLevel, message: string, error?: any) {
    if (
      error &&
      typeof error === 'object' &&
      error.stack &&
      typeof error.message === 'string'
    ) {
      return winstonLogger.log(
        level,
        `${formatLogParam(message)} - ${formatLogParam(
          error.message,
        )} - ${formatLogParam(error.stack)}`,
      );
    }

    if (error) {
      return winstonLogger.log(
        level,
        `${formatLogParam(message)} - ${formatLogParam(error)}`,
      );
    }

    return winstonLogger.log(level, `${formatLogParam(message)}`);
  },

  // eslint-disable-next-line
  error(message: string, error?: any) {
    return logger.log(LogLevel.ERROR, message, error);
  },

  // eslint-disable-next-line
  warn(message: string, error?: any) {
    return logger.log(LogLevel.WARN, message, error);
  },

  // eslint-disable-next-line
  info(message: string, error?: any) {
    logger.log(LogLevel.INFO, message, error);
  },
};
