import { FieldError } from '@/server/routes/changePassword';
import { Consent } from './Consent';
import { NewsLetter } from './Newsletter';

export interface GlobalState {
  error?: string;
  emailProvider?: string;
  email?: string;
  fieldErrors?: Array<FieldError>;
  pageData?: {
    newsletters?: NewsLetter[];
    consents?: Consent[];
    previousPage?: string;
    page?: string;
  };
}
