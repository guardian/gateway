import {
	APIAddClientAccessToken,
	APIPostOptions,
	idapiFetch,
	IDAPIError,
} from '@/server/lib/IDAPIFetch';
import { logger } from '@/server/lib/serverSideLogger';
import { IdapiError } from '@/server/models/Error';
import { SubscribeErrors, UnsubscribeErrors } from '@/shared/model/Errors';
import { SubscriptionAction } from '@/shared/lib/subscriptions';

export type EmailType = 'newsletter' | 'marketing';

interface SubscriptionData {
	emailId: string;
	userId: string;
	timestamp: number;
}

interface UnsubscribeAllData {
	userId: string;
	timestamp: number;
}

export const isValidEmailType = (emailType: string): emailType is EmailType => {
	return ['newsletter', 'marketing'].includes(emailType);
};

export const parseSubscriptionData = (data: string): SubscriptionData => {
	const [emailId, userId, timestamp] = data.split(':');

	if (!emailId || !userId || !timestamp) {
		throw new Error('Invalid subscription data');
	}

	return {
		emailId,
		userId,
		timestamp: +timestamp,
	};
};

export const parseUnsubscribeAllData = (data: string): UnsubscribeAllData => {
	const [userId, timestamp] = data.split(':');

	if (!userId || !timestamp) {
		throw new Error('Invalid unsubscribe-all data');
	}

	return {
		userId,
		timestamp: +timestamp,
	};
};

const handleError = (
	subscriptionAction: SubscriptionAction,
	{ status = 500 }: IDAPIError,
) => {
	const errors =
		subscriptionAction === 'unsubscribe' ? UnsubscribeErrors : SubscribeErrors;
	throw new IdapiError({ message: errors.GENERIC, status });
};

export const makeSubscriptionRequest = async (
	subscriptionAction: SubscriptionAction,
	emailType: EmailType,
	unsubscribeData: SubscriptionData,
	token: string,
	ip: string,
	request_id?: string,
): Promise<unknown> => {
	const body = {
		emailType,
		...unsubscribeData,
		token,
	};

	const options = APIAddClientAccessToken(APIPostOptions(body), ip);

	try {
		await idapiFetch({
			path: `/${subscriptionAction}`,
			options,
		});
	} catch (error) {
		logger.error(
			`IDAPI Error ${subscriptionAction} '/${subscriptionAction}'`,
			error,
			{
				request_id,
			},
		);
		return handleError(subscriptionAction, error as IDAPIError);
	}
};

const unsubscribeAllPath = '/unsubscribe-all';
export const makeUnsubscribeAllRequest = async (
	unsubscribeData: UnsubscribeAllData,
	token: string,
	ip: string,
	request_id?: string,
) => {
	const body = {
		...unsubscribeData,
		token,
	};

	const options = APIAddClientAccessToken(APIPostOptions(body), ip);

	try {
		await idapiFetch({
			path: unsubscribeAllPath,
			options,
		});
	} catch (error) {
		logger.error(`IDAPI Error '${unsubscribeAllPath}'`, error, {
			request_id,
		});

		throw new IdapiError({ message: 'Unsubscribe all failed', status: 500 });
	}
};
