import { BaseLogger, ExtraLogFields } from '@/shared/lib/baseLogger';
import { LogLevel } from '@/shared/model/Logger';
import { Literal } from '@/shared/types';
import { log } from '@guardian/libs';

class ClientSideLogger extends BaseLogger {
	log(
		level: Literal<typeof LogLevel>,
		message: string,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any -- allow any for error
		error?: any,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars -- allow unused extra, this is ignored on client side logger
		extra?: ExtraLogFields,
	) {
		if (
			level === LogLevel.ERROR &&
			error &&
			typeof error === 'object' &&
			error.stack &&
			typeof error.message === 'string'
		) {
			log('identity', 'error', message, error.stack);
			return;
		}

		if (error) {
			log('identity', 'error', message, error);
			return;
		}

		log('identity', level, message);
		return;
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
