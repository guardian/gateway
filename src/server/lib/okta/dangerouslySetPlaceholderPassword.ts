import crypto from 'crypto';
import { OktaError } from '@/server/models/okta/Error';
import { logger } from '@/server/lib/serverSideLogger';
import { validateRecoveryToken, resetPassword } from './api/authentication';
import { dangerouslyResetPassword } from './api/users';
import { validateEmailAndPasswordSetSecurely } from './validateEmail';

// Define the parameter object type
interface PlaceholderPasswordParams {
	id: string;
	ip?: string;
	returnPlaceholderPassword?: boolean;
}

/**
 * This function is used ONLY for users who do not have a password set at all
 * (i.e. social users or users imported from IDAPI). It does the following:
 * 1. Runs dangerouslyResetPassword() to generate a OTT (one-time token) to
 *    allow us to reset the user's password. This puts that user into RECOVERY
 *    state which will prevent them from logging in again.
 * 2. Uses the OTT to set a cryptographically secure placeholder password for the user.
 * After these operations, we can send the user a password reset email.
 * @param id The Okta user ID
 * @param id The IP address of the user
 * @param returnPlaceholderPassword If true, return the placeholder password
 * @returns The placeholder password if returnPlaceholderPassword is true, otherwise void (undefined)
 */
// Overload signatures
async function dangerouslySetPlaceholderPassword(
	params: PlaceholderPasswordParams & { returnPlaceholderPassword: true },
): Promise<string>;
async function dangerouslySetPlaceholderPassword(
	params: PlaceholderPasswordParams & { returnPlaceholderPassword?: false },
): Promise<void>;
// Implementation
async function dangerouslySetPlaceholderPassword({
	id,
	ip,
	returnPlaceholderPassword = false,
}: PlaceholderPasswordParams): Promise<string | void> {
	try {
		// Generate an recoveryToken OTT and put user into RECOVERY state
		const recoveryToken = await dangerouslyResetPassword(id, ip);
		// Validate the token
		const { stateToken } = await validateRecoveryToken({
			recoveryToken,
			ip,
		});
		// Check if state token is defined
		if (!stateToken) {
			throw new OktaError({
				message:
					'dangerouslySetPlaceholderPassword failed: state token is undefined',
			});
		}
		// Set the placeholder password as a cryptographically secure UUID
		const placeholderPassword = crypto.randomUUID();
		await resetPassword(
			{
				stateToken,
				newPassword: placeholderPassword,
			},
			ip,
		);

		// Unset the emailValidated and passwordSetSecurely flags
		await validateEmailAndPasswordSetSecurely({
			id,
			ip,
			flagStatus: false,
		});

		if (returnPlaceholderPassword) {
			return placeholderPassword;
		}
	} catch (error) {
		logger.error(
			`dangerouslySetPlaceholderPassword failed: Error setting placeholder password for user ${id}`,
			error,
		);
		throw error;
	}
}

export default dangerouslySetPlaceholderPassword;
