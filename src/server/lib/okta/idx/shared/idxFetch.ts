import { z } from 'zod';
import { joinUrl } from '@guardian/libs';
import { logger } from '@/client/lib/clientSideLogger';
import { trackMetric } from '@/server/lib/trackMetric';
import { OAuthError } from '@/server/models/okta/Error';
import { getConfiguration } from '@/server/lib/getConfiguration';
import {
	IdxBaseResponse,
	idxBaseResponseSchema,
} from '@/server/lib/okta/idx/shared/schemas';
import { IDXPath } from '@/server/lib/okta/idx/shared/paths';

const { okta } = getConfiguration();

// Schema for when the authentication process is completed, and we return a base user object
export const completeLoginResponseSchema = idxBaseResponseSchema.merge(
	z.object({
		user: z.object({
			type: z.literal('object'),
			value: z.object({
				id: z.string(),
				identifier: z.string().email(),
				profile: z.object({
					firstName: z.string().nullable().optional(),
					lastName: z.string().nullable().optional(),
				}),
			}),
		}),
	}),
);
export type CompleteLoginResponse = z.infer<typeof completeLoginResponseSchema>;

// Schema for the error object in the IDX API response
const idxErrorObjectSchema = z.object({
	type: z.literal('array'),
	value: z.array(
		z.object({
			message: z.string(),
			i18n: z.object({ key: z.string() }).optional(),
			class: z.literal('ERROR'),
		}),
	),
});
type IdxErrorObject = z.infer<typeof idxErrorObjectSchema>;

// Type for the fetch parameters for the IDX API
type IDXFetchParams<ResponseType, BodyType> = {
	path: IDXPath;
	body: BodyType;
	schema: z.Schema<ResponseType>;
	request_id?: string;
	ip?: string;
};

/**
 * @name idxFetchBase
 * @description Base function for fetching data from the Okta IDX API, should not be used directly
 *
 * @param path - The path to the IDX API endpoint
 * @param body - The body of the request
 * @param ip - The IP address of the user
 * @returns Promise<Response> - The response from the IDX API
 */
const idxFetchBase = async ({
	path,
	body,
	ip,
}: Pick<
	IDXFetchParams<unknown, unknown>,
	'path' | 'body' | 'ip'
>): Promise<Response> => {
	const headers = {
		Accept: 'application/ion+json; okta-version=1.0.0',
		'Content-Type': 'application/ion+json; okta-version=1.0.0',
	};

	const response = await fetch(joinUrl(okta.orgUrl, `/idp/idx/${path}`), {
		method: 'POST',
		headers: ip ? { ...headers, 'X-Forwarded-For': ip } : headers,
		body: JSON.stringify(body),
	});

	return response;
};

/**
 * @name idxFetch
 * @description Fetch data from the Okta IDX API, used during the authentication process (remediation), make sure to pass the correct schema, ResponseType, and BodyType to have the response validated and typed correctly
 *
 * @param path - The path to the IDX API endpoint
 * @param body - The body of the request
 * @param schema - The zod schema to validate the response
 * @param request_id - The request id
 * @param ip - The IP address of the user
 * @returns Promise<ResponseType> - The response from the IDX API
 */
export const idxFetch = async <ResponseType, BodyType>({
	path,
	body,
	schema,
	request_id,
	ip,
}: IDXFetchParams<ResponseType, BodyType>): Promise<ResponseType> => {
	try {
		const response = await idxFetchBase({ path, body, ip });

		if (!response.ok) {
			await handleError(response);
		}

		const parsed = schema.parse(await response.json());

		trackMetric(`OktaIDX::${path}::Success`);

		return parsed;
	} catch (error) {
		trackMetric(`OktaIDX::${path}::Failure`);
		logger.error(`Okta IDX ${path}`, error, {
			request_id,
		});
		throw error;
	}
};

