import { csrf } from '@/server/lib/csrf';

// `[^/]+` : matches one or more characters that are not a forward slash. Used to catch the data and token parts of the path
const newsletterListUnsubscribePathPattern =
	/^\/list-unsubscribe\/newsletter\/[^/]+\/[^/]+\/?$/;

// Setup the CSRF middleware
export const csrfMiddleware = csrf({
	ignoredRoutes: [
		'/unsubscribe-all/',
		{
			method: 'POST',
			// Email providers can't supply CSRF credentials. IDAPI validates the subscription token.
			path: newsletterListUnsubscribePathPattern,
		},
	],
});
