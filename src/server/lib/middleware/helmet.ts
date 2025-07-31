import helmet, { HelmetOptions } from 'helmet';
import { getConfiguration } from '@/server/lib/getConfiguration';

const { baseUri, apiDomain, idapiBaseUrl, stage } = getConfiguration();

const HELMET_OPTIONS = {
	SELF: "'self'",
	NONE: "'none'",
	UNSAFE_INLINE: "'unsafe-inline'",
	UNSAFE_EVAL: "'unsafe-eval'", // !!! ONLY USE FOR DEV !!!
} as const;

const CSP_VALID_URI = {
	GSTATIC_RECAPTCHA: 'www.gstatic.com',
	GOOGLE_RECAPTCHA: 'www.google.com',
	GUARDIAN_STATIC: 'static.guim.co.uk',
	GUARDIAN_ASSETS: 'assets.guim.co.uk',
	GUARDIAN_API: 'api.nextgen.guardianapps.co.uk',
	OPHAN: 'ophan.theguardian.com',
	GUARDIAN_CONSENTS_LOGS: 'consent-logs.',
	HAVEIBEENPWNED: 'https://api.pwnedpasswords.com',
} as const;

const idapiOrigin = idapiBaseUrl.replace(/https?:\/\/|\/identity-api/g, '');

// Function to get allowed frame ancestors based on configuration
const getAllowedFrameAncestors = (): string[] => {
	// In production, you would read this from environment variables or configuration
	const allowedDomains = process.env.ALLOWED_IFRAME_DOMAINS?.split(',') || [];

	// For development, allow localhost
	const developmentDomains =
		stage === 'DEV' ? ['http://localhost:*', 'https://localhost:*'] : [];

	const allDomains = [...allowedDomains, ...developmentDomains];

	// If no domains are configured, block all iframes
	return allDomains.length > 0 ? allDomains : [HELMET_OPTIONS.NONE];
};

const scriptSrc = [
	HELMET_OPTIONS.SELF,
	`${baseUri}`,
	CSP_VALID_URI.GOOGLE_RECAPTCHA,
	CSP_VALID_URI.GSTATIC_RECAPTCHA,
	CSP_VALID_URI.GUARDIAN_ASSETS,
];

if (stage === 'DEV') {
	// eslint-disable-next-line functional/immutable-data -- used only in dev
	scriptSrc.push(HELMET_OPTIONS.UNSAFE_EVAL);
	// eslint-disable-next-line functional/immutable-data -- used only in dev for iframe test functionality
	scriptSrc.push(HELMET_OPTIONS.UNSAFE_INLINE);
}

const helmetConfig: HelmetOptions = {
	contentSecurityPolicy: {
		directives: {
			baseUri: [HELMET_OPTIONS.NONE],
			defaultSrc: [HELMET_OPTIONS.NONE],
			frameAncestors: getAllowedFrameAncestors(),
			styleSrc: [HELMET_OPTIONS.UNSAFE_INLINE],
			scriptSrc,
			imgSrc: [
				`${baseUri}`,
				CSP_VALID_URI.GUARDIAN_STATIC,
				CSP_VALID_URI.OPHAN,
				CSP_VALID_URI.GOOGLE_RECAPTCHA,
			],
			fontSrc: [CSP_VALID_URI.GUARDIAN_ASSETS],
			connectSrc: [
				`${CSP_VALID_URI.GUARDIAN_CONSENTS_LOGS}${apiDomain}`,
				CSP_VALID_URI.GUARDIAN_API,
				CSP_VALID_URI.HAVEIBEENPWNED,
				idapiOrigin,
				CSP_VALID_URI.GOOGLE_RECAPTCHA,
				...getAllowedFrameAncestors(),
			],
			frameSrc: [
				CSP_VALID_URI.GOOGLE_RECAPTCHA,
				...(stage === 'DEV' ? [HELMET_OPTIONS.SELF] : []),
			],
			formAction: null,
		},
	},
	crossOriginEmbedderPolicy: false,
};

export const helmetMiddleware = helmet(helmetConfig);
