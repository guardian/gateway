export interface Logger {
  log(logLevel: LogLevel, message: string): void;
  info(message: string): void;
  warn(message: string): void;
  // errors can be anything
  // eslint-disable-next-line
  error(message: string, error?: any): void;
}

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
}
