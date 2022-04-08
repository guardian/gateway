import { AWSError, Kinesis } from 'aws-sdk';
import { LogLevel } from '@/shared/model/Logger';
import { createLogger, transports } from 'winston';
import Transport, { TransportStreamOptions } from 'winston-transport';
import { formatWithOptions, InspectOptions } from 'util';
import { awsConfig } from './awsConfig';
import { getConfiguration } from './getConfiguration';
import { BaseLogger } from '@/shared/lib/baseLogger';

const {
  stage,
  aws: { instanceId, kinesisStreamName },
} = getConfiguration();

// custom "Winston Transport" to send logs to the AWS kinesis stream
// see https://github.com/winstonjs/winston-transport#usage
class KinesisTransport extends Transport {
  private kinesis: Kinesis;

  constructor(opts?: TransportStreamOptions) {
    super(opts);

    this.kinesis = new Kinesis(awsConfig);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public log(info: any, callback: () => void) {
    const { level, message, ...extraFields } = info;

    setImmediate(() => {
      this.emit('logger', level);
      if (kinesisStreamName) {
        this.kinesis
          .putRecord({
            StreamName: kinesisStreamName,
            PartitionKey: stage,
            Data: JSON.stringify({
              type: 'app',
              app: 'identity-gateway',
              stack: 'identity',
              path: '/var/log/identity-gateway.log',
              instance_id: instanceId,
              stage,
              level,
              message,
              ...extraFields,
            }),
          })
          .promise()
          .catch((error: AWSError) => {
            if (error.code.includes('ExpiredToken') && stage === 'DEV') {
              console.warn(
                'AWS Credentials Expired. Have you added `Identity` Janus credentials?',
              );
            }
            if (error.code.includes('TimeoutError')) {
              console.warn('Timeout when attempting to log to kinesis stream.');
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const formatLogParam = (message?: any) =>
  formatWithOptions(loggingOptions, message);

class ServerSideLogger extends BaseLogger {
  // eslint-disable-next-line
  log(level: LogLevel, message: string, error?: any, extraFields?: any) {
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
