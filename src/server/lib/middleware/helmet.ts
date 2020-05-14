import { default as helmet, IHelmetConfiguration } from 'helmet';
import { getConfiguration } from '@/server/lib/configuration';
import { Routes } from '@/shared/model/Routes';

enum HELMET_OPTIONS {
  SELF = "'self'",
  NONE = "'none'",
  UNSAFE_INLINE = "'unsafe-inline'",
}

const { baseUri } = getConfiguration();

const helmetConfig: IHelmetConfiguration = {
  contentSecurityPolicy: {
    directives: {
      baseUri: [HELMET_OPTIONS.NONE],
      defaultSrc: [HELMET_OPTIONS.NONE],
      formAction: [`${baseUri}${Routes.RESET}`],
      frameAncestors: [HELMET_OPTIONS.NONE],
      styleSrc: [HELMET_OPTIONS.UNSAFE_INLINE],
      imgSrc: ['static.guim.co.uk'],
      fontSrc: ['assets.guim.co.uk'],
    },
  },
};

export const helmetMiddleware = helmet(helmetConfig);
