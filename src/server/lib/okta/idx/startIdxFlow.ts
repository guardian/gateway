import { encryptRegistrationConsents } from '@/server/lib/registrationConsents';
import {
	updateAuthorizationStateData,
	setAuthorizationStateCookie,
} from '@/server/lib/okta/openid-connect';
import { interact } from '@/server/lib/okta/idx/interact';
import {
	introspect,
	IntrospectResponse,
} from '@/server/lib/okta/idx/introspect';
import { Request } from 'express';
import { ResponseWithRequestState } from '@/server/models/Express';
import { PerformAuthorizationCodeFlowOptions } from '@/server/lib/okta/oauth';
import { RegistrationConsents } from '@/shared/model/RegistrationConsents';

type StartIdxFlowParams = {
	req: Request;
	res: ResponseWithRequestState;
	authorizationCodeFlowOptions: Pick<
		PerformAuthorizationCodeFlowOptions,
		| 'confirmationPagePath'
		| 'closeExistingSession'
		| 'doNotSetLastAccessCookie'
		| 'extraData'
	>;
	consents?: RegistrationConsents;
	request_id?: string;
};

/**
 * @name startIdxFlow
 * @description Starts the Okta Interaction Code/IDX flow, and returns the introspect response
 *
 * This is a wrapper around the `interact` and `introspect` functions, which are the first two
 * steps in the Okta IDX flow, and are used in every flow using the Okta IDX API.
 *
 * @param req - Express request
 * @param res - Express response
 * @param authorizationCodeFlowOptions - Subset of the `PerformAuthorizationCodeFlowOptions` used by our standard authorization code flow, namely the parameters needed for authentication
 * @param consents - The registration consents to encrypt and store in the authorization state if they exist
 * @param request_id - The request id
 * @returns Promise<IntrospectResponse>
 */
export const startIdxFlow = async ({
	req,
	res,
	authorizationCodeFlowOptions: {
		confirmationPagePath,
		closeExistingSession = true,
		doNotSetLastAccessCookie = false,
		extraData,
	},
	consents,
	request_id,
}: StartIdxFlowParams): Promise<IntrospectResponse> => {
	// start the interaction code flow, and get the interaction handle + authState
	const [{ interaction_handle }, authState] = await interact(req, res, {
		confirmationPagePath,
		closeExistingSession,
		doNotSetLastAccessCookie,
		extraData,
	});

	// introspect the interaction handle to get state handle
	const introspectResponse = await introspect(
		{
			interactionHandle: interaction_handle,
		},
		request_id,
		req.ip,
	);

	// Encrypt any consents we need to preserve, if consents exist, i.e through the create account flow
	const encryptedRegistrationConsents =
		consents && encryptRegistrationConsents(consents);

	// update the authState with the stateToken and encrypted consents
	const updatedAuthState = updateAuthorizationStateData(authState, {
		stateToken: introspectResponse.stateHandle.split('~')[0],
		encryptedRegistrationConsents,
	});
	setAuthorizationStateCookie(updatedAuthState, res);

	// return the introspect response, so that any implementations can use the state handle
	// and continue the flow
	return introspectResponse;
};
