import * as AWS from 'aws-sdk';
import { Metrics } from '@/server/models/Metrics';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { logger } from '@/server/lib/logger';
import { AWSError } from 'aws-sdk';

// metric dimensions is a k-v pair
interface MetricDimensions {
  [name: string]: string;
}

const { stage: Stage } = getConfiguration();

const AWS_REGION = 'eu-west-1';
const PROFILE = 'identity';

const CREDENTIAL_PROVIDER = new AWS.CredentialProviderChain([
  () => new AWS.SharedIniFileCredentials({ profile: PROFILE }),
  ...AWS.CredentialProviderChain.defaultProviders,
]);

const standardAwsConfig = {
  region: AWS_REGION,
  credentialProvider: CREDENTIAL_PROVIDER,
};

const CloudWatch = new AWS.CloudWatch(standardAwsConfig);

export const defaultDimensions = {
  Stage,
  // ApiMode is the service name, using both ApiMode and Stage will keep
  // gateway in line with other identity metrics
  ApiMode: 'identity-gateway',
};

export const trackMetric = (
  metricName: Metrics | string,
  dimensions?: MetricDimensions,
) => {
  // merge defaultDimensions with dimensions from parameter in case some were changed,
  const mergedDimensions = {
    ...defaultDimensions,
    ...dimensions,
  };

  return CloudWatch.putMetricData({
    Namespace: 'Gateway',
    MetricData: [
      {
        MetricName: metricName,
        Dimensions: Object.entries(mergedDimensions).map(([Name, Value]) => ({
          Name,
          Value,
        })),
        Value: 1,
        Unit: 'Count',
      },
    ],
  })
    .promise()
    .catch((error: AWSError) => {
      if (error.code === 'ExpiredToken' && Stage === 'DEV') {
        logger.warn(
          'AWS Credentials Expired. Have you added `Identity` Janus credentials?',
        );
      } else {
        logger.error(error.message);
      }
    });
};
