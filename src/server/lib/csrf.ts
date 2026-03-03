import { getConfiguration } from '@/server/lib/getConfiguration';
import type {
	RequestWithCsrf,
	ResponseWithRequestState,
} from '@/server/models/Express';
import type { CookieOptions, NextFunction, Request } from 'express';
import { createHmac, randomBytes } from 'crypto';
import createHttpError from 'http-errors';

const { isHttps, encryptionSecretKey } = getConfiguration();

// Valid HTTP methods
type Methods =
	| 'GET'
	| 'HEAD'
	| 'PATCH'
	| 'PUT'
	| 'POST'
	| 'DELETE'
	| 'CONNECT'
	| 'OPTIONS'
	| 'TRACE';

// Options for the CSRF middleware
type CsrfOptions = {
	ignoredMethods?: Methods[];
	ignoredRoutes?: string[];
};

// use the __Host-prefix to make sure the cookie is only accessible by the same domain it is set on.
// This means that a compromised subdomain can no longer overwrite the cookie value and preventing MITM attacks.
// See for more info: https://archive.is/8hPYX and https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#cookie-namecookie-value
export const cookieName = '__Host-_csrf';

// Set up the invalid CSRF token error
export const invalidCsrfTokenError = createHttpError(
	403,
	'invalid csrf token',
	{
		code: 'EBADCSRFTOKEN',
	},
);

// Function to create a hash of a CSRF token via HMAC
const createTokenHash = (csrfToken: string) =>
	createHmac('sha256', encryptionSecretKey)
		.update(csrfToken)
		.digest('base64url');

// Function to validate the CSRF token and corresponding hash
const validateTokenAndHash = (csrfToken?: string, csrfTokenHash?: string) => {
	// validate the type at runtime as we need to check if they are strings and defined
	if (typeof csrfToken !== 'string' || typeof csrfTokenHash !== 'string')
		return false;

	// use the token and the encryption secret key to generate a hash and compare it to the hash we got from the cookie
	const expectedHash = createTokenHash(csrfToken);

	// If the hash is the same as the expected hash, the token is valid
	if (csrfTokenHash === expectedHash) return true;

	// If the hash is not the same as the expected hash, the token is invalid
	return false;
};

// Function to generate a new and set it as a cookie, which runs on every request
// If a valid CSRF token is present in the cookie, it will be reused
const generateCsrfToken = (
	req: Request,
	res: ResponseWithRequestState,
	cookieOptions: CookieOptions,
) => {
	// Get the csrf token from the cookie
	const csrfCookie = req.signedCookies[cookieName];

	// If the cookie is present and valid, attempt to reuse it
	if (csrfCookie && typeof csrfCookie === 'string') {
		// cookie has the form {token}|{hash}
		const [csrfToken, csrfTokenHash] = csrfCookie.split('|');
		// Validate the token and hash
		if (!validateTokenAndHash(csrfToken, csrfTokenHash)) {
			// If the pair is invalid and the cookie is present throw an error
			throw invalidCsrfTokenError;
		}
		// If the pair is valid, reuse it
		return csrfToken;
	}

	// If the cookie is not present or invalid, generate a new token
	const csrfToken = randomBytes(64).toString('base64url');

	// Generate a hash of the token and the encryption secret key
	const csrfTokenHash = createTokenHash(csrfToken);

	// Set the cookie with the token and hash
	res.cookie(cookieName, `${csrfToken}|${csrfTokenHash}`, cookieOptions);

	// Return the token
	return csrfToken;
};

// Function to validate a given request's CSRF token
const validateRequest = (req: Request) => {
	// Get the csrf token from the cookie
	const csrfCookie = req.signedCookies[cookieName];

	// If the cookie is present and valid, reuse it
	if (!csrfCookie || typeof csrfCookie !== 'string') {
		return false;
	}

	// cookie has the form {token}|{hash}
	const [csrfToken, csrfTokenHash] = csrfCookie.split('|');

	// csrf token from the request body, as thats the only place we currently accept it
	const csrfTokenFromRequest = req.body?._csrf;

	// If the token from the request body is missing, return false
	if (!csrfTokenFromRequest) {
		return false;
	}

	return (
		// Check if the token from the request body is the same as the token from the cookie
		csrfToken === csrfTokenFromRequest &&
		// Check if the token and hash are valid
		validateTokenAndHash(csrfToken, csrfTokenHash)
	);
};

