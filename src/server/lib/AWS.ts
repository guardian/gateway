import * as AWS from 'aws-sdk';
import { Metrics } from '@/server/models/Metrics';
import { getConfiguration } from '@/server/lib/configuration';
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

export const trackMetric = (
  metricName: Metrics,
  dimensions: MetricDimensions = { Stage },
) =>
  CloudWatch.putMetricData({
    Namespace: 'Gateway',
    MetricData: [
      {
        MetricName: metricName,
        Dimensions: Object.entries(dimensions).map(([Name, Value]) => ({
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
      logger.error(error.message);
    });
