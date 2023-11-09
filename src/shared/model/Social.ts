import { isOneOf } from '@guardian/libs';

const socialProviders = ['google', 'apple'] as const;

export type SocialProvider = (typeof socialProviders)[number];

export const isValidSocialProvider = isOneOf(socialProviders);
