import { BaseLogger, ExtraLogFields } from '@/shared/lib/baseLogger';
import { LogLevel } from '@/shared/model/Logger';

class ClientSideLogger extends BaseLogger {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars -- allow any for error
	log(level: LogLevel, message: string, error?: any, extra?: ExtraLogFields) {
		if (
			level === LogLevel.ERROR &&
			error &&
			typeof error === 'object' &&
			error.stack &&
			typeof error.message === 'string'
		) {
			// todo: log the error stack as well as the message
		}

		if (error) {
			// todo: log the error as an object
		}

		// todo: log the message
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- allow any for error
	info(message: string, error?: any, extra?: ExtraLogFields) {
		return this.log(LogLevel.INFO, message, error, extra);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- allow any for error
	warn(message: string, error?: any, extra?: ExtraLogFields) {
		return this.log(LogLevel.WARN, message, error, extra);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- allow any for error
	error(message: string, error?: any, extra?: ExtraLogFields) {
		return this.log(LogLevel.ERROR, message, error, extra);
	}
}

export const logger = new ClientSideLogger();
