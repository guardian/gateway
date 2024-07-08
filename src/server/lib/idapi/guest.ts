import { IdapiError } from '@/server/models/Error';
import { EmailType } from '@/shared/model/EmailType';
import { IdapiErrorMessages, RegistrationErrors } from '@/shared/model/Errors';
import { getConfiguration } from '@/server/lib/getConfiguration';
import {
	APIAddClientAccessToken,
	APIPostOptions,
	IDAPIError,
	idapiFetch,
} from '@/server/lib/IDAPIFetch';
import { logger } from '@/server/lib/serverSideLogger';
import { trackMetric } from '@/server/lib/trackMetric';
import { emailSendMetric } from '@/server/models/Metrics';
import {
	OphanConfig,
	sendOphanInteractionEventServer,
} from '@/server/lib/ophan';
import { IdApiQueryParams } from '@/shared/model/IdapiQueryParams';

const { defaultReturnUri } = getConfiguration();

const handleError = ({ error, status = 500 }: IDAPIError) => {
	if (error.status === 'error' && error.errors?.length) {
		const err = error.errors[0];
		const { message } = err;

		switch (message) {
			case IdapiErrorMessages.INVALID_EMAIL_ADDRESS:
				throw new IdapiError({
					message: RegistrationErrors.EMAIL_INVALID,
					status,
				});
			default:
				break;
		}
	}

	throw new IdapiError({ message: RegistrationErrors.GENERIC, status });
};

export const guest = async (
	email: string,
	ip: string | undefined,
	trackingParams: IdApiQueryParams,
	ophanTrackingConfig?: OphanConfig,
	request_id?: string,
): Promise<EmailType> => {
	const options = APIPostOptions({
		primaryEmailAddress: email,
	});

	try {
		const { returnUrl, ref, refViewId, clientId } = trackingParams;

		await idapiFetch({
			path: '/guest',
			options: APIAddClientAccessToken(options, ip),
			queryParams: {
				accountVerificationEmail: true,
				returnUrl: returnUrl || defaultReturnUri,
				ref,
				refViewId,
				clientId,
			},
		});
		sendOphanInteractionEventServer(
			{
				component: 'email-send',
				value: 'account-verification',
			},
			ophanTrackingConfig,
		);
		trackMetric(emailSendMetric('AccountVerification', 'Success'));
		return EmailType.ACCOUNT_VERIFICATION;
	} catch (error) {
		logger.error(
			`IDAPI Error: guest account creation '/guest?accountVerificationEmail=true'}`,
			error,
			{
				request_id,
			},
		);
		trackMetric(emailSendMetric('AccountVerification', 'Failure'));
		return handleError(error as IDAPIError);
	}
};
