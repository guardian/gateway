/**
 * @name convertExpiresAtToExpiryTimeInMs
 * @description Convert the expiresAt string from the IDX API response to a number representing the time until expiry in ms
 * @param expiresAt - The expiresAt string from the IDX API response
 * @returns	number | undefined - The time until expiry in ms, or undefined if expiresAt is not provided
 */
export const convertExpiresAtToExpiryTimeInMs = (
	expiresAt?: string,
): number | undefined => {
	return expiresAt ? new Date(expiresAt).getTime() - Date.now() : undefined;
};
