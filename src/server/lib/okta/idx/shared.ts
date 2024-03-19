import { z } from 'zod';
import { logger } from '@/server/lib/serverSideLogger';
import { trackMetric } from '@/server/lib/trackMetric';
import { OAuthError } from '@/server/models/okta/Error';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { joinUrl } from '@guardian/libs';

const { okta } = getConfiguration();

const idxPaths = ['introspect', 'enroll', 'enroll/new'] as const;
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
});

export type IdxStateHandleBody<T = object> = T & {
	stateHandle: IdxBaseResponse['stateHandle'];
};

const idxErrorSchema = z.object({
	version: idxVersionSchema,
	messages: z.object({
		type: z.literal('array'),
		value: z.array(
			z.object({
				message: z.string(),
				i18n: z.object({ key: z.string() }).optional(),
			}),
		),
	}),
});

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

export const handleError = async (response: Response) => {
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
		const error = idxErrorSchema.safeParse(json);

		if (error.success) {
			throw new OAuthError(
				{
					error: error.data.messages.value[0].i18n?.key || 'idx_error',
					error_description: error.data.messages.value[0].message,
				},
				response.status,
			);
		} else {
			throw new OAuthError(
				{
					error: 'idx_error',
					error_description: JSON.stringify(json),
				},
				response.status,
			);
		}
	}

	throw new OAuthError(
		{
			error: 'idx_error',
			error_description: await response.text(),
		},
		response.status,
	);
};
