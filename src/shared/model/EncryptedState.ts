import { InternalOktaUserState } from '@/server/models/okta/User';
import { PersistableQueryParams } from './QueryParams';

export interface EncryptedState {
	// Email to persist across requests
	email?: string;
	// Flag to determine if the password was already set
	passwordSetOnWelcomePage?: boolean;
	// Query params to persist across requests
	queryParams?: PersistableQueryParams;
	// Okta IDX API - State handle to persist across requests
	stateHandle?: string;
	// Okta IDX API - Time when the state handle expires
	stateHandleExpiresAt?: string;
	// Okta IDX API - Flag to determine if the user has used a passcode
	passcodeUsed?: boolean;
	// Okta IDX API - State of the user in the Okta determines if we can send passcodes to the user when resetting the password
	userState?: InternalOktaUserState;
	// Okta IDX API - Count of failed passcode attempts
	passcodeFailedCount?: number;
}
