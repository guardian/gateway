import type { SeverityLevel } from '@sentry/browser';
import {
	captureException,
	captureMessage,
	startTransaction,
} from '@sentry/browser';
import type { ExtraLogFields } from '@/shared/lib/baseLogger';
import { BaseLogger } from '@/shared/lib/baseLogger';
import { LogLevel } from '@/shared/model/Logger';

const getSentryLevel = (level: LogLevel): SeverityLevel => {
	switch (level) {
		case LogLevel.ERROR:
			return 'error';
		case LogLevel.INFO:
			return 'info';
		case LogLevel.WARN:
			return 'warning';
		default:
			return 'log';
	}
};

class ClientSideLogger extends BaseLogger {
	// eslint-disable-next-line
	log(level: LogLevel, message: string, error?: any, extra?: ExtraLogFields) {
		// Wrap the log in a new Sentry transaction.
		// Setting `sampled` to true ensures that it is logged every time.
		const transaction = startTransaction({
			name: 'logger-event',
			sampled: true,
		});

		if (
			level === LogLevel.ERROR &&
			error &&
			typeof error === 'object' &&
			error.stack &&
			typeof error.message === 'string'
		) {
			captureException(error, { extra });
			return transaction?.finish();
		}

		if (error) {
			captureMessage(`${message} - ${error}`, {
				level: getSentryLevel(level),
				extra,
			});
			return transaction?.finish();
		}

		// should it be needed, `extra` is a free-form object that we can use to add additional debug info to Sentry logs.
		captureMessage(message, { level: getSentryLevel(level), extra });
		return transaction?.finish();
	}

	// eslint-disable-next-line
	info(message: string, error?: any, extra?: ExtraLogFields) {
		return this.log(LogLevel.INFO, message, error, extra);
	}

	// eslint-disable-next-line
	warn(message: string, error?: any, extra?: ExtraLogFields) {
		return this.log(LogLevel.WARN, message, error, extra);
	}

	// eslint-disable-next-line
	error(message: string, error?: any, extra?: ExtraLogFields) {
		return this.log(LogLevel.ERROR, message, error, extra);
	}
}

export const logger = new ClientSideLogger();
