import { Logger, LogLevel } from '@/server/models/Logger';
import { createLogger, transports } from 'winston';

const winstonLogger = createLogger({
  transports: [
    new transports.Console(),
    new transports.File({ filename: process.env.LOG_FILE }),
  ],
});

export const logger: Logger = {
  log(level: LogLevel, message: string) {
    winstonLogger.log(level, message);
  },
  error(message: string) {
    logger.log(LogLevel.ERROR, message);
  },
  warn(message: string) {
    logger.log(LogLevel.INFO, message);
  },
  info(message: string) {
    logger.log(LogLevel.INFO, message);
  },
};
