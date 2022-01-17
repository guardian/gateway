export interface Logger {
  // eslint-disable-next-line
  log(logLevel: LogLevel, message: string, error?: any): void;
  // eslint-disable-next-line
  info(message: string, error?: any): void;
  // eslint-disable-next-line
  warn(message: string, error?: any): void;
  // eslint-disable-next-line
  error(message: string, error?: any): void;
}

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
}
