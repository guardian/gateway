import { default as helmet, IHelmetConfiguration } from 'helmet';
import { getConfiguration } from '@/server/lib/configuration';
import { Routes } from '@/shared/model/Routes';

enum HELMET_OPTIONS {
  SELF = "'self'",
  NONE = "'none'",
  UNSAFE_INLINE = "'unsafe-inline'",
}

enum CSP_VALID_URI {
  GOOGLE_ANALYTICS = 'www.google-analytics.com',
  GUARDIAN_STATIC = 'static.guim.co.uk',
  GUARDIAN_ASSETS = 'assets.guim.co.uk',
  OPHAN = 'ophan.theguardian.com',
  VENDORLIST_CMP = 'vendorlist.consensu.org',
  GUARDIAN_CONSENTS_LOGS = 'consent-logs.',
}

const { baseUri, gaUID, apiDomain } = getConfiguration();

const helmetConfig: IHelmetConfiguration = {
  contentSecurityPolicy: {
    directives: {
      baseUri: [HELMET_OPTIONS.NONE],
      defaultSrc: [HELMET_OPTIONS.NONE],
      formAction: [
        `${baseUri}${Routes.RESET}`,
        `${baseUri}${Routes.CHANGE_PASSWORD}/`,
      ],
      frameAncestors: [HELMET_OPTIONS.NONE],
      styleSrc: [HELMET_OPTIONS.UNSAFE_INLINE],
      scriptSrc: [
        `${baseUri}`,
        gaUID.hash, // google analytics id
        CSP_VALID_URI.GOOGLE_ANALYTICS,
      ],
      imgSrc: [
        CSP_VALID_URI.GUARDIAN_STATIC,
        CSP_VALID_URI.OPHAN,
        CSP_VALID_URI.GOOGLE_ANALYTICS,
      ],
      fontSrc: [CSP_VALID_URI.GUARDIAN_ASSETS],
      connectSrc: [
        CSP_VALID_URI.GOOGLE_ANALYTICS,
        CSP_VALID_URI.VENDORLIST_CMP,
        `${CSP_VALID_URI.GUARDIAN_CONSENTS_LOGS}${apiDomain}`,
      ],
    },
    browserSniff: false,
  },
};

export const helmetMiddleware = helmet(helmetConfig);
