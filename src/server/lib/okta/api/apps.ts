import { getConfiguration } from '@/server/lib/getConfiguration';
import {
	AppResponse,
	appResponseSchema,
	appsResponseSchema,
} from '@/server/models/okta/App';
import { OktaError } from '@/server/models/okta/Error';
import { buildUrl } from '@/shared/lib/routeUtils';
import { joinUrl } from '@guardian/libs';
import { authorizationHeader, defaultHeaders } from './headers';
import { handleErrorResponse } from '@/server/lib/okta/api/errors';
import { logger } from '@/server/lib/serverSideLogger';

const { okta } = getConfiguration();

/**
 * Okta's Apps API
 * https://developer.okta.com/docs/reference/api/apps/
 */

/**
 * @name getApp
 * @description Get an application configured within Okta by application ID
 *
 * Uses AppCache map to memoize as to cache the response, as the application config is unlikely to change
 *
 * https://developer.okta.com/docs/reference/api/apps/#get-application
 *
 * @returns {Promise<AppResponse>}
 */
const AppCache = new Map<string, AppResponse>();
export const getApp = async (id: string): Promise<AppResponse> => {
	if (AppCache.has(id)) {
		return Promise.resolve(AppCache.get(id) as AppResponse);
	}

	const path = buildUrl(`/api/v1/apps/:id`, { id });

	const app = await fetch(joinUrl(okta.orgUrl, path), {
		headers: { ...defaultHeaders(), ...authorizationHeader() },
	}).then(handleAppResponse);

	// eslint-disable-next-line functional/immutable-data -- we need to cache the app, so  we need to mutate it here
	AppCache.set(id, app);

	return app;
};

const handleAppResponse = async (response: Response): Promise<AppResponse> => {
	if (response.ok) {
		try {
			return appResponseSchema.parse(await response.json());
		} catch (error) {
			logger.error(`Parsing error - appResponseSchema`, error);
			throw new OktaError({
				message: 'Could not parse Okta app response',
			});
		}
	} else {
		return await handleErrorResponse(response);
	}
};

// eslint-disable-next-line functional/no-let -- we want to cache the apps response, so this variable needs to be mutable
let AppsCache: AppResponse[] | undefined;

/**
 * @name getApps
 * @description Get all applications configured within Okta
 *
 * Uses AppsCache array to memoize as to cache the response, as the application config is unlikely to change
 *
 * https://developer.okta.com/docs/api/openapi/okta-management/management/tag/Application/#tag/Application/operation/listApplications
 *
 * @returns {Promise<AppResponse[]>}
 */
export const getApps = async (): Promise<AppResponse[]> => {
	if (AppsCache) {
		return Promise.resolve(AppsCache);
	}

	const path = buildUrl(`/api/v1/apps`, {});

	const apps = await fetch(joinUrl(okta.orgUrl, path), {
		headers: { ...defaultHeaders(), ...authorizationHeader() },
	}).then(handleAppsResponse);

	AppsCache = apps;

	return apps;
};

const handleAppsResponse = async (
	response: Response,
): Promise<AppResponse[]> => {
	if (response.ok) {
		try {
			return appsResponseSchema.parse(await response.json());
		} catch (error) {
			logger.error(`Parsing error - appsResponseSchema`, error);
			throw new OktaError({
				message: 'Could not parse Okta apps response',
			});
		}
	} else {
		return await handleErrorResponse(response);
	}
};
