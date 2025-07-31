import { csrf } from '@/server/lib/csrf';

// Setup the CSRF middleware
export const csrfMiddleware = csrf({
	ignoredRoutes: ['/unsubscribe-all/', '/static/'],
});
