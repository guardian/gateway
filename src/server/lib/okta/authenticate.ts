import { RequestInit, Response } from 'node-fetch';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { SignInErrors } from '@/shared/model/Errors';
import { joinUrl } from '@guardian/libs';
import { OktaApiError } from '@/server/models/Error';
import { fetch } from '@/server/lib/fetch';
import {
  AuthenticationRequestParameters,
  AuthenticationTransaction,
  OktaError,
} from '@/server/models/Okta';

const { oktaDomain } = getConfiguration();

const handleResponseFailure = async (response: Response) => {
  const parsed = (await response.json()) as OktaError;
  switch (parsed.errorCode) {
    // errors from https://developer.okta.com/docs/reference/api/authn/#response-parameters
    case 'E0000004':
      throw new OktaApiError({
        status: response.status,
        statusText: response.statusText,
        message: SignInErrors.AUTHENTICATION_FAILED,
      });
    case 'E0000047':
      throw new OktaApiError({
        status: response.status,
        statusText: response.statusText,
        message: SignInErrors.GENERIC,
      });
    default:
      throw new OktaApiError({
        status: response.status,
        statusText: response.statusText,
        message: SignInErrors.GENERIC,
      });
  }
};

const handleResponseSuccess = async (
  response: Response,
): Promise<AuthenticationTransaction> => {
  try {
    return (await response.json()) as AuthenticationTransaction;
  } catch (error) {
    throw new Error(`Error decoding JSON response: ${error}`);
  }
};

// okta authentication endpoint
// gateway (profile) is set up as a public application as it is
// accessible by anyone
// https://developer.okta.com/docs/reference/api/authn/#request-example-for-primary-authentication-with-public-application
export const authenticate = async (email: string, password: string) => {
  const request: AuthenticationRequestParameters = {
    username: email,
    password,
    options: {
      multiOptionalFactorEnroll: false,
      warnBeforePasswordExpired: false,
    },
  };

  const body = JSON.stringify(request);

  const requestOptions: RequestInit = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body,
  };

  const response = await fetch(
    joinUrl(oktaDomain, '/api/v1/authn'),
    requestOptions,
  );
  if (!response.ok) {
    return await handleResponseFailure(response);
  } else {
    return await handleResponseSuccess(response);
  }
};
