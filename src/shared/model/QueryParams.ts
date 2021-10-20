import { StringifiableRecord } from 'query-string';

export interface QueryParams extends StringifiableRecord {
  returnUrl: string;
  clientId?: string;
  emailVerified?: boolean;
  csrfError?: boolean;
  // this is the url of the referring page
  // https://github.com/guardian/ophan/blob/70b658e785c490c411670bbd3c7fde62ae0224fc/the-slab/app/extractors/ReferrerExtractor.scala#L171
  ref?: string;
  // this refViewId refers to the referral page view id
  // that the user was on to use for tracking referrals
  // https://github.com/guardian/ophan/blob/70b658e785c490c411670bbd3c7fde62ae0224fc/the-slab/app/extractors/ReferrerExtractor.scala#L129
  refViewId?: string;
  encryptedEmail?: string;
  error?: string;
}
