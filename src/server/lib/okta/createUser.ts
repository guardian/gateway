import { fetch } from '@/server/lib/fetch';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { joinUrl } from '@guardian/libs';
import { Okta } from '@/shared/model/Routes';
import { CreateUserRequest, User } from '@/server/models/Okta';
import { Response } from 'node-fetch';
import { handleOktaErrors } from '@/server/lib/okta/errors';
import { authorizationHeader, defaultHeaders } from '@/server/lib/okta/headers';

export const createUserInOkta = (request: CreateUserRequest): Promise<User> => {
  return createUser(request).then(handleOktaErrors).then(extractUserResponse);
};

const createUser = async (body: CreateUserRequest): Promise<Response> => {
  const { orgUrl } = getConfiguration().okta;
  return await fetch(joinUrl(orgUrl, Okta.USERS), {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { ...defaultHeaders, ...authorizationHeader() },
  });
};

const extractUserResponse = async (response: Response): Promise<User> => {
  return await response.json().then((json) => json as User);
};
