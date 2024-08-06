import type { EmailType } from '@/shared/model/EmailType';
import type { PersistableQueryParams } from './QueryParams';

export interface EncryptedState {
	email?: string;
	emailType?: EmailType;
	passwordSetOnWelcomePage?: boolean;
	status?: string;
	signInRedirect?: boolean; // TODO: possibly rename for clarity
	queryParams?: PersistableQueryParams;
	stateHandle?: string; // part of the Okta IDX flow
	stateHandleExpiresAt?: string; // part of the Okta IDX flow
	passcodeUsed?: boolean; // part of the Okta IDX flow, determines if the passcode has been used
}
