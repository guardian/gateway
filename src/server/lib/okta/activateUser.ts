import { fetch } from '@/server/lib/fetch';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { joinUrl } from '@guardian/libs';
import { Okta } from '@/shared/model/Routes';
import { ActivationRequest, ActivationResponse } from '@/server/models/Okta';
import { Response } from 'node-fetch';
import { handleOktaErrors } from '@/server/lib/okta/errors';
import { defaultHeaders } from '@/server/lib/okta/client';

const { orgUrl } = getConfiguration().okta;

export const validateOktaActivationToken = (
  request: ActivationRequest,
): Promise<ActivationResponse> => {
  return exchangeActivationTokenForStateToken(request)
    .then(handleOktaErrors)
    .then(extractActivationResponse);
};

const exchangeActivationTokenForStateToken = async (
  body: ActivationRequest,
): Promise<Response> => {
  return await fetch(joinUrl(orgUrl, Okta.AUTH), {
    method: 'POST',
    body: JSON.stringify(body),
    headers: defaultHeaders,
  });
};

const extractActivationResponse = async (
  response: Response,
): Promise<ActivationResponse> => {
  return await response.json().then((json) => json as ActivationResponse);
};
