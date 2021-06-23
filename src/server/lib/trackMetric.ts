import * as AWS from 'aws-sdk';
import { Metrics } from '@/server/models/Metrics';
import { logger } from '@/server/lib/logger';
import { AWSError } from 'aws-sdk';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { awsConfig } from '@/server/lib/awsConfig';

const { stage: Stage } = getConfiguration();
// metric dimensions is a k-v pair
interface MetricDimensions {
  [name: string]: string;
}

const CloudWatch = new AWS.CloudWatch(awsConfig);

const defaultDimensions = {
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
      logger.error(error.message);
    });
};

const SESV2 = new AWS.SESV2(standardAwsConfig);

export const sendEmail = (
  html: string,
  plainText: string,
  subject: string,
  toAddress: string,
  fromAddress: string,
) => {
  const params: AWS.SESV2.SendEmailRequest = {
    Content: {
      Simple: {
        Body: {
          Html: {
            Data: html,
          },
          Text: {
            Data: plainText,
          },
        },
        Subject: {
          Data: subject,
        },
      },
    },
    Destination: {
      ToAddresses: [toAddress],
    },
    FromEmailAddress: fromAddress,
  };

  return SESV2.sendEmail(params).promise();
};
