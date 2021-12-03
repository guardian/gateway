import { fetch } from '@/server/lib/fetch';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { joinUrl } from '@guardian/libs';
import { Okta } from '@/shared/model/Routes';
import { SetPasswordRequest, SetPasswordResponse } from '@/server/models/Okta';
import { Response } from 'node-fetch';
import { handleOktaErrors } from '@/server/lib/okta/errors';
import { defaultHeaders } from '@/server/lib/okta/client';

const { orgUrl } = getConfiguration().okta;

export const setPasswordInOkta = (
  request: SetPasswordRequest,
): Promise<SetPasswordResponse> => {
  return setPasswordWithStateToken(request)
    .then(handleOktaErrors)
    .then(extractSetPasswordResponse);
};

const setPasswordWithStateToken = async (
  body: SetPasswordRequest,
): Promise<Response> => {
  return await fetch(joinUrl(orgUrl, Okta.RESET_PASSWORD), {
    method: 'POST',
    body: JSON.stringify(body),
    headers: defaultHeaders,
  });
};

const extractSetPasswordResponse = async (
  response: Response,
): Promise<SetPasswordResponse> => {
  return await response.json().then((json) => json as SetPasswordResponse);
};
