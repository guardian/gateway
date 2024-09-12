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
	// 0 - user doesn't exist - not currently used in any code
	// 1 - ACTIVE - user has email + password authenticator (okta idx email verified)
	// 2 - ACTIVE - user has only password authenticator (okta idx email not verified)
	// 3 - ACTIVE - user has only email authenticator (okta idx email verified) - not currently used in any code
	// 4 - user not in ACTIVE state - not currently used in any code
	// Only including states that we actually currently set on the EncryptedState cookie
	userState?: 1 | 2;
}
