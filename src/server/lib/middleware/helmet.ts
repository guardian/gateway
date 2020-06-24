import { default as helmet, IHelmetConfiguration } from 'helmet';
import { getConfiguration } from '@/server/lib/configuration';
import { Routes } from '@/shared/model/Routes';

enum HELMET_OPTIONS {
  SELF = "'self'",
  NONE = "'none'",
  UNSAFE_INLINE = "'unsafe-inline'",
}

const { baseUri, gaUID } = getConfiguration();

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
        `www.google-analytics.com`,
      ],
      imgSrc: [
        'static.guim.co.uk',
        'ophan.theguardian.com',
        'www.google-analytics.com',
      ],
      fontSrc: ['assets.guim.co.uk'],
      connectSrc: ['www.google-analytics.com'],
    },
    browserSniff: false,
  },
};

export const helmetMiddleware = helmet(helmetConfig);
