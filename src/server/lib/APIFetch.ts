/* eslint-disable @typescript-eslint/no-explicit-any */

import fetch, { RequestInit, Response } from 'node-fetch';
import { getConfiguration } from '@/server/lib/configuration';

const { idapiBaseUrl, idapiClientAccessToken } = getConfiguration();

const handleResponseFailure = async (response: Response) => {
  let err;
  const raw = await response.text();
  try {
    err = JSON.parse(raw);
  } catch (_) {
    err = raw;
  }
  throw err;
};

const handleResponseSuccess = async (response: Response) => {
  try {
    return await response.json();
  } catch (e) {
    throw new Error(`Error decoding JSON response: ${e}`);
  }
};

const getAPIOptionsForMethod = (method: string) => (
  payload?: any,
): RequestInit => ({
  method,
  headers: {
    'Content-Type': 'application/json',
  },
  body: payload ? JSON.stringify(payload) : undefined,
});

export const APIFetch = (baseUrl: string) => async (
  url: string,
  options?: RequestInit,
): Promise<any> => {
  const response = await fetch(baseUrl + url, options);
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
