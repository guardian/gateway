/* eslint-disable @typescript-eslint/no-explicit-any */

import { getConfiguration } from '@/server/lib/getConfiguration';
import { joinUrl } from '@guardian/libs';
import { buildUrl, ExtractRouteParams } from '@/shared/lib/routeUtils';
import { IdApiQueryParams } from '@/shared/model/IdapiQueryParams';
import { addApiQueryParamsToPath } from '@/shared/lib/queryParams';
import { ApiRoutePaths } from '@/shared/model/Routes';

const { idapiBaseUrl, idapiClientAccessToken, stage, baseUri } =
	getConfiguration();

const getOrigin = (stage: string): string => {
	switch (stage) {
		case 'CODE':
		case 'PROD':
			return `https://${baseUri}`;
		default:
			return 'https://profile.thegulocal.com';
	}
};

export interface IDAPIError {
	error: any;
	status: number;
}

const handleResponseFailure = async (
	response: Response,
): Promise<IDAPIError> => {
	// eslint-disable-next-line functional/no-let
	let err;
	const raw = await response.text();

	try {
		err = JSON.parse(raw);
	} catch (_) {
		err = raw;
	}
	throw { error: err, status: response.status };
};

const handleResponseSuccess = async (response: Response) => {
	try {
		return await response.json();
	} catch (e) {
		throw new Error(`Error decoding JSON response: ${e}`);
	}
};

const getAPIOptionsForMethod =
	(method: string) =>
	(payload?: any): RequestInit => ({
		method,
		headers: {
			'Content-Type': 'application/json',
			Origin: getOrigin(stage),
		},
		body: payload ? JSON.stringify(payload) : undefined,
	});

const APIFetch =
	(idapiBaseUrl: string) =>
	async <P extends ApiRoutePaths>(params: {
		path: P;
		queryParams?: IdApiQueryParams;
		options?: RequestInit;
		tokenisationParam?: ExtractRouteParams<P>;
	}): Promise<any> => {
		const tokenisedUrl = buildUrl(params.path, params.tokenisationParam);
		const urlPath = params.queryParams
			? addApiQueryParamsToPath(tokenisedUrl, params.queryParams)
			: tokenisedUrl;
		const response = await fetch(
			joinUrl(idapiBaseUrl, urlPath),
			params.options,
		);
		if (!response.ok) {
			return await handleResponseFailure(response);
		} else if (response.status === 204) {
			return null;
		} else {
			return await handleResponseSuccess(response);
		}
	};

export const APIGetOptions = getAPIOptionsForMethod('GET');
export const APIPatchOptions = getAPIOptionsForMethod('PATCH');
export const APIPostOptions = getAPIOptionsForMethod('POST');

export const APIAddClientAccessToken = (
	options: RequestInit,
	ip: string,
): RequestInit => {
	const headers = {
		...options.headers,
		'X-GU-ID-Client-Access-Token': `Bearer ${idapiClientAccessToken}`,
		'X-Forwarded-For': ip,
	};
	return {
		...options,
		headers,
	};
};

export const APIForwardSessionIdentifier = (
	options: RequestInit,
	id: string,
) => {
	const headers = {
		...options.headers,
		'X-GU-ID-FOWARDED-SC-GU-U': id,
	};
	return {
		...options,
		headers,
	};
};

export const APIAddOAuthAuthorization = (
	options: RequestInit,
	token: string,
) => {
	const headers = {
		...options.headers,
		Authorization: `Bearer ${token}`,
		'X-GU-IS-OAUTH': 'true',
	};
	return {
		...options,
		headers,
	};
};

export const APIOptionSelect = ({
	sc_gu_u,
	ip,
	accessToken,
	options,
}: {
	sc_gu_u?: string;
	ip?: string;
	accessToken?: string;
	options: RequestInit;
}): RequestInit => {
	if (accessToken) {
		return APIAddOAuthAuthorization(options, accessToken);
	}
	if (sc_gu_u && ip) {
		return APIAddClientAccessToken(
			APIForwardSessionIdentifier(options, sc_gu_u),
			ip,
		);
	}
	return options;
};

export const idapiFetch = APIFetch(idapiBaseUrl);
