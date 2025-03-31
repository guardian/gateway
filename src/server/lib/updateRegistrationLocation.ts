import { Request } from 'express';
import { logger } from '@/server/lib/serverSideLogger';
import { getRegistrationLocation } from '@/server/lib/getRegistrationLocation';
import { Jwt } from '@okta/jwt-verifier';
import { getUser, updateUser } from '@/server/lib/okta/api/users';

export const updateRegistrationLocationViaOkta = async (
	req: Request,
	accessToken?: Jwt,
): Promise<void> => {
	if (!accessToken) {
		throw new Error('No access token provided');
	}
	const [registrationLocation, registrationLocationState] =
		getRegistrationLocation(req);

	// don't update users if we can't derive location from request
	if (!registrationLocation) {
		return;
	}

	try {
		const user = await getUser(accessToken.claims.sub, req.ip);

		// don't update users who already have a location set
		if (
			user.profile.registrationLocation ||
			user.profile.registrationLocationState
		) {
			return;
		}

		await updateUser(
			accessToken.claims.sub,
			{
				profile: {
					registrationLocation,
					registrationLocationState,
				},
			},
			req.ip,
		);
	} catch (error) {
		logger.error(
			`${req.method} ${req.originalUrl} Error updating registrationLocation via Okta`,
			error,
		);
	}
};
