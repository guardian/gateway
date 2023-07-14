import { NextFunction, Request, Response } from 'express';
import { CaptchaErrors } from '@/shared/model/Errors';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { logger } from '@/server/lib/serverSideLogger';
import { trackMetric } from '@/server/lib/trackMetric';
import { HttpError } from '@/server/models/Error';

const {
	googleRecaptcha: { secretKey },
} = getConfiguration();

const recaptchaError = new HttpError({
	message: CaptchaErrors.GENERIC,
	status: 400,
	name: 'RecaptchaError',
	code: 'EBADRECAPTCHA',
});

type RecaptchaErrorCode =
	| 'missing-input-secret'
	| 'invalid-input-secret'
	| 'missing-input-response'
	| 'invalid-input-response'
	| 'bad-request'
	| 'timeout-or-duplicate';

interface RecaptchaAPIResponse {
	success: boolean;
	challenge_ts: string;
	hostname: string;
	'error-codes'?: RecaptchaErrorCode[];
}

/**
 * Takes the reCAPTCHA token from the client and sends it to the Google reCAPTCHA API to verify it.
 * If the token is valid, the request will be allowed to continue; if not, an error will be thrown.
 * Documentation: https://developers.google.com/recaptcha/docs/verify
 * @param req Express request object
 * @param _ Express response object (not used)
 * @param next Express next function
 * @returns Throws an error if the reCAPTCHA check has failed; otherwise, calls the next function
 */
const handleRecaptcha = async (
	req: Request,
	_: Response,
	next: NextFunction,
): Promise<void> => {
	const recaptchaToken = req.body['g-recaptcha-response'];
	// If the recaptcha response is missing entirely, throw an error which will be shown to the user.
	if (!recaptchaToken) {
		return next(recaptchaError);
	}

	try {
		const recaptchaResponse = await fetch(
			'https://www.google.com/recaptcha/api/siteverify',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: `secret=${secretKey}&response=${recaptchaToken}`,
			},
		);
		const recaptchaResponseJson =
			(await recaptchaResponse.json()) as RecaptchaAPIResponse;
		if (!recaptchaResponseJson.success) {
			const formattedErrorCodes = recaptchaResponseJson['error-codes']?.length
				? recaptchaResponseJson['error-codes']?.join(', ')
				: 'unknown';
			logger.error(
				'Problem verifying reCAPTCHA, error response',
				formattedErrorCodes,
				{
					request_id: req.get('x-request-id'),
				},
			);
			return next(recaptchaError);
		}

		trackMetric('RecaptchaMiddleware::Success');
		next();
	} catch (error) {
		logger.error('Error verifying reCAPTCHA token', error, {
			request_id: req.get('x-request-id'),
		});
		return next(recaptchaError);
	}
};

/**
 * Protects a route with recaptcha.
 */
export default handleRecaptcha;
