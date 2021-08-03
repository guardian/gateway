import { Logger, LogLevel } from '@/server/models/Logger';
import { createLogger, transports } from 'winston';
import { format } from 'util';

const winstonLogger = createLogger({
  transports: [new transports.Console()],
});

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
        `${format(message)} - ${format(error.message)} - ${format(
          error.stack,
        )}`,
      );
    }

    if (error) {
      return winstonLogger.log(level, `${format(message)} - ${format(error)}`);
    }

    return winstonLogger.log(level, `${format(message)}`);
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
