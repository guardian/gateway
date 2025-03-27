import { LogLevel, Logger } from '@/shared/model/Logger';
import { Literal } from '@/shared/types';

export interface ExtraLogFields {
	request_id?: never;
	ip?: never;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- allow any for extra fields
	[key: string]: any;
}

export abstract class BaseLogger implements Logger {
	abstract log(
		logLevel: Literal<typeof LogLevel>,
		message: string,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any -- allow any for error
		error?: any,
		extra?: ExtraLogFields,
	): void;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- allow any for error
	error(message: string, error?: any, extra?: ExtraLogFields) {
		return this.log(LogLevel.ERROR, message, error, extra);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- allow any for error
	warn(message: string, error?: any, extra?: ExtraLogFields) {
		return this.log(LogLevel.WARN, message, error, extra);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- allow any for error
	info(message: string, error?: any, extra?: ExtraLogFields) {
		return this.log(LogLevel.INFO, message, error, extra);
	}
}
