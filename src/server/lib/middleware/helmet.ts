import { default as helmet } from 'helmet';
import { getConfiguration } from '@/server/lib/getConfiguration';

const { baseUri, gaUID, apiDomain, idapiBaseUrl, stage } = getConfiguration();

enum HELMET_OPTIONS {
  SELF = "'self'",
  NONE = "'none'",
  UNSAFE_INLINE = "'unsafe-inline'",
  UNSAFE_EVAL = "'unsafe-eval'", // !!! ONLY USE FOR DEV !!!
}

enum CSP_VALID_URI {
  GSTATIC_RECAPTCHA = 'www.gstatic.com',
  GOOGLE_RECAPTCHA = 'www.google.com',
  GOOGLE_ANALYTICS = 'www.google-analytics.com',
  GUARDIAN_STATIC = 'static.guim.co.uk',
  GUARDIAN_ASSETS = 'assets.guim.co.uk',
  GUARDIAN_API = 'api.nextgen.guardianapps.co.uk',
  OPHAN = 'ophan.theguardian.com',
  VENDORLIST_CMP = 'vendorlist.consensu.org',
  GUARDIAN_CONSENTS_LOGS = 'consent-logs.',
  CMP = `sourcepoint.theguardian.com gdpr-tcfv2.sp-prod.net ccpa.sp-prod.net ccpa-service.sp-prod.net ccpa-notice.sp-prod.net cdn.privacy-mgmt.com`,
  HAVEIBEENPWNED = 'https://api.pwnedpasswords.com',
}

const idapiOrigin = idapiBaseUrl.replace(/https?:\/\/|\/identity-api/g, '');

const scriptSrc = [
  `${baseUri}`,
  gaUID.hash, // google analytics id
  CSP_VALID_URI.GOOGLE_ANALYTICS,
  CSP_VALID_URI.CMP,
  CSP_VALID_URI.GOOGLE_RECAPTCHA,
  CSP_VALID_URI.GSTATIC_RECAPTCHA,
];
if (stage === 'DEV') scriptSrc.push(HELMET_OPTIONS.UNSAFE_EVAL);

const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      baseUri: [HELMET_OPTIONS.NONE],
      defaultSrc: [HELMET_OPTIONS.NONE],
      frameAncestors: [HELMET_OPTIONS.NONE],
      styleSrc: [HELMET_OPTIONS.UNSAFE_INLINE],
      scriptSrc,
      imgSrc: [
        `${baseUri}`,
        CSP_VALID_URI.GUARDIAN_STATIC,
        CSP_VALID_URI.OPHAN,
        CSP_VALID_URI.GOOGLE_ANALYTICS,
        CSP_VALID_URI.GOOGLE_RECAPTCHA,
      ],
      fontSrc: [CSP_VALID_URI.GUARDIAN_ASSETS],
      connectSrc: [
        CSP_VALID_URI.GOOGLE_ANALYTICS,
        CSP_VALID_URI.VENDORLIST_CMP,
        `${CSP_VALID_URI.GUARDIAN_CONSENTS_LOGS}${apiDomain}`,
        CSP_VALID_URI.CMP,
        CSP_VALID_URI.GUARDIAN_API,
        CSP_VALID_URI.HAVEIBEENPWNED,
        idapiOrigin,
        CSP_VALID_URI.GOOGLE_RECAPTCHA,
      ],
      frameSrc: [CSP_VALID_URI.CMP, CSP_VALID_URI.GOOGLE_RECAPTCHA],
    },
  },
};

export const helmetMiddleware = helmet(helmetConfig);
