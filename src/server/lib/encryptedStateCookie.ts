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

const getEncryptedStateCookie = (req: Request): string | undefined => {
	// eslint-disable-next-line functional/no-let
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

export const clearEncryptedStateCookie = (res: Response) => {
	// Web browsers and other compliant clients will only clear the cookie
	// if the given options is identical to those given to res.cookie()
	// excluding expires and maxAge.
	res.clearCookie(encryptedStateCookieName, encryptedStateCookieOptions);
};
