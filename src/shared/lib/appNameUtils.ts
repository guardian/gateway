import { isOneOf } from '@guardian/libs';
import Bowser from 'bowser';
import { IsNativeApp } from '@/shared/model/ClientState';

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
	['android_feast_app', 'af_'],
	['ios_feast_app', 'if_'],
	['editions_pressreader', 'ed_'],
] as const;

type AppLabel = (typeof apps)[number][0];
type AppPrefix = (typeof apps)[number][1];

export const appPrefixes = apps.map(([, prefix]) => prefix);

export const isAppPrefix = isOneOf(appPrefixes);

const appLabels = apps.map(([label]) => label);
export const isAppLabel = isOneOf(appLabels);

export type AppName = 'Guardian' | 'Feast' | 'Editions';

/**
 * @name getAppPrefix
 * @description To check and get a string has a prefix representing an native application.
 *
 * @param token	- string that may or may not have a prefix representing an native application
 * @returns	- boolean representing if the string has a prefix representing an native application
 */
export const getAppPrefix = (token: string): AppPrefix | undefined =>
	appPrefixes.find((prefix) => token.startsWith(prefix));

/**
 * @name getAppName
 * @description To get the name of the application from the prefix or label.
 * @param labelOrPrefix - AppLabel or AppPrefix
 * @returns {AppName} - 'Guardian', 'Feast', 'Editions' or undefined
 */
export const getAppName = (
	labelOrPrefix: AppLabel | AppPrefix,
): AppName | undefined => {
	switch (labelOrPrefix) {
		case 'al_':
		case 'android_live_app':
		case 'il_':
		case 'ios_live_app':
			return 'Guardian';
		case 'af_':
		case 'android_feast_app':
		case 'if_':
		case 'ios_feast_app':
			return 'Feast';
		case 'ed_':
		case 'editions_pressreader':
			return 'Editions';
	}
};

/**
 * @name getIsNativeAppFromBowser
 * @description Use a Bowser instance to determine if the browser is a native os.
 * @param browser - Bowser instance
 * @returns {IsNativeApp} - 'android' or 'ios' if the browser matches Android or iOS, otherwise undefined
 */
export const getIsNativeAppFromBowser = (
	browser: Bowser.Parser.Parser,
): IsNativeApp | undefined => {
	const os = browser.getOSName();

	if (os === 'Android') {
		return 'android';
	}

	if (os === 'iOS') {
		return 'ios';
	}
};
