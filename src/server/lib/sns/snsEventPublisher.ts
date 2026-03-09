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
		TopicArn: process.env.PRINT_PROMO_SNS_TOPIC_ARN,
	});
	const response = await new SNSClient(awsConfig).send(command);
	return response;
};
