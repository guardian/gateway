/* eslint-disable @typescript-eslint/no-explicit-any */

import type { RequestInit, Response } from 'node-fetch';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { joinUrl } from '@guardian/libs';

// Imports the node-fetch library asynchonously using import(), supported in CJS since node v12.17.
// This solution avoids the import() being transpiled into a require() by Webpack/Typescript.
// Subsequent fetch requests will not re-import the module because it's cached after first load.
// Change necessary because of switch to ESM in version 3.x and our use of CJS.
// Solution taken from: https://github.com/node-fetch/node-fetch/issues/1279#issuecomment-915063354
const _importDynamic = new Function('modulePath', 'return import(modulePath)');
async function fetch(...args: (string | RequestInit | undefined)[]) {
  const { default: fetch } = await _importDynamic('node-fetch');
  return fetch(...args);
}

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
