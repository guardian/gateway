import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { fromNodeProviderChain } from '@aws-sdk/credential-providers';

const AWS_REGION = 'eu-west-1';
const PROFILE = 'membership';

const queueUrl = process.env.MEMBERSHIP_BRAZE_SQS_URL;
const CREDENTIAL_PROVIDER = fromNodeProviderChain({
	profile: PROFILE,
});

const awsConfig = {
	region: AWS_REGION,
	profile: PROFILE,
	credentials: CREDENTIAL_PROVIDER,
};

const client = new SQSClient(awsConfig);

// interface MembershipMessage {
// 	orderId: string;
// 	status: string;
// }

export const sendToMembershipQueueForPrintPromo = async () => {
	const body = {
		To: {
			Address: 'akinsola.lawanson@guardian.co.uk',
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
