import { LogLevel, Logger } from '../model/Logger';

export abstract class BaseLogger implements Logger {
  // eslint-disable-next-line
  abstract log(logLevel: LogLevel, message: string, error?: any): void;

  // eslint-disable-next-line
  error(message: string, error?: any) {
    return this.log(LogLevel.ERROR, message, error);
  }

  // eslint-disable-next-line
  warn(message: string, error?: any) {
    return this.log(LogLevel.WARN, message, error);
  }

  // eslint-disable-next-line
  info(message: string, error?: any) {
    return this.log(LogLevel.INFO, message, error);
  }
}
