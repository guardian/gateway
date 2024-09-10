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
}
