import {
	SNSClient,
	PublishCommand,
	PublishCommandInput,
} from '@aws-sdk/client-sns';
import { awsConfig } from '../awsConfig';

interface SNSMembershipMessage {
	email: string;
	identityId: string;
}

export const publishImovoSnsEvent = async (message: SNSMembershipMessage) => {
	const input: PublishCommandInput = {
		Message: JSON.stringify({
			email: message.email,
			identityId: message.identityId,
			voucherType: 'registration-reward',
		}),
		TopicArn: process.env.PRINT_PROMO_SNS_TOPIC_ARN,
	};
	return publishSnsEvent(input);
};

const publishSnsEvent = async (input: PublishCommandInput) => {
	const command = new PublishCommand(input);
	const response = await new SNSClient(awsConfig).send(command);
	return response;
};
