import { BaseLogger, ExtraLogFields } from '@/shared/lib/baseLogger';
import { LogLevel } from '@/shared/model/Logger';
import {
	captureException,
	captureMessage,
	startInactiveSpan,
	SeverityLevel,
} from '@sentry/browser';

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
	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- allow any for error
	log(level: LogLevel, message: string, error?: any, extra?: ExtraLogFields) {
		// Wrap the log in a new Sentry transaction.
		// Setting `sampled` to true ensures that it is logged every time.
		const span = startInactiveSpan({
			name: 'logger-event',
			forceTransaction: true,
		});

		if (
			level === LogLevel.ERROR &&
			error &&
			typeof error === 'object' &&
			error.stack &&
			typeof error.message === 'string'
		) {
			captureException(error, { extra });
			return span?.end();
		}

		if (error) {
			captureMessage(`${message} - ${error}`, {
				level: getSentryLevel(level),
				extra,
			});
			return span?.end();
		}

		// should it be needed, `extra` is a free-form object that we can use to add additional debug info to Sentry logs.
		captureMessage(message, { level: getSentryLevel(level), extra });
		return span?.end();
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
