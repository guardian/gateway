import { getApp } from '@/server/lib/okta/api/apps';
import { logger } from '../serverSideLogger';

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
type AppPrefix = typeof appPrefixes[number];

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

    let appPrefix: AppPrefix;

    switch (label) {
      case 'android_live_app':
        appPrefix = 'al_';
        break;
      case 'ios_live_app':
        appPrefix = 'il_';
        break;
      default:
        appPrefix = '';
    }
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
