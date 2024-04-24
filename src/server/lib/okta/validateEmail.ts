import { updateUser } from '@/server/lib/okta/api/users';
import { UserResponse } from '@/server/models/okta/User';
import { logger } from '@/server/lib/serverSideLogger';
import { trackMetric } from '@/server/lib/trackMetric';

/**
 * @method validateEmailAndPasswordSetSecurely
 *
 * Used to update the user has verified/validated their email and set a password securely.
 *
 * @param {string} id accepts the Okta user ID, email address (login) or login shortname (as long as it is unambiguous)
 * @returns {Promise<UserResponse>} Promise that resolves to the user object
 */
export const validateEmailAndPasswordSetSecurely = async (
	id: string,
): Promise<UserResponse> => {
	try {
		const timestamp = new Date().toISOString();

		const user = await updateUser(id, {
			profile: {
				emailValidated: true,
				lastEmailValidatedTimestamp: timestamp,
				passwordSetSecurely: true,
				lastPasswordSetSecurelyTimestamp: timestamp,
			},
		});

		trackMetric('OktaAccountVerification::Success');
		trackMetric('OktaUpdatePassword::Success');

		return user;
	} catch (error) {
		logger.error(
			`validateEmailAndPasswordSetSecurely failed: Error updating user ${id}`,
			error,
		);
		trackMetric('OktaAccountVerification::Failure');
		trackMetric('OktaUpdatePassword::Failure');
		throw error;
	}
};
