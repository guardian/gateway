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
 * @param {string} ip The IP address of the user
 * @param {boolean} flagStatus Default is true. If true, the flags are set to true, if false, the flags are set to false
 * @returns {Promise<UserResponse>} Promise that resolves to the user object
 */
export const validateEmailAndPasswordSetSecurely = async ({
	id,
	ip,
	flagStatus = true,
}: {
	id: string;
	ip?: string;
	flagStatus?: boolean;
}): Promise<UserResponse> => {
	try {
		const timestamp = new Date().toISOString();

		const user = await updateUser(
			id,
			{
				profile: {
					emailValidated: flagStatus,
					lastEmailValidatedTimestamp: timestamp,
					passwordSetSecurely: flagStatus,
					lastPasswordSetSecurelyTimestamp: timestamp,
				},
			},
			ip,
		);

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
