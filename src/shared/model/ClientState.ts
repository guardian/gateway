import { Consent } from '@/shared/model/Consent';
import { NewsLetter } from '@/shared/model/Newsletter';
import { GeoLocation } from '@/shared/model/Geolocation';
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

  // onboarding specific
  newsletters?: NewsLetter[];
  consents?: Consent[];
  page?: string;
  previousPage?: string;
  ref?: string;
  refViewId?: string;
}

export interface ClientHosts {
  idapiBaseUrl: string;
}

export interface ClientState {
  globalMessage?: GlobalMessage;
  pageData?: PageData;
  csrf?: CsrfState;
  abTesting?: ABTesting;
  clientHosts: ClientHosts;
}

export type CsrfState = {
  token?: string;
  pageUrl?: string;
};
