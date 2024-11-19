import { Request, Response, CookieOptions } from 'express';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { logger } from './serverSideLogger';
import { decrypt, encrypt } from './crypto';
import { EncryptedState } from '@/shared/model/EncryptedState';

const { baseUri } = getConfiguration();

const encryptedStateCookieName = 'GU_GATEWAY_STATE';

type CookieSource = 'cookies' | 'signedCookies';

const encryptedStateCookieOptions: CookieOptions = {
	httpOnly: true,
	secure: !baseUri.includes('localhost'),
	signed: !baseUri.includes('localhost'),
	sameSite: 'lax',
};

/**
 * @name setEncryptedStateCookie
 * @description Set the encrypted state cookie, overwriting any existing data in the cookie should it exist
 * @param {Response} res - The express response object
 * @param {EncryptedState} state - The state to encrypt and set in the cookie
 * @returns {Response} The express response object with the cookie set, usually not needed
 */
export const setEncryptedStateCookie = (
	res: Response,
	state: EncryptedState,
) => {
	// validate and modify any fields before encrypting
	const validated: EncryptedState = {
		...state,
		// We only need the first part of the state handle before the delimiter
		// which is also much shorter to reduce the size of the cookie, but everything
		// continues to work as expected
		stateHandle: state.stateHandle?.split('~')[0],
	};

	// remove any undefined values
	const cleaned: EncryptedState = Object.fromEntries(
		Object.entries(validated).filter(([, value]) => value !== undefined),
	);

	// encrypt the state
	const encrypted = encrypt(
		JSON.stringify(cleaned),
		getConfiguration().encryptionSecretKey, // prevent the key from lingering in memory by only calling when needed
	);

	// set the cookie
	return res.cookie(
		encryptedStateCookieName,
		encrypted,
		// We check if we're running locally here to make testing easier
		encryptedStateCookieOptions,
	);
};

/**
 * @name getEncryptedStateCookie
 * @description Get the encrypted state cookie from the express request by checking the correct cookie source
 * @param {Request} req - The express request object
 * @returns {string | undefined} The encrypted state cookie or undefined if it doesn't exist
 */
const getEncryptedStateCookie = (req: Request): string | undefined => {
	// eslint-disable-next-line functional/no-let -- used to determine the cookie source, TODO: potential for refactoring to remove let
	let cookieSource: CookieSource;
	if (process.env.RUNNING_IN_CYPRESS === 'true') {
		// If we're in testing, first try reading from signedCookies,
		// and only then fall back to regular cookies.
		if (Object.keys(req.signedCookies).includes(encryptedStateCookieName)) {
			cookieSource = 'signedCookies';
		} else {
			cookieSource = 'cookies';
		}
	} else {
		// If we're not in testing, always read from signedCookies.
		cookieSource = 'signedCookies';
	}
	return req?.[cookieSource]?.[encryptedStateCookieName];
};

/**
 * @name readEncryptedStateCookie
 * @description Read the encrypted state cookie from the express request, decrypt it and parse it as JSON, and return it
 * @param {Request} req - The express request object
 * @returns {EncryptedState | undefined} The decrypted and parsed state or undefined if it doesn't exist
 */
export const readEncryptedStateCookie = (
	req: Request,
): EncryptedState | undefined => {
	const encryptedCookie = getEncryptedStateCookie(req);
	try {
		if (encryptedCookie) {
			const decrypted = decrypt(
				encryptedCookie,
				getConfiguration().encryptionSecretKey, // prevent the key from lingering in memory by only calling when needed
			);
			return JSON.parse(decrypted);
		}
	} catch (error) {
		logger.error(
			`Error parsing cookie with length ${
				encryptedCookie ? encryptedCookie.length : 'undefined'
			}`,
		);
	}
};

/**
 * @name updateEncryptedStateCookie
 * @description Update the encrypted state cookie with the provided state, merging it with the existing state
 * @param {Request} req - The express request object
 * @param {Response} res - The express response object
 * @param {EncryptedState} state - The state to merge with the existing state in the cookie
 * @returns {void} Nothing, the cookie is set directly on the response
 */
export const updateEncryptedStateCookie = (
	req: Request,
	res: Response,
	state: EncryptedState,
) => {
	const encryptedState = readEncryptedStateCookie(req);
	setEncryptedStateCookie(res, {
		...encryptedState,
		...state,
	});
};

/**
 * @name clearEncryptedStateCookie
 * @description Clear the encrypted state cookie from the express response
 * @param {Response} res - The express response object
 * @returns {void} Nothing, the cookie is cleared directly on the response
 */
export const clearEncryptedStateCookie = (res: Response) => {
	// Web browsers and other compliant clients will only clear the cookie
	// if the given options is identical to those given to res.cookie()
	// excluding expires and maxAge.
	res.clearCookie(encryptedStateCookieName, encryptedStateCookieOptions);
};
