import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { awsConfig } from '../awsConfig';

interface SNSMembershipMessage {
	email: string;
	identityId: string;
}

export const publishSnsEvent = async ({
	email,
	identityId,
}: SNSMembershipMessage) => {
	const command = new PublishCommand({
		Message: JSON.stringify({
			email,
			identityId,
			voucherType: 'registration-reward',
		}),
		TopicArn: process.env.MEMBERSHIP_SNS_TOPIC_ARN!,
	});
	const response = await new SNSClient(awsConfig).send(command);
	return response;
};

// Queue CODE : https://sqs.eu-west-1.amazonaws.com/865473395570/imovo-voucher-api-queue-CODE
//   - Queue PROD : https://sqs.eu-west-1.amazonaws.com/865473395570/imovo-voucher-api-queue-PROD
