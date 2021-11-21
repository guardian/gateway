import { EmailType } from '@/shared/model/EmailType';

export interface EncryptedState {
  email?: string;
  emailType?: EmailType;
  oktaStateToken?: string;
  passwordSetOnWelcomePage?: boolean;
}
