import { Request } from 'express';
import {
	readEncryptedStateCookie,
	updateEncryptedStateCookie,
} from '@/server/lib/encryptedStateCookie';
import { renderer } from '@/server/lib/renderer';
import { mergeRequestState } from '@/server/lib/requestState';
import { ResponseWithRequestState } from '@/server/models/Express';
import { OAuthError } from '@/server/models/okta/Error';
import { addQueryParamsToPath } from '@/shared/lib/queryParams';
import { PasscodeErrors } from '@/shared/model/Errors';
import { convertExpiresAtToExpiryTimeInMs } from './convertExpiresAtToExpiryTimeInMs';
import { RoutePaths } from '@/shared/model/Routes';

export type HandlePasscodeErrorParams = {
	error: unknown;
	req: Request;
	res: ResponseWithRequestState;
	emailSentPage: RoutePaths;
	expiredPage: Extract<
		RoutePaths,
		| '/register/code/expired'
		| '/reset-password/code/expired'
		| '/signin/code/expired'
	>;
};

/**
 * @name clearIdxStateInEncrytpedStateCookie
 * @description Clear the IDX state in the encrypted state cookie on a redirect to the expired page to reset the state
 * @param {Request} req - The express request object
 * @param {ResponseWithRequestState} res - The express response object
 */
const clearIdxStateInEncryptedStateCookie = (
	req: Request,
	res: ResponseWithRequestState,
) => {
	updateEncryptedStateCookie(req, res, {
		passcodeUsed: undefined,
		stateHandle: undefined,
		stateHandleExpiresAt: undefined,
		userState: undefined,
		passcodeFailedCount: undefined,
	});
};

/**
 * @name handlePasscodeError
 * @description Handles errors from the IDX API when the user is entering a passcode.
 *
 * Note: Use res.headersSent to check if headers have been sent after calling this function
 * to avoid errors if we redirect within this function.
 *
 * @param error - The error object from the IDX API
 * @param req - The Express request object
 * @param res - The Express response object
 * @param emailSentPage - The path to the email sent page
 * @param expiredPage - The path to the expired page
 * @returns void - The function does not return anything, or it redirects the user
 */
export const handlePasscodeError = ({
	error,
	req,
	res,
	emailSentPage,
	expiredPage,
}: HandlePasscodeErrorParams) => {
	const state = res.locals;
	const { code } = req.body;
	const encryptedState = readEncryptedStateCookie(req);

	if (error instanceof OAuthError) {
		// in all cases where the passcode is invalid, we want to increment the passcode failed count
		// regardless of the error message we receive from the IDX API
		// this is because we want to prevent replay attacks, so in all cases we want to increment the count
		// up to a maximum of 5 attempts
		if (
			[
				'api.authn.error.PASSCODE_INVALID',
				'oie.tooManyRequests',
				'idx.session.expired',
			].includes(error.name)
		) {
			// get the current passcode failed count
			const { passcodeFailedCount = 0 } = encryptedState || {};

			// increment the passcode failed count
			const updatedPasscodeFailedCount = passcodeFailedCount + 1;

			// if the passcode failed count is 5 or more, redirect to expired page
			if (updatedPasscodeFailedCount >= 5) {
				clearIdxStateInEncryptedStateCookie(req, res);
				return res.redirect(
					303,
					addQueryParamsToPath(expiredPage, state.queryParams),
				);
			}

			// otherwise, update the passcode failed count
			updateEncryptedStateCookie(req, res, {
				passcodeFailedCount: updatedPasscodeFailedCount,
			});

			// and render the email sent page with incorrect passcode error
			const html = renderer(emailSentPage, {
				requestState: mergeRequestState(state, {
					queryParams: {
						...state.queryParams,
						emailSentSuccess: false,
					},
					pageData: {
						email: encryptedState?.email,
						timeUntilTokenExpiry: convertExpiresAtToExpiryTimeInMs(
							encryptedState?.stateHandleExpiresAt,
						),
						fieldErrors: [
							{
								field: 'code',
								message: PasscodeErrors.PASSCODE_INVALID,
							},
						],
						token: code,
					},
				}),
				pageTitle: 'Check Your Inbox',
			});
			return res.type('html').send(html);
		}
	}
};
