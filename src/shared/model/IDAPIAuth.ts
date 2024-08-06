interface IdapiCookie {
	key: string;
	value: string;
	sessionCookie?: boolean;
}

export interface IdapiCookies {
	values: IdapiCookie[];
	expiresAt: string;
}
