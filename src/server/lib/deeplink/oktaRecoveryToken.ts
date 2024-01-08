import { getApp } from '@/server/lib/okta/api/apps';
import { logger } from '@/server/lib/serverSideLogger';
import { decrypt, encrypt } from '@/server/lib/crypto';
import { getConfiguration } from '@/server/lib/getConfiguration';
import {
	base64ToUrlSafeString,
	urlSafeStringToBase64,
} from '@/server/lib/base64';

/**
 * list of app prefixes that is used by native apps to determine
 * the links that should be opened in the app via deep linking
 * for example, the android live app uses the prefix 'al_'
 * therefore the deeplink path for reset password would be
 * `/reset-password/al_<token>`
 * where <token> is the okta recovery token, and the android live app
 * will intercept the deeplink on the
 * `/reset-password/al_*` path
 *
 * The reason we do this is that this allows apps to distinguish between
 * each other's deeplinks, for example between the android live app and
 * the android puzzles app (which will have a different prefix)
 * and also allows us to have multiple paths under
 * the same path which should not be intercepted by the app
 * e.g. `/reset-password/email-sent`
 */
const appPrefixes = [
	'al_', // Android live app
	'il_', // iOS live app
];
type AppPrefix = (typeof appPrefixes)[number];

/**
 * @name extractOktaRecoveryToken
 * @description To extract a recovery token from a larger string that may or may not have a prefix representing an native application.
 *
 * @param token string that may or may not have a prefix representing an native application
 * @returns string representing the recovery token
 */
export const extractOktaRecoveryToken = (token: string): string => {
	const prefix = appPrefixes.find((prefix) => token.startsWith(prefix));

	if (!prefix) {
		return token;
	}

	return token.replace(prefix, '');
};

/**
 * @name addAppPrefixToOktaRecoveryToken
 * @description To add a prefix representing an native application to a recovery token.
 *
 * This is used to generate a deeplink that can be intercepted by the native app.
 * The deeplink path for reset password would be
 * `/reset-password/al_<token>`
 * where <token> is the okta recovery token, and the android live app
 * will intercept the deeplink on the
 * `/reset-password/al_*` path
 *
 * @param token string representing the recovery token
 * @param appClientId string representing the app client id
 * @returns string representing the recovery token with the app prefix
 *
 */
export const addAppPrefixToOktaRecoveryToken = async (
	token: string,
	appClientId?: string,
	request_id?: string,
): Promise<string> => {
	if (!appClientId) {
		return token;
	}

	try {
		const app = await getApp(appClientId);

		const label = app.label.toLowerCase();

		const appPrefix: AppPrefix = (() => {
			switch (label) {
				case 'android_live_app':
					return 'al_';
				case 'ios_live_app':
					return 'il_';
				default:
					return '';
			}
		})();

		return `${appPrefix}${token}`;
	} catch (error) {
		logger.error(
			'Error getting app info in addAppPrefixToOktaRecoveryToken',
			error,
			{
				request_id,
			},
		);
		return token;
	}
};

/**
 * @name encryptOktaRecoveryToken
 * @description Encrypts an okta recovery token, and optionally encrypted registration consents to be used as part of a link we send to the user. It can also call addAppPrefixToOktaRecoveryToken to add a prefix representing an native application to the recovery token. See addAppPrefixToOktaRecoveryToken for more details.
 * @param token string representing the recovery token
 * @param encryptedRegistrationConsents string representing the encrypted registration consents
 * @param appClientId string representing the app client id
 * @param request_id string representing the request id
 * @returns string representing the encrypted recovery token
 */
export const encryptOktaRecoveryToken = ({
	token,
	encryptedRegistrationConsents,
	appClientId,
	request_id,
}: {
	token: string;
	encryptedRegistrationConsents?: string;
	appClientId?: string;
	request_id?: string;
}): Promise<string> => {
	try {
		const encrypted = encrypt(
			`${token}${
				encryptedRegistrationConsents ? `|${encryptedRegistrationConsents}` : ''
			}`,
			getConfiguration().encryptionSecretKey,
		);

		return addAppPrefixToOktaRecoveryToken(
			base64ToUrlSafeString(encrypted),
			appClientId,
			request_id,
		);
	} catch (error) {
		logger.error('Error encrypting token in encryptOktaRecoveryToken', error, {
			request_id,
		});
		// if the token cannot be encrypted use token as is
		return Promise.resolve(
			addAppPrefixToOktaRecoveryToken(token, appClientId, request_id),
		);
	}
};

/**
 * @name decryptOktaRecoveryToken
 * @description Decrypts an okta recovery token, and optionally also get the encrypted registration consents that are part of a link we send to the user. It can also call extractOktaRecoveryToken to remove a prefix representing an native application from the recovery token. See extractOktaRecoveryToken for more details.
 * @param encryptedToken string representing the encrypted recovery token
 * @param request_id string representing the request id
 * @returns [string] representing the decrypted recovery token
 */
export const decryptOktaRecoveryToken = ({
	encryptedToken,
	request_id,
}: {
	encryptedToken: string;
	request_id?: string;
}): [recoveryToken: string, encryptedRegistrationConsents?: string] => {
	try {
		const token = extractOktaRecoveryToken(encryptedToken);

		const decrypted = decrypt(
			urlSafeStringToBase64(token),
			getConfiguration().encryptionSecretKey,
		);

		const [recoveryToken, encryptedRegistrationConsents] = decrypted.split('|');

		return [recoveryToken, encryptedRegistrationConsents];
	} catch (error) {
		logger.error('Error decrypting token in decryptOktaRecoveryToken', error, {
			request_id,
		});
		// if the token cannot be decrypted, it is likely that it is not encrypted
		return [extractOktaRecoveryToken(encryptedToken)];
	}
};
