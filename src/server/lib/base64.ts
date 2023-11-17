// Based on RFC 4648 (https://datatracker.ietf.org/doc/html/rfc4648#section-5)
// + -> -
// / -> _
// = -> %3D
export const base64ToUrlSafeString = (base64: string) =>
	base64.replace(/\+/g, '-').replace(/\//g, '_');

export const urlSafeStringToBase64 = (urlSafeString: string) =>
	urlSafeString.replace(/-/g, '+').replace(/_/g, '/');
