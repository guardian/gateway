/* eslint-disable @typescript-eslint/no-explicit-any */
import { LogLevel, Logger } from '@/shared/model/Logger';

export interface ExtraLogFields {
	request_id?: string;
	[key: string]: any;
}

export abstract class BaseLogger implements Logger {
	abstract log(
		logLevel: LogLevel,
		message: string,
		error?: any,
		extra?: ExtraLogFields,
	): void;

	error(message: string, error?: any, extra?: ExtraLogFields) {
		return this.log(LogLevel.ERROR, message, error, extra);
	}

	warn(message: string, error?: any, extra?: ExtraLogFields) {
		return this.log(LogLevel.WARN, message, error, extra);
	}

	info(message: string, error?: any, extra?: ExtraLogFields) {
		return this.log(LogLevel.INFO, message, error, extra);
	}
}
