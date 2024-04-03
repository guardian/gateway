import { z } from 'zod';
import { logger } from '@/server/lib/serverSideLogger';
import { trackMetric } from '@/server/lib/trackMetric';
import { OAuthError } from '@/server/models/okta/Error';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { joinUrl } from '@guardian/libs';
import { ResponseWithRequestState } from '@/server/models/Express';

const { okta } = getConfiguration();

// Okta IDX API paths
const idxPaths = [
	'challenge/answer',
	'challenge/resend',
	'credential/enroll',
	'enroll',
	'enroll/new',
	'introspect',
] as const;
export type IDXPath = (typeof idxPaths)[number];

// Schema to check the version of the IDX API, and warn if it's not 1.0.0
const idxVersionSchema = z.string().refine((val) => {
	// warn if the version is not 1.0.0
	if (val !== '1.0.0') {
		logger.warn('Okta IDX - unexpected version:', val);
		trackMetric('OktaIDX::UnexpectedVersion');
	}

	// but pass validation regardless
	return true;
});

// Base schema for the IDX API response, everything should inherit from this (using .merge)
export const idxBaseResponseSchema = z.object({
	version: idxVersionSchema,
	stateHandle: z.string(),
	expiresAt: z.string(),
});
export type IdxBaseResponse = z.infer<typeof idxBaseResponseSchema>;

// Base schema for the remediation object in the IDX API response
// Used in cases where the Okta IDX API during the authentication process
export const baseRemediationValueSchema = z.object({
	name: z.string(),
	type: z.string().optional(),
	href: z.string().url().optional(),
	method: z.string().optional(),
	value: z.unknown().optional(),
});

// Base type for the body of a request to the IDX API
// Which should include the stateHandle, and any other data needed using the generic type
export type IdxStateHandleBody<T = object> = T & {
	stateHandle: IdxBaseResponse['stateHandle'];
};

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
type CompleteLoginResponse = z.infer<typeof completeLoginResponseSchema>;

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
	expressRes: ResponseWithRequestState;
	request_id?: string;
};
// type for the idx cookie which is string, but named for clarity
type IdxCookie = string;

/**
 * @name idxFetchBase
 * @description Base function for fetching data from the Okta IDX API, should not be used directly
 *
 * @param path - The path to the IDX API endpoint
 * @param body - The body of the request
 * @returns Promise<[Response, IdxCookie | undefined]> - The response from the IDX API, and the IDX cookie if it exists
 */
const idxFetchBase = async ({
	path,
	body,
}: Pick<IDXFetchParams<unknown, unknown>, 'path' | 'body'>): Promise<
	[Response, IdxCookie | undefined]
> => {
	const response = await fetch(joinUrl(okta.orgUrl, `/idp/idx/${path}`), {
		method: 'POST',
		headers: {
			Accept: 'application/ion+json; okta-version=1.0.0',
			'Content-Type': 'application/ion+json; okta-version=1.0.0',
		},
		body: JSON.stringify(body),
	});

	const cookies = response.headers.getSetCookie();

	const idxCookie = cookies.find((cookie) => cookie.startsWith('idx='));

	return [response, idxCookie];
};

/**
 * @name idxFetch
 * @description Fetch data from the Okta IDX API, used during the authentication process (remediation), make sure to pass the correct schema, ResponseType, and BodyType to have the response validated and typed correctly
 *
 * @param path - The path to the IDX API endpoint
 * @param body - The body of the request
 * @param schema - The zod schema to validate the response
 * @param request_id - The request id
 * @returns Promise<ResponseType> - The response from the IDX API
 */
export const idxFetch = async <ResponseType, BodyType>({
	path,
	body,
	schema,
	request_id,
}: Omit<
	IDXFetchParams<ResponseType, BodyType>,
	'expressRes'
>): Promise<ResponseType> => {
	try {
		const [response] = await idxFetchBase({ path, body });

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
 * @name idxFetchCompletion
 * @description Fetch data from the Okta IDX API, used when the authentication process is completed. This returns the IDX cookie, which we set on the response object, and we return the CompleteLoginResponse, along with the redirect URL which the user should be sent to in order to complete the login process.
 *
 * @param path - The path to the IDX API endpoint
 * @param body - The body of the request
 * @param expressRes - The express response object
 * @param request_id - The request id
 * @returns Promise<[CompleteLoginResponse, Redirect String]>
 */
export const idxFetchCompletion = async <BodyType>({
	path,
	body,
	expressRes,
	request_id,
}: Omit<IDXFetchParams<never, BodyType>, 'schema'>): Promise<
	[CompleteLoginResponse, string]
> => {
	try {
		const [response, idxCookie] = await idxFetchBase({ path, body });

		if (!response.ok) {
			await handleError(response);
		}

		if (!idxCookie) {
			throw new OAuthError(
				{
					error: 'idx_error',
					error_description: 'No IDX cookie returned',
				},
				403,
			);
		}

		const completeLoginResponse = completeLoginResponseSchema.safeParse(
			await response.json(),
		);

		if (!completeLoginResponse.success) {
			throw new OAuthError(
				{
					error: 'idx_error',
					error_description: 'Schema does not match response',
				},
				400,
			);
		}

		trackMetric(`OktaIDX::${path}::Success`);

		expressRes.cookie('idx', idxCookie.replace('idx=', ''), {
			httpOnly: true,
			secure: true,
			sameSite: 'none',
		});

		return [
			completeLoginResponse.data,
			`/login/token/redirect?stateToken=${completeLoginResponse.data.stateHandle.split('~')[0]}`,
		];
	} catch (error) {
		trackMetric(`OktaIDX::${path}::Failure`);
		logger.error(`Okta IDX ${path}`, error, {
			request_id,
		});
		throw error;
	}
};

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
