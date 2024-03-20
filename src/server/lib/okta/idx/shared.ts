import { z } from 'zod';
import { logger } from '@/server/lib/serverSideLogger';
import { trackMetric } from '@/server/lib/trackMetric';
import { OAuthError } from '@/server/models/okta/Error';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { joinUrl } from '@guardian/libs';

const { okta } = getConfiguration();

const idxPaths = [
	'challenge/answer',
	'enroll',
	'enroll/new',
	'introspect',
] as const;
export type IDXPath = (typeof idxPaths)[number];

const idxVersionSchema = z.string().refine((val) => {
	// warn if the version is not 1.0.0
	if (val !== '1.0.0') {
		logger.warn('Okta IDX - unexpected version:', val);
		trackMetric('OktaIDX::UnexpectedVersion');
	}

	// but pass validation regardless
	return true;
});

export const idxBaseResponseSchema = z.object({
	version: idxVersionSchema,
	stateHandle: z.string(),
	expiresAt: z.coerce.date(),
});
export type IdxBaseResponse = z.infer<typeof idxBaseResponseSchema>;

export const baseRemediationValueSchema = z.object({
	name: z.string(),
	type: z.string().optional(),
	href: z.string().optional(),
	method: z.string().optional(),
	value: z.unknown().optional(),
});

export type IdxStateHandleBody<T = object> = T & {
	stateHandle: IdxBaseResponse['stateHandle'];
};

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

export const idxFetch = async <ResponseType, BodyType>({
	path,
	body,
	schema,
	request_id,
}: {
	path: IDXPath;
	body: BodyType;
	schema: z.Schema<ResponseType>;
	request_id?: string;
}): Promise<ResponseType> => {
	try {
		const response = await fetch(joinUrl(okta.orgUrl, `/idp/idx/${path}`), {
			method: 'POST',
			headers: {
				Accept: 'application/ion+json; okta-version=1.0.0',
				'Content-Type': 'application/ion+json; okta-version=1.0.0',
			},
			body: JSON.stringify(body),
		});

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

// Okta IDX API puts the error message in a nested object, so we need to recursively search for it
// the key is 'messages' and the value has a specific schema
// if the schema doesn't match, we'll just return the whole object as a string
const findErrorMessage = (obj: object): IdxErrorObject | string | undefined => {
	const findErrorRecursive = (
		obj: object,
	): IdxErrorObject | string | undefined => {
		for (const [key, value] of Object.entries(obj)) {
			if (key === 'messages') {
				const parsed = idxErrorObjectSchema.safeParse(value);

				if (parsed.success) {
					return parsed.data;
				} else {
					return JSON.stringify(value);
				}
			}
			if (typeof value === 'object') {
				return findErrorRecursive(value);
			}
		}
	};

	return findErrorRecursive(obj);
};

// handle any errors from the IDX API
// these will be thrown as OAuthError objects
// the consumer can catch and handle specific messages if they need to
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

		// if we found and error message
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
				// or it it's parsed (object)
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
