import { FieldError } from '@/server/routes/changePassword';
import { Consent } from './Consent';
import { NewsLetter } from './Newsletter';

export interface PageData {
  newsletters?: NewsLetter[];
  consents?: Consent[];
  page?: string;
  previousPage?: string;
}

export interface GlobalState {
  error?: string;
  success?: string;
  emailProvider?: string;
  email?: string;
  fieldErrors?: Array<FieldError>;
  pageData?: PageData;
  signInPageUrl?: string;
}
