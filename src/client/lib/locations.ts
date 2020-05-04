const DOMAIN = 'www.theguardian.com';

const url = (path: string): string => `https://${DOMAIN}${path}`;

export default {
  HELP: url('/help/identity-faq'),
  TERMS: url('/help/terms-of-service'),
  CONTACT_US: url('/help/contact-us'),
  PRIVACY: url('/info/privacy'),
  REPORT_ISSUE: url('/info/tech-feedback'),
  COOKIE_POLICY: url('/info/cookies'),
};
