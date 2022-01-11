import { EmailType } from '@/shared/model/EmailType';

export interface EncryptedState {
  email?: string;
  emailType?: EmailType;
  passwordSetOnWelcomePage?: boolean;
  status?: string;
  stateToken?: string;
}
