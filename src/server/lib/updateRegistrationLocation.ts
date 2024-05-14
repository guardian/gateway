import { Request } from 'express';
import { logger } from '@/server/lib/serverSideLogger';
import { getRegistrationLocation } from '@/server/lib/getRegistrationLocation';
import {
	read as readIdapiUser,
	addRegistrationLocation,
} from '@/server/lib/idapi/user';
import { Jwt } from '@okta/jwt-verifier';
import { getUser, updateUser } from '@/server/lib/okta/api/users';
import { RegistrationLocation } from '@/shared/model/RegistrationLocation';

export const updateRegistrationLocationViaIDAPI = async (
	ip: string,
	sc_gu_u: string,
	req: Request,
) => {
	const registrationLocation: RegistrationLocation | undefined =
		getRegistrationLocation(req);

	// don't update users if we can't derive location from request
	if (!registrationLocation) {
		return;
	}

	try {
		const user = await readIdapiUser(ip, sc_gu_u);
		// don't update users who already have a location set
		if (!!user.privateFields.registrationLocation) {
			return;
		}
		await addRegistrationLocation(registrationLocation, ip, sc_gu_u);
	} catch (error) {
		logger.error(
			`${req.method} ${req.originalUrl} Error updating registrationLocation via IDAPI`,
			error,
			{
				request_id: req.get('x-request-id'),
			},
		);
	}
};

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
		if (!!user.profile.registrationLocation) {
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
