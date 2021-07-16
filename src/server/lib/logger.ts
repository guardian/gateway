import { Logger, LogLevel } from '@/server/models/Logger';
import { createLogger, transports } from 'winston';

const winstonLogger = createLogger({
  transports: [new transports.Console()],
});

export const logger: Logger = {
  log(level: LogLevel, message: string) {
    winstonLogger.log(level, message);
  },
  // errors can be anything
  // eslint-disable-next-line
  error(message: string, error?: any) {
    if (error && error.stack && typeof error.message === 'string') {
      return logger.log(
        LogLevel.ERROR,
        `${message} | ${error.message} | ${error.stack}`,
      );
    }

    if (error) {
      return logger.log(LogLevel.ERROR, `${message} | ${error}`);
    }

    return logger.log(LogLevel.ERROR, message);
  },
  warn(message: string) {
    logger.log(LogLevel.INFO, message);
  },
  info(message: string) {
    logger.log(LogLevel.INFO, message);
  },
};