/**
 * @name getLoginRedirectUrl
 * @description Get the URL to redirect the user to after they have completed the IDX authentication process
 *
 * @param response - The latest response from the IDX API
 * @returns string - The URL to redirect the user to
 */
export const getLoginRedirectUrl = <R extends IdxBaseResponse>(response: R) =>
	`/login/token/redirect?stateToken=${response.stateHandle.split('~')[0]}`;

/**
 * @name findErrorMessage
 * @description Recursively search for the error message in the IDX API response
 *
 * Okta IDX API puts the error message in a nested object, so we need to recursively search for it.
 * The key is 'messages' and the value has a specific schema.
 * If the schema doesn't match, we'll just return the whole object as a string.
 * @param obj - The object to search for the error message
 * @returns IdxErrorObject | string | undefined - The error message object, or the whole object as a string, or undefined if no error message is found
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- This function is designed to handle any object
const findErrorMessage = (obj: any): IdxErrorObject | string | undefined => {
	function findErrorMessageRecursive(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any -- This function is designed to handle any object
		obj: any,
	): IdxErrorObject | string | undefined {
		// Check if obj is an object
		if (typeof obj === 'object' && obj !== null) {
			// If obj is an array
			if (Array.isArray(obj)) {
				// Iterate through each element of the array
				for (const item of obj) {
					// Recursively search each element
					const result = findErrorMessageRecursive(item);
					// If key is found, return the value
					if (result !== undefined) {
						return result;
					}
				}
			} else {
				// Iterate through each key-value pair in the object
				for (const prop in obj) {
					if (Object.prototype.hasOwnProperty.call(obj, prop)) {
						// If key is found, return the value
						if (prop === 'messages') {
							const parsed = idxErrorObjectSchema.safeParse(obj[prop]);

							if (parsed.success) {
								return parsed.data;
							} else {
								return JSON.stringify(obj[prop]);
							}
						}
						// Recursively search the value
						const result = findErrorMessageRecursive(obj[prop]);
						// If key is found in the nested object, return the value
						if (result !== undefined) {
							return result;
						}
					}
				}
			}
		}

		// Key not found, return undefined
		return undefined;
	}

	const result = findErrorMessageRecursive(obj);

	if (!result) {
		logger.warn('Error message not found in IDX response:', obj);

		return JSON.stringify(obj);
	}

	return result;
};

/**
 * @name handleError
 * @description Handle errors from the IDX API response, and throw them as OAuthError objects. This function should be used in a try/catch block when calling the IDX API, and the consumer can catch and handle specific messages if they need to.
 * @param response
 */
const handleError = async (response: Response) => {
	// Check if the body is likely json using the content-type header
	const contentType = response.headers.get('content-type');
	if (
		contentType &&
		(contentType.includes('application/json') ||
			contentType.includes('application/ion+json'))
	) {
		// if so, parse the body as json and see if it matches the schema
		const json = await response.json().catch((e) => {
			throw new OAuthError(
				{
					error: 'invalid_json',
					error_description: e.message,
				},
				response.status,
			);
		});

		// find the error message in the json
		const error = findErrorMessage(json);

		// if we found an error message
		if (error) {
			// check if it's unparsed (string)
			if (typeof error === 'string') {
				throw new OAuthError(
					{
						error: 'idx_error',
						error_description: error,
					},
					response.status,
				);
			} else {
				// or if it's parsed (object)
				// most errors should be this case and have an i18n key and message
				throw new OAuthError(
					{
						error: error.value[0].i18n?.key || 'idx_error',
						error_description: error.value[0].message,
					},
					response.status,
				);
			}
		} else {
			// or if we didn't find an error message, just throw the whole json
			throw new OAuthError(
				{
					error: 'idx_error',
					error_description: JSON.stringify(json),
				},
				response.status,
			);
		}
	}

	// or if the body is not json, just throw the whole body as a string
	throw new OAuthError(
		{
			error: 'idx_error',
			error_description: await response.text(),
		},
		response.status,
	);
};
