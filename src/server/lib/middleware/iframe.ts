import { Request, Response, NextFunction, CookieOptions } from 'express';

interface IframeRequest extends Request {
	isIframeRequest?: boolean;
}

/**
 * Middleware to detect if the request is being made within an iframe
 * and set appropriate response headers for iframe compatibility
 */
export const iframeCompatibilityMiddleware = (
	req: IframeRequest,
	res: Response,
	next: NextFunction,
) => {
	// Check if the request is coming from an iframe
	const isInIframe =
		req.headers['sec-fetch-dest'] === 'iframe' ||
		req.headers['x-iframe-request'] === 'true';

	if (isInIframe) {
		// Set iframe-specific headers
		res.setHeader('X-Frame-Options', 'SAMEORIGIN');

		// Add iframe context to request for downstream middleware
		// eslint-disable-next-line functional/immutable-data -- Needed to track iframe requests across middleware
		req.isIframeRequest = true;
	}

	next();
};

/**
 * Middleware to modify cookie settings for iframe compatibility
 */
export const iframeCookieMiddleware = (
	req: IframeRequest,
	res: Response,
	next: NextFunction,
) => {
	const isInIframe = req.isIframeRequest;

	if (isInIframe) {
		// Store original cookie method
		const originalCookie = res.cookie.bind(res);

		// Override cookie method to set SameSite=None for iframe compatibility
		// eslint-disable-next-line functional/immutable-data -- Required to override Express response method for iframe compatibility
		res.cookie = function (
			name: string,
			value: string,
			options: CookieOptions = {},
		) {
			// For iframe requests, we need SameSite=None and Secure=true
			// to allow cross-site cookies
			const iframeOptions: CookieOptions = {
				...options,
				sameSite: 'none',
				secure: true, // Required when SameSite=None
			};

			return originalCookie(name, value, iframeOptions);
		};
	}

	next();
};
