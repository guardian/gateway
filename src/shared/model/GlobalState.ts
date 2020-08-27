import { FieldError } from '@/server/routes/changePassword';

export interface GlobalState {
  error?: string;
  emailProvider?: string;
  email?: string;
  fieldErrors?: Array<FieldError>;
  pageData?: unknown;
}