/**
 * @name csrf
 * @description Initialise and return a middleware to protect against CSRF attacks.
 *
 * This is based on the signed double submit cookie pattern, where a cookie is set with a CSRF token and a hash of that token.
 *
 * See https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#signed-double-submit-cookie-recommended
 *
 * The general pseudocode for the CSRF middleware is as follows:
 *
 * For generating the hash:
 *
 * ```txt
 * createHmac("SHA256", secret, token)
 * encode to base64url
 * return hash
 * ```
 *
 * For generating the CSRF token:
 *
 * ```txt
 * check if CSRF token is present in the cookie
 * if (CSRF token is present and valid)
 *   reuse the token
 * else
 *   generate a new CSRF token using a cryptographically secure random number generator
 *   encode token to base64url
 *   generate a hash of the token using HMAC and a secret key
 *   set a cookie with the token and hash
 *   return the token
 * ```
 *
 * For validating the request:
 * ```txt
 * if (request.method is in the ignoredMethods array)
 *    continue with the request without CSRF check
 * if (request.path is in the ignoredRoutes array)
 *    continue with the request without CSRF check
 * else
 *    # validate the request
 *	  get the CSRF token from the cookie
 *    split it into the token and hash
 *    if (token from cookie or hash from cookie is missing)
 *        throw an error
 *    get token from the request body
 *    if (token from request body is missing)
 *   	  throw an error
 *	  if (token from cookie is not the same as token from request body)
 *        throw an error
 *    check token and hash are valid by comparing the hash of the token with the hash from the cookie
 *    if (token and hash are not valid)
 * 		  throw an error
 *    continue with the request, as the CSRF check passed
 * ```
 *
 * This is based on https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#pseudo-code-for-implementing-hmac-csrf-tokens
 *
 * Unlike the OWASP example, we don't have a session to bind the CSRF token to,
 * which would lead to the "Naive Double Submit Cookie" pattern, with security implications mentioned in https://owasp.org/www-chapter-london/assets/slides/David_Johansson-Double_Defeat_of_Double-Submit_Cookie.pdf
 *
 * However we can avoid this pitfall by using signed cookies, which are not vulnerable to the same attacks,
 * as they are signed with a (different) secret key, meaning that the attacker cannot forge a valid CSRF token,
 * as any changes to the token would invalidate the signature, and the server wouldn't make the cookie available.
 *
 * @param ignoredMethods - Array of HTTP methods to ignore for CSRF checks
 * @param ignoredRoutes - Array of routes to ignore for CSRF checks
 * @returns Express middleware function
 */
export const csrf = ({
	ignoredMethods = ['GET', 'HEAD', 'OPTIONS'],
	ignoredRoutes = [],
}: CsrfOptions) => {
	// Set up the cookie options
	const cookieOptions: CookieOptions = {
		sameSite: 'lax',
		path: '/',
		secure: isHttps,
		httpOnly: true,
		signed: true,
	};

	// Generate and return the CSRF middleware
	return (
		req: RequestWithCsrf,
		res: ResponseWithRequestState,
		next: NextFunction,
	) => {
		// Add the csrfToken function to the request object to generate a CSRF token (or reuse an existing one if valid)
		// For backwards compatibility with the csurf library which we're replacing that adds the csrfToken function to the request object
		// eslint-disable-next-line functional/immutable-data -- Allow mutation for the csrfToken function to add it to the request object
		req.csrfToken = () => generateCsrfToken(req, res, cookieOptions);

		if (
			// If the method is in the ignoredMethods or ignoredRoutes array, skip the CSRF check
			ignoredMethods.some((method) => method === req.method) ||
			// If the route is in the ignoredRoutes array, skip the CSRF check
			ignoredRoutes.some((route) => req.path.startsWith(route))
		) {
			next();
		} else if (
			// validate the request to check if the CSRF token is valid
			validateRequest(req)
		) {
			// If the CSRF token is valid, continue with the request
			next();
		} else {
			// If the CSRF token is invalid, throw an error
			next(invalidCsrfTokenError);
		}
	};
};
