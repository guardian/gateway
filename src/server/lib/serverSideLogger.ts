/* eslint-disable @typescript-eslint/no-explicit-any */
import { LogLevel } from '@/shared/model/Logger';
import { createLogger, transports } from 'winston';
import { formatWithOptions, InspectOptions } from 'util';
import { BaseLogger, ExtraLogFields } from '@/shared/lib/baseLogger';

const winstonLogger = createLogger({
	transports: [new transports.Console()],
});

const loggingOptions: InspectOptions = {
	depth: 20,
	breakLength: 2000,
	maxStringLength: 2000,
	compact: true,
};

const formatLogParam = (message?: any) =>
	formatWithOptions(loggingOptions, message);

class ServerSideLogger extends BaseLogger {
	log(
		level: LogLevel,
		message: string,
		error?: any,
		extraFields?: ExtraLogFields,
	) {
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
				extraFields,
			);
		}
		if (error) {
			return winstonLogger.log(
				level,
				`${formatLogParam(message)} - ${formatLogParam(error)}`,
				extraFields,
			);
		}

		return winstonLogger.log(level, `${formatLogParam(message)}`, extraFields);
	}
}

export const logger = new ServerSideLogger();
