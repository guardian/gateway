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

// Dynamically build frame-ancestors based on stage.
// This builds an array of urls that are appropriate for the current stage
// Filter removes any falsey values
const frameAncestors = [
	stage === 'PROD' && 'https://support.theguardian.com',
	stage === 'CODE' && 'https://support.code.dev-theguardian.com',
	stage === 'DEV' && 'support.thegulocal.com',
].filter((element) => !!element) as string[];

const scriptSrc = [
	`${baseUri}`,
	CSP_VALID_URI.GOOGLE_RECAPTCHA,
	CSP_VALID_URI.GSTATIC_RECAPTCHA,
	CSP_VALID_URI.GUARDIAN_ASSETS,
];

if (stage === 'DEV') {
	// eslint-disable-next-line functional/immutable-data -- used only in dev
	scriptSrc.push(HELMET_OPTIONS.UNSAFE_EVAL);
}

const helmetConfig: HelmetOptions = {
	contentSecurityPolicy: {
		directives: {
			baseUri: [HELMET_OPTIONS.NONE],
			defaultSrc: [HELMET_OPTIONS.NONE],
			frameAncestors,
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
				HELMET_OPTIONS.SELF,
				`${CSP_VALID_URI.GUARDIAN_CONSENTS_LOGS}${apiDomain}`,
				CSP_VALID_URI.GUARDIAN_API,
				CSP_VALID_URI.HAVEIBEENPWNED,
				idapiOrigin,
				CSP_VALID_URI.GOOGLE_RECAPTCHA,
				// CSP_VALID_URI.OPHAN,
			],
			frameSrc: [CSP_VALID_URI.GOOGLE_RECAPTCHA],
			formAction: null,
		},
	},
	crossOriginEmbedderPolicy: false,
};

export const helmetMiddleware = helmet(helmetConfig);
