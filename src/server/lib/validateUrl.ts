import { getConfiguration } from '@/server/lib/getConfiguration';

// valid web hostnames
const validHostnames = [
	'.theguardian.com',
	'.code.dev-theguardian.com',
	'.thegulocal.com',
];

// valid subdomains
const validSubdomains = ['profile.', 'support.', 'observer.'];

// invalid paths for profile subdomain
const invalidPaths = ['/signout'];

const { defaultReturnUri } = getConfiguration();

export const validateReturnUrl = (returnUrl = ''): string => {
	try {
		// we decode the returnUrl as we cant know for sure if it's been encoded or not
		// so decode just to be safe
		const url = new URL(decodeURIComponent(returnUrl));

		//This guards against invalid protocol, including app ones
		if (url.protocol !== 'https:') {
			throw 'Invalid protocol';
		}

		// check the hostname is valid
		if (!validHostnames.some((hostname) => url.hostname.endsWith(hostname))) {
			throw 'Invalid hostname';
		}

		// if valid subdomains are present, we can return the url with the query params
		if (
			validSubdomains.some((subdomain) => url.hostname.startsWith(subdomain))
		) {
			// check the pathname is valid, only if on profile subdomain
			if (
				url.hostname.startsWith('profile.') &&
				invalidPaths.some((path) => url.pathname.startsWith(path))
			) {
				throw 'Invalid path';
			}

			return url.href;
		}

		return `https://${url.hostname}${url.pathname}`;
	} catch (error) {
		// error parsing url so return the default
		return defaultReturnUri;
	}
};

export const validateRefUrl = (ref = ''): string | undefined => {
	try {
		// we decode the ref as we cant know for sure if it's been encoded or not
		// so decode just to be safe
		const url = new URL(decodeURIComponent(ref));

		// check the hostname is valid
		if (!validHostnames.some((hostname) => url.hostname.endsWith(hostname))) {
			throw 'Invalid hostname';
		}

		return `https://${url.hostname}${url.pathname}`;
	} catch (error) {
		// error parsing url so return the default
		return;
	}
};
