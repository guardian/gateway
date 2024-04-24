import { sendUnvalidatedEmailResetPasswordEmail } from '@/email/templates/UnvalidatedEmailResetPassword/sendUnvalidatedEmailResetPasswordEmail';
import { OktaError } from '@/server/models/okta/Error';
import { forgotPassword } from '@/server/lib/okta/api/users';
import { encryptOktaRecoveryToken } from '@/server/lib/deeplink/oktaRecoveryToken';
import { TrackingQueryParams } from '@/shared/model/QueryParams';
import { trackMetric } from './trackMetric';
import { emailSendMetric } from '@/server/models/Metrics';

type Props = {
	id: string;
	email: string;
	appClientId?: string;
	request_id?: string;
} & TrackingQueryParams;

/**
 * @name sendEmailToUnvalidatedUser
 * @description If a user is a) registered and b) is signing in or registering
 * via Okta and c) has an unvalidated email address, send that user an email
 * asking them to change their password, which validates their email address as
 * a side effect.
 * @param id Okta user Id
 * @param email Okta user email address
 */
export const sendEmailToUnvalidatedUser = async ({
	id,
	email,
	appClientId,
	request_id,
	ref,
	refViewId,
}: Props): Promise<void> => {
	const token = await forgotPassword(id);
	if (!token) {
		throw new OktaError({
			message: `Unvalidated email sign-in failed: missing reset password token`,
		});
	}
	const emailIsSent = await sendUnvalidatedEmailResetPasswordEmail({
		to: email,
		resetPasswordToken: await encryptOktaRecoveryToken({
			token,
			appClientId,
			request_id,
		}),
		ref,
		refViewId,
	});
	if (!emailIsSent) {
		trackMetric(
			emailSendMetric('OktaUnvalidatedEmailResetPassword', 'Failure'),
		);
		throw new OktaError({
			message: `Unvalidated email sign-in failed: failed to send email`,
		});
	}
	trackMetric(emailSendMetric('OktaUnvalidatedEmailResetPassword', 'Success'));
};
