import type { Jwt } from '@okta/jwt-verifier';
import type { Request } from 'express';
import { getRegistrationLocation } from '@/server/lib/getRegistrationLocation';
import { getUser, updateUser } from '@/server/lib/okta/api/users';
import { logger } from '@/server/lib/serverSideLogger';
import type { RegistrationLocation } from '@/shared/model/RegistrationLocation';

export const updateRegistrationLocationViaOkta = async (
	req: Request,
	accessToken?: Jwt,
): Promise<void> => {
	if (!accessToken) {
		throw new Error('No access token provided');
	}
	const registrationLocation: RegistrationLocation | undefined =
		getRegistrationLocation(req);

	// don't update users if we can't derive location from request
	if (!registrationLocation) {
		return;
	}

	try {
		const user = await getUser(accessToken.claims.sub);

		// don't update users who already have a location set
		if (user.profile.registrationLocation) {
			return;
		}

		await updateUser(accessToken.claims.sub, {
			profile: {
				registrationLocation,
			},
		});
	} catch (error) {
		logger.error(
			`${req.method} ${req.originalUrl} Error updating registrationLocation via Okta`,
			error,
			{
				request_id: req.get('x-request-id'),
			},
		);
	}
};
