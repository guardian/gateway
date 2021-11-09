import { Consent } from '@/shared/model/Consent';
import { NewsLetter } from '@/shared/model/Newsletter';
import { GeoLocation } from '@/shared/model/Geolocation';
import { EmailType } from '@/shared/model/EmailType';
import { QueryParams } from '@/shared/model/QueryParams';
import { Participations } from '@guardian/ab-core';

export interface FieldError {
  field: string;
  message: string;
}
interface ABTesting {
  mvtId?: number;
  participations?: Participations;
  forcedTestVariants?: Participations;
}

export interface GlobalMessage {
  error?: string;
  success?: string;
}

export interface PageData {
  // general page data
  returnUrl?: string;
  email?: string;
  signInPageUrl?: string;
  geolocation?: GeoLocation;
  fieldErrors?: Array<FieldError>;
  browserName?: string;

  // email sent page specific
  emailType?: EmailType;

  // onboarding specific
  newsletters?: NewsLetter[];
  consents?: Consent[];
  page?: string;
  previousPage?: string;

  // reset password token specific
  tokenExpiryTimestamp?: number;
}

export interface RecaptchaConfig {
  recaptchaSiteKey: string;
}

export interface ClientHosts {
  idapiBaseUrl: string;
  oauthBaseUrl: string;
}

export interface ClientState {
  queryParams: QueryParams;
  globalMessage?: GlobalMessage;
  pageData?: PageData;
  csrf?: CsrfState;
  abTesting?: ABTesting;
  clientHosts: ClientHosts;
  recaptchaConfig: RecaptchaConfig;
}

export type CsrfState = {
  token?: string;
  pageUrl?: string;
};
