import { logger } from '@/server/lib/serverSideLogger';
import { getUserByEmailAddress } from '@/server/lib/idapi/user';
import { getUser, updateUser } from '@/server/lib/okta/api/users';
import { sha256Hex } from '@/server/lib/crypto';

export const fixOktaProfile = async ({
	oktaId,
	email,
	ip,
	request_id,
}: {
	oktaId: string;
	email?: string;
	ip: string | undefined;
	request_id?: string;
}): Promise<boolean> => {
	try {
		const oktaUser = await getUser(oktaId);
		// Check the legacyIdentityId field. If it's set, we don't need to do anything.
		if (oktaUser.profile.legacyIdentityId) {
			return true;
		}
		// If the email is not provided, we can't fix the profile.
		if (!email) {
			throw new Error(`fixOktaProfile - Email is required to fix Okta profile`);
		}
		const idapiUser = await getUserByEmailAddress(email, ip, request_id);
		if (!idapiUser.id) {
			throw new Error(`fixOktaProfile - IDAPI profile missing ID`);
		}
		await updateUser(oktaId, {
			profile: {
				legacyIdentityId: idapiUser.id,
				searchPartitionKey: sha256Hex(idapiUser.id),
			},
		});
		return true;
	} catch (error) {
		logger.warn('fixOktaProfile - Could not fix Okta profile', error);
		return false;
	}
};
