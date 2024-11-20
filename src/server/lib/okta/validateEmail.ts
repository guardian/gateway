/* eslint-disable functional/immutable-data -- modifying body in expected way */
import { updateUser } from '@/server/lib/okta/api/users';
import { UserResponse, UserUpdateRequest } from '@/server/models/okta/User';
import { logger } from '@/server/lib/serverSideLogger';
import { trackMetric } from '@/server/lib/trackMetric';

/**
 * @name validateEmailAndPasswordSetSecurely
 * @description Use this method to update the emailValidated and passwordSetSecurely flags for a user.
 *
 * @param {string} id accepts the Okta user ID, email address (login) or login shortname (as long as it is unambiguous)
 * @param {string} ip The IP address of the user
 * @param {boolean} flagStatus Default is true. If true, the flags are set to true, if false, the flags are set to false
 * @param {boolean} updateEmail Default is true. If true, the emailValidated flag is updated to the flagStatus
 * @param {boolean} updatePassword Default is true. If true, the passwordSetSecurely flag is updated to the flagStatus
 * @returns {Promise<UserResponse>} Promise that resolves to the user object
 */
export const validateEmailAndPasswordSetSecurely = async ({
	id,
	ip,
	flagStatus = true,
	updateEmail = true,
	updatePassword = true,
}: {
	id: string;
	ip?: string;
	flagStatus?: boolean;
	updateEmail?: boolean;
	updatePassword?: boolean;
}): Promise<UserResponse> => {
	try {
		const profile: UserUpdateRequest['profile'] = (() => {
			const timestamp = new Date().toISOString();

			// construct the body based on the flags that need to be updated, as the update
			// should only contain the fields that need to be updated
			const body: UserUpdateRequest['profile'] = {};

			if (updateEmail) {
				body.emailValidated = flagStatus;
				body.lastEmailValidatedTimestamp = timestamp;
			}

			if (updatePassword) {
				body.passwordSetSecurely = flagStatus;
				body.lastPasswordSetSecurelyTimestamp = timestamp;
			}

			return body;
		})();

		const user = await updateUser(
			id,
			{
				profile,
			},
			ip,
		);

		if (updateEmail) {
			trackMetric('OktaAccountVerification::Success');
		}

		if (updatePassword) {
			trackMetric('OktaUpdatePassword::Success');
		}

		return user;
	} catch (error) {
		logger.error(
			`validateEmailAndPasswordSetSecurely failed: Error updating user ${id}`,
			error,
		);
		if (updateEmail) {
			trackMetric('OktaAccountVerification::Failure');
		}

		if (updatePassword) {
			trackMetric('OktaUpdatePassword::Failure');
		}
		throw error;
	}
};
