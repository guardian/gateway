export interface Logger {
  log(logLevel: LogLevel, message: string): void;
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
}

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
}
