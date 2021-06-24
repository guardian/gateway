import * as AWS from 'aws-sdk';
import { awsConfig } from '@/server/lib/awsConfig';

const SESV2 = new AWS.SESV2(awsConfig);

type Props = {
  html: string;
  plainText: string;
  subject: string;
  to: string;
};

export const send = ({ html, plainText, subject, to }: Props) => {
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

  return SESV2.sendEmail(params).promise();
};
