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
import { RegistrationErrors } from '@/shared/model/Errors';
import { convertExpiresAtToExpiryTimeInMs } from './convertExpiresAtToExpiryTimeInMs';
import { RoutePaths } from '@/shared/model/Routes';

type HandlePasscodeErrorParams = {
	error: unknown;
	req: Request;
	res: ResponseWithRequestState;
	emailSentPage: RoutePaths;
	expiredPage: RoutePaths;
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
		if (error.name === 'api.authn.error.PASSCODE_INVALID') {
			// get the current passcode failed count
			const { passcodeFailedCount = 0 } = encryptedState || {};

			// increment the passcode failed count
			const updatedPasscodeFailedCount = passcodeFailedCount + 1;

			// if the passcode failed count is 5 or more, redirect to expired page
			if (updatedPasscodeFailedCount >= 5) {
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
								message: RegistrationErrors.PASSCODE_INVALID,
							},
						],
						token: code,
					},
				}),
				pageTitle: 'Check Your Inbox',
			});
			return res.type('html').send(html);
		}

		// case for too many passcode attempts
		if (error.name === 'oie.tooManyRequests') {
			return res.redirect(
				303,
				addQueryParamsToPath(expiredPage, state.queryParams),
			);
		}

		// case for session expired
		if (error.name === 'idx.session.expired') {
			return res.redirect(
				303,
				addQueryParamsToPath(expiredPage, state.queryParams),
			);
		}
	}
};
