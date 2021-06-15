import fetch, { RequestInit, Response } from 'node-fetch';
import { HalLink } from 'hal-types';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { OktaError } from './error';

// https://developer.okta.com/docs/reference/api/authn/#transaction-state
enum AuthenticationTransactionState {
  LOCKED_OUT = 'LOCKED_OUT',
  MFA_CHALLENGE = 'MFA_CHALLENGE',
  MFA_ENROLL_ACTIVATE = 'MFA_ENROLL_ACTIVATE',
  MFA_ENROLL = 'MFA_ENROLL',
  MFA_REQUIRED = 'MFA_REQUIRED',
  PASSWORD_EXPIRED = 'PASSWORD_EXPIRED',
  PASSWORD_RESET = 'PASSWORD_RESET',
  PASSWORD_WARN = 'PASSWORD_WARN',
  RECOVERY_CHALLENGE = 'RECOVERY_CHALLENGE',
  RECOVERY = 'RECOVERY',
  SUCCESS = 'SUCCESS',
  UNAUTHENTICATED = 'UNAUTHENTICATED',
}

// https://developer.okta.com/docs/reference/api/authn/#factor-result
enum AuthenticationFactorResult {
  CANCELLED = 'CANCELLED',
  ERROR = 'ERROR',
  PASSCODE_REPLAYED = 'PASSCODE_REPLAYED',
  TIMEOUT = 'TIMEOUT',
  TIME_WINDOW_EXCEEDED = 'TIME_WINDOW_EXCEEDED',
  WAITING = 'WAITING',
}

// https://developer.okta.com/docs/reference/api/authn/#links-object
interface AuthenticationLinks {
  next?: HalLink;
  prev?: HalLink;
  cancel?: HalLink;
  skip?: HalLink;
  resend?: HalLink;
}
// https://developer.okta.com/docs/reference/api/authn/#user-object
interface AuthenticationEmbeddedUser {
  id: string;
  passwordChanged?: string;
  profile: {
    firstName: string;
    lastName: string;
    locale?: string;
    login: string;
    timeZone?: string;
  };
  recovery_question?: {
    question: string;
  };
}

// https://developer.okta.com/docs/reference/api/authn/#authentication-transaction-object
interface AuthenticationTransaction {
  _embedded?: AuthenticationEmbeddedUser;
  _links?: AuthenticationLinks;
  expiresAt?: string;
  factorResult?: AuthenticationFactorResult;
  sessionToken?: string;
  stateToken?: string;
  status?: AuthenticationTransactionState;
}

// https://developer.okta.com/docs/reference/api/authn/#request-parameters-for-primary-authentication
interface AuthenticationRequestParameters {
  audience?: string;
  context?: {
    deviceToken?: string;
  };
  options?: {
    multiOptionalFactorEnroll?: boolean;
    warnBeforePasswordExpired?: boolean;
  };
  password?: string;
  token?: string;
  username?: string;
}

const { oktaDomain } = getConfiguration();

const API_ROUTE = '/api/v1/authn';

const handleResponseFailure = async (response: Response) => {
  try {
    const parsed = (await response.json()) as OktaError;
    throw {
      status: response.status,
      statusText: response.statusText,
      oktaError: parsed,
    };
  } catch (error) {
    throw error;
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

  try {
    const response = await fetch(`${oktaDomain}${API_ROUTE}`, requestOptions);
    if (!response.ok) {
      return await handleResponseFailure(response);
    } else {
      return await handleResponseSuccess(response);
    }
  } catch (error) {
    throw error;
  }
};
