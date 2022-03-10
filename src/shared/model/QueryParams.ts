import { StringifiableRecord } from 'query-string';
import { ValidClientId } from '../lib/clientId';

export interface TrackingQueryParams {
  // this is the url of the referring page
  // https://github.com/guardian/ophan/blob/70b658e785c490c411670bbd3c7fde62ae0224fc/the-slab/app/extractors/ReferrerExtractor.scala#L171
  ref?: string;
  // this refViewId refers to the referral page view id
  // that the user was on to use for tracking referrals
  // https://github.com/guardian/ophan/blob/70b658e785c490c411670bbd3c7fde62ae0224fc/the-slab/app/extractors/ReferrerExtractor.scala#L129
  refViewId?: string;
}

/**
 * PersistableQueryParams are query parameters
 * that are safe to persist between requests
 * for example query parameters that should be passed
 * from page to page in a flow e.g. returnUrl
 */
export interface PersistableQueryParams
  extends TrackingQueryParams,
    StringifiableRecord {
  returnUrl: string;
  useOkta?: boolean;
  clientId?: ValidClientId;
  fromURI?: string;
}

/**
 * `QueryParams` type is made up of the `PersistableQueryParams`
 * as well as extra parameters that should not persist between
 * request or are only valid for a single request, for example an
 * `error` or state flag
 */
export interface QueryParams
  extends PersistableQueryParams,
    StringifiableRecord {
  emailVerified?: boolean;
  // used to show the success message on the email sent page
  // only if the email is resent from the email sent page
  emailSentSuccess?: boolean;
  csrfError?: boolean;
  recaptchaError?: boolean;
  encryptedEmail?: string;
  error?: string;
  error_description?: string;
}
