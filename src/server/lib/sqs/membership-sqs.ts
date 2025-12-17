import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { fromTemporaryCredentials } from '@aws-sdk/credential-providers';

const AWS_REGION = 'eu-west-1';
const PROFILE = 'membership';

const queueUrl = process.env.MEMBERSHIP_BRAZE_SQS_URL;
const CREDENTIAL_PROVIDER = fromTemporaryCredentials({
	params: {
		RoleArn: process.env.MEMBERSHIP_SQS_ROLE_ARN!,
	},
});

const awsConfig = {
	region: AWS_REGION,
	profile: PROFILE,
	credentials: CREDENTIAL_PROVIDER,
};

const client = new SQSClient(awsConfig);

interface MembershipQueueMessage {
	email: string;
}

export const sendToMembershipQueueForPrintPromo = async ({
	email,
}: MembershipQueueMessage) => {
	const body = {
		To: {
			Address: email,
			ContactAttributes: {
				SubscriberAttributes: {
					first_name: 'Akinsola',
					last_name: 'Lawanson',
					payment_method: 'card',
					product_type: 'Guardian Weekly',
				},
			},
		},
		DataExtensionName: 'payment-method-changed-email',
		IdentityUserId: '200093367',
	};
	const command = new SendMessageCommand({
		QueueUrl: queueUrl,
		MessageBody: JSON.stringify(body),
	});

	const response = await client.send(command);
	return response;
};
