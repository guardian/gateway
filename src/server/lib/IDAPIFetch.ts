/* eslint-disable @typescript-eslint/no-explicit-any */

import fetch, { RequestInit, Response } from 'node-fetch';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { joinUrl } from '@guardian/libs';

const { idapiBaseUrl, idapiClientAccessToken, stage, baseUri } =
  getConfiguration();

const getOrigin = (stage: string): string => {
  switch (stage) {
    case 'CODE':
    case 'PROD':
      return `https://${baseUri}`;
    default:
      return 'https://profile.thegulocal.com';
  }
};

export interface IDAPIError {
  error: any;
  status: number;
}

const handleResponseFailure = async (
  response: Response,
): Promise<IDAPIError> => {
  let err;
  const raw = await response.text();
  console.log('raw', raw);
  try {
    err = JSON.parse(raw);
  } catch (_) {
    err = raw;
  }
  throw { error: err, status: response.status };
};

const handleResponseSuccess = async (response: Response) => {
  try {
    return await response.json();
  } catch (e) {
    throw new Error(`Error decoding JSON response: ${e}`);
  }
};

const getAPIOptionsForMethod =
  (method: string) =>
  (payload?: any): RequestInit => ({
    method,
    headers: {
      'Content-Type': 'application/json',
      Origin: getOrigin(stage),
    },
    body: payload ? JSON.stringify(payload) : undefined,
  });

export const APIFetch =
  (idapiBaseUrl: string) =>
  async (path: string, options?: RequestInit): Promise<any> => {
    const response = await fetch(joinUrl(idapiBaseUrl, path), options);
    console.log('response', response);
    if (!response.ok) {
      return await handleResponseFailure(response);
    } else if (response.status === 204) {
      return null;
    } else {
      return await handleResponseSuccess(response);
    }
  };

export const APIGetOptions = getAPIOptionsForMethod('GET');
export const APIPatchOptions = getAPIOptionsForMethod('PATCH');
export const APIPostOptions = getAPIOptionsForMethod('POST');

export const APIAddClientAccessToken = (
  options: RequestInit,
  ip: string,
): RequestInit => {
  const headers = {
    ...options.headers,
    'X-GU-ID-Client-Access-Token': `Bearer ${idapiClientAccessToken}`,
    'X-Forwarded-For': ip,
  };
  return {
    ...options,
    headers,
  };
};

export const APIForwardSessionIdentifier = (
  options: RequestInit,
  id: string,
) => {
  const headers = {
    ...options.headers,
    'X-GU-ID-FOWARDED-SC-GU-U': id,
  };
  return {
    ...options,
    headers,
  };
};

export const idapiFetch = APIFetch(idapiBaseUrl);
