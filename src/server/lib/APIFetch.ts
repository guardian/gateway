import fetch, { RequestInit, Response } from 'node-fetch';

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
