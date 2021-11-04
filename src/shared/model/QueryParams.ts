import { StringifiableRecord } from 'query-string';

/**
 * SafeQueryParams are query parameters
 * that are safe to persist between requests
 * for example query parameters that should be passed
 * from page to page in a flow e.g. returnUrl
 */
export interface SafeQueryParams extends StringifiableRecord {
  returnUrl: string;
  clientId?: string;
  // this is the url of the referring page
  // https://github.com/guardian/ophan/blob/70b658e785c490c411670bbd3c7fde62ae0224fc/the-slab/app/extractors/ReferrerExtractor.scala#L171
  ref?: string;
  // this refViewId refers to the referral page view id
  // that the user was on to use for tracking referrals
  // https://github.com/guardian/ophan/blob/70b658e785c490c411670bbd3c7fde62ae0224fc/the-slab/app/extractors/ReferrerExtractor.scala#L129
  refViewId?: string;
}

/**
 * UnsafeQueryParams are query params
 * that should only persist for a single request
 * for example to show an error for a page
 */
export interface UnsafeQueryParams extends StringifiableRecord {
  emailVerified?: boolean;
  csrfError?: boolean;
  encryptedEmail?: string;
  error?: string;
}

/**
 * Join of both safe and unsafe query params
 * that we can use in a request
 */
export interface QueryParams
  extends SafeQueryParams,
    UnsafeQueryParams,
    StringifiableRecord {}
