/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kinesis } from '@aws-sdk/client-kinesis';
import { LogLevel } from '@/shared/model/Logger';
import { createLogger, transports } from 'winston';
import Transport, { TransportStreamOptions } from 'winston-transport';
import { formatWithOptions, InspectOptions } from 'util';
import { awsConfig } from './awsConfig';
import { getConfiguration } from './getConfiguration';
import { BaseLogger, ExtraLogFields } from '@/shared/lib/baseLogger';

const {
  stage,
  aws: { instanceId, kinesisStreamName },
} = getConfiguration();

const encoder = new TextEncoder();

// custom "Winston Transport" to send logs to the AWS kinesis stream
// see https://github.com/winstonjs/winston-transport#usage
class KinesisTransport extends Transport {
  private kinesis: Kinesis;

  constructor(opts?: TransportStreamOptions) {
    super(opts);

    this.kinesis = new Kinesis(awsConfig);
  }

  public log(info: any, callback: () => void) {
    const { level, message, ...extraFields } = info;

    setImmediate(() => {
      this.emit('logger', level);

      if (process.env.RUNNING_IN_CYPRESS === 'true') {
        // return void in cypress
        return;
      }

      if (kinesisStreamName) {
        const data = JSON.stringify({
          type: 'app',
          app: 'identity-gateway',
          stack: 'identity',
          path: '/var/log/identity-gateway.log',
          instance_id: instanceId,
          stage,
          level,
          message,
          ...extraFields,
        });

        this.kinesis
          .putRecord({
            StreamName: kinesisStreamName,
            PartitionKey: stage,
            Data: encoder.encode(data),
          })
          .catch((error: unknown) => {
            if (error instanceof Error) {
              if (error.name === 'ExpiredTokenException' && stage === 'DEV') {
                console.log(error.message);
                console.warn(
                  'AWS Credentials Expired. Have you added `Identity` Janus credentials?',
                );
              }

              if (error.name === 'TimeoutError') {
                console.warn(error.message);
                console.warn(
                  'Timeout when attempting to log to kinesis stream.',
                );
              }

              if (
                error.name !== 'TimeoutError' &&
                error.name !== 'ExpiredTokenException'
              ) {
                console.warn('Error when attempting to log to kinesis stream.');
                console.warn(error.name);
                console.warn(error.message);
              }
            } else {
              console.warn(
                'Unknown error when attempting to log to kinesis stream.',
              );
              console.warn(error);
            }
          });
      }
    });

    callback();
  }
}

const winstonLogger = createLogger({
  transports: [new transports.Console(), new KinesisTransport()],
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
