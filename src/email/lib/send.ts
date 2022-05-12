import * as AWS from 'aws-sdk';
import { awsConfig } from '@/server/lib/awsConfig';

// We need to adjust the SES timeouts to be longer than the standard AWS
// timeouts
const sesConfig = {
  ...awsConfig,
  maxRetries: 3,
  httpOptions: {
    ...awsConfig.httpOptions,
    connectTimeout: 1000,
    timeout: 1000,
  },
};

const SESV2 = new AWS.SESV2(sesConfig);

type Props = {
  html: string;
  plainText: string;
  subject: string;
  to: string;
};

export const send = async ({
  html,
  plainText,
  subject,
  to,
}: Props): Promise<boolean> => {
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
      ToAddresses: [to],
    },
    FromEmailAddress: 'registration-reply@theguardian.com',
  };

  const result = await SESV2.sendEmail(params).promise();
  console.log(result);
  if (!result?.MessageId) {
    return false;
  }
  return true;
};
