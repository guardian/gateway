import { Literal } from '@/shared/types';

export interface Logger {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- allow any for error
	log(logLevel: Literal<typeof LogLevel>, message: string, error?: any): void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- allow any for error
	info(message: string, error?: any): void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- allow any for error
	warn(message: string, error?: any): void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- allow any for error
	error(message: string, error?: any): void;
}

export const LogLevel = {
	ERROR: 'error',
	WARN: 'warn',
	INFO: 'info',
} as const;
