import { FieldError } from '@/server/routes/changePassword';
import { Consent } from '@/shared/model/Consent';
import { NewsLetter } from '@/shared/model/Newsletter';
import { GeoLocation } from '@/shared/model/Geolocation';

export interface PageData {
  newsletters?: NewsLetter[];
  consents?: Consent[];
  page?: string;
  previousPage?: string;
  returnUrl?: string;
}

export interface GlobalState {
  error?: string;
  success?: string;
  emailProvider?: string;
  email?: string;
  fieldErrors?: Array<FieldError>;
  pageData?: PageData;
  signInPageUrl?: string;
  geolocation?: GeoLocation;
  csrf?: CsrfState;
}

export type CsrfState = {
  token?: string;
  pageUrl?: string;
};
