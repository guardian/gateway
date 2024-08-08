import { logger } from './serverSideLogger';

export const validateFromUri = (
	fromURI: string | undefined,
): string | undefined => {
	if (fromURI && !fromURI.startsWith('/oauth2/')) {
		logger.warn('Got invalid fromURI from request.', undefined, { fromURI });
		return undefined;
	}

	return fromURI;
};
