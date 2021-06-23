import * as AWS from 'aws-sdk';
import { awsConfig } from '@/server/lib/awsConfig';

const SESV2 = new AWS.SESV2(awsConfig);

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
