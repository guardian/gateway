import {
  CloudWatchClient,
  PutMetricDataCommand,
} from '@aws-sdk/client-cloudwatch';
import { Metrics } from '@/server/models/Metrics';
import { logger } from '@/server/lib/serverSideLogger';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { awsConfig } from '@/server/lib/awsConfig';

const { stage: Stage } = getConfiguration();

// metric dimensions is a k-v pair
interface MetricDimensions {
  [name: string]: string;
}

const cloudwatch = new CloudWatchClient(awsConfig);

const defaultDimensions = {
  Stage,
  // ApiMode is the service name, using both ApiMode and Stage will keep
  // gateway in line with other identity metrics
  ApiMode: 'identity-gateway',
};

export const trackMetric = (
  metricName: Metrics,
  dimensions?: MetricDimensions,
): void => {
  if (process.env.RUNNING_IN_CYPRESS === 'true') {
    // return void in cypress
    return;
  }

  // merge defaultDimensions with dimensions from parameter in case some were changed,
  const mergedDimensions = {
    ...defaultDimensions,
    ...dimensions,
  };

  cloudwatch
    .send(
      new PutMetricDataCommand({
        Namespace: 'Gateway',
        MetricData: [
          {
            MetricName: metricName,
            Dimensions: Object.entries(mergedDimensions).map(
              ([Name, Value]) => ({
                Name,
                Value,
              }),
            ),
            Value: 1,
            Unit: 'Count',
          },
        ],
      }),
    )
    .catch((error: unknown) => {
      if (error instanceof Error) {
        if (error.name === 'ExpiredTokenException' && Stage === 'DEV') {
          logger.warn(error.message);
          logger.warn(
            'AWS Credentials Expired. Have you added `Identity` Janus credentials?',
          );
        }

        if (error.name === 'TimeoutError') {
          logger.warn(error.message);
          logger.warn('Timeout when attempting to log to kinesis stream.');
        }

        if (
          error.name !== 'TimeoutError' &&
          error.name !== 'ExpiredTokenException'
        ) {
          logger.warn('Error when attempting to log to kinesis stream.');
          logger.warn(error.name);
          logger.warn(error.message);
        }
      } else {
        logger.warn('Unknown error when attempting to log to kinesis stream.');
        // eslint-disable-next-line no-console
        console.warn(error);
      }
    });
};
