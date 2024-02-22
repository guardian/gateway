import { isOneOf } from '@guardian/libs';

/**
 * list of app prefixes and labels that is used by native apps to determine
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
export const apps = [
	['android_live_app', 'al_'],
	['ios_live_app', 'il_'],
	['ios_feast_app', 'if_'],
] as const;

type AppLabel = (typeof apps)[number][0];
type AppPrefix = (typeof apps)[number][1];

export const appPrefixes = apps.map(([, prefix]) => prefix);

export const isAppPrefix = isOneOf(appPrefixes);

const appLabels = apps.map(([label]) => label);
export const isAppLabel = isOneOf(appLabels);

/**
 * @name getAppPrefix
 * @description To check and get a string has a prefix representing an native application.
 *
 * @param token	- string that may or may not have a prefix representing an native application
 * @returns	- boolean representing if the string has a prefix representing an native application
 */
export const getAppPrefix = (token: string): string | undefined =>
	appPrefixes.find((prefix) => token.startsWith(prefix));

export const getAppName = (
	labelOrPrefix: AppLabel | AppPrefix,
): string | undefined => {
	switch (labelOrPrefix) {
		case 'al_':
		case 'android_live_app':
		case 'il_':
		case 'ios_live_app':
			return 'Guardian';
		case 'if_':
		case 'ios_feast_app':
			return 'Feast';
	}
};
