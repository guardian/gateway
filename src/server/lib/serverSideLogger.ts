import { LogLevel } from '@/shared/model/Logger';
import { createLogger, transports } from 'winston';
import { formatWithOptions, InspectOptions } from 'util';
import { BaseLogger, ExtraLogFields } from '@/shared/lib/baseLogger';
import { requestContext } from './middleware/requestContext';
import { Literal } from '@/shared/types';

const winstonLogger = createLogger({
	transports: [new transports.Console()],
});

const loggingOptions: InspectOptions = {
	depth: 20,
	breakLength: 2000,
	maxStringLength: 2000,
	compact: true,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- allow any for message
const formatLogParam = (message?: any) =>
	formatWithOptions(loggingOptions, message);

class ServerSideLogger extends BaseLogger {
	log(
		level: Literal<typeof LogLevel>,
		message: string,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any -- allow any for error
		error?: any,
		extraFields?: ExtraLogFields,
	) {
		const context = requestContext.getStore();

		const extraFieldsWithContext = {
			...extraFields,
			...(context ?? {}),
		};

		if (
			error &&
			typeof error === 'object' &&
			error.stack &&
			typeof error.message === 'string'
		) {
			return winstonLogger.log(
				level,
				`${formatLogParam(message)} - ${formatLogParam(
					error.message,
				)} - ${formatLogParam(error.stack)}`,
				extraFieldsWithContext,
			);
		}
		if (error) {
			return winstonLogger.log(
				level,
				`${formatLogParam(message)} - ${formatLogParam(error)}`,
				extraFieldsWithContext,
			);
		}

		return winstonLogger.log(
			level,
			`${formatLogParam(message)}`,
			extraFieldsWithContext,
		);
	}
}

export const logger = new ServerSideLogger();
