import {
	SendEmailCommand,
	SendEmailCommandInput,
	SESv2Client,
} from '@aws-sdk/client-sesv2';
import { awsConfig } from '@/server/lib/awsConfig';
import { NodeHttpHandler } from '@aws-sdk/node-http-handler';

const ses = new SESv2Client({
	...awsConfig,
	maxAttempts: 3,
	requestHandler: new NodeHttpHandler({
		connectionTimeout: 1000,
		socketTimeout: 1000,
	}),
});

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
	// used to mock email send in cypress mocked tests
	if (process.env.RUNNING_IN_CYPRESS_MOCKED === 'true') {
		return true;
	}

	const params: SendEmailCommandInput = {
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
		FromEmailAddress: 'The Guardian <registration-reply@theguardian.com>',
	};

	const result = await ses.send(new SendEmailCommand(params));
	if (!result?.MessageId) {
		return false;
	}
	return true;
};
