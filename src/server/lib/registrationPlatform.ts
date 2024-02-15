import { logger } from '@/server/lib/serverSideLogger';
import { Jwt } from '@okta/jwt-verifier';
import { getUser, updateUser } from '@/server/lib/okta/api/users';
import { getApp } from './okta/api/apps';

/**
 * @name getRegistrationPlatform
 * @description Get the registration platform (app) based on the appClientId, this will be used to determine the platform the user is registering from, which is helpful for tracking purposes
 *
 * @param appClientId - the appClientId to get the app info for, corresponds to an app in Okta
 * @returns {Promise<string>} Promise that resolves to the app label, or `profile` if no appClientId is provided/error occurs, since this is the name of Gateway app in Okta
 */
export const getRegistrationPlatform = async (
	appClientId?: string,
): Promise<string> => {
	// If no appClientId is provided, we default to `profile` (name of Gateway app in Okta)
	if (!appClientId) {
		return 'profile';
	}

	// If an appClientId is provided, we use the app label to determine the platform
	try {
		const app = await getApp(appClientId);

		// label is what's set up in Okta as the name of the app
		// e.g. the android live app label is `android_live_app` or mma (manage.theguardian.com) is `manage_my_account`
		const label = app.label.toLowerCase();

		return label;
	} catch (error) {
		// If we fail to get the app info, we default to `profile`
		logger.error('Error getting app info in getRegistrationPlatform', error);
		return 'profile';
	}
};

export const updateRegistrationPlatform = async (
	accessToken: Jwt,
	appClientId?: string,
	request_id?: string,
): Promise<void> => {
	if (!accessToken) {
		throw new Error('No access token provided');
	}

	try {
		const registrationPlatform = await getRegistrationPlatform(appClientId);

		const user = await getUser(accessToken.claims.sub);

		// don't update users who already have a platform set
		if (!!user.profile.registrationPlatform) {
			return;
		}

		await updateUser(accessToken.claims.sub, {
			profile: {
				registrationPlatform,
			},
		});
	} catch (error) {
		logger.error(`Error updating registrationLocation via Okta`, error, {
			request_id,
		});
	}
};
