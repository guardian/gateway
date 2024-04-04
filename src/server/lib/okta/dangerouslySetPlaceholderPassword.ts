import crypto from 'crypto';
import { OktaError } from '@/server/models/okta/Error';
import { logger } from '@/server/lib/serverSideLogger';
import { validateRecoveryToken, resetPassword } from './api/authentication';
import { dangerouslyResetPassword } from './api/users';

/**
 * This function is used ONLY for users who do not have a password set at all
 * (i.e. social users or users imported from IDAPI). It does the following:
 * 1. Runs dangerouslyResetPassword() to generate a OTT (one-time token) to
 *    allow us to reset the user's password. This puts that user into RECOVERY
 *    state which will prevent them from logging in again.
 * 2. Uses the OTT to set a cryptographically secure placeholder password for the user.
 * After these operations, we can send the user a password reset email.
 * @param id The Okta user ID
 */
const dangerouslySetPlaceholderPassword = async (id: string): Promise<void> => {
	try {
		// Generate an recoveryToken OTT and put user into RECOVERY state
		const recoveryToken = await dangerouslyResetPassword(id);
		// Validate the token
		const { stateToken } = await validateRecoveryToken({
			recoveryToken,
		});
		// Check if state token is defined
		if (!stateToken) {
			throw new OktaError({
				message:
					'dangerouslySetPlaceholderPassword failed: state token is undefined',
			});
		}
		// Set the placeholder password as a cryptographically secure UUID
		await resetPassword({
			stateToken,
			newPassword: crypto.randomUUID(),
		});
	} catch (error) {
		logger.error(
			`dangerouslySetPlaceholderPassword failed: Error setting placeholder password for user ${id}`,
			error,
		);
		throw error;
	}
};

export default dangerouslySetPlaceholderPassword;
