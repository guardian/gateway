export interface CreateUserRequest {
  profile: Profile;
}

export interface ActivationRequest {
  token: string;
}

export interface ActivationResponse {
  stateToken: string;
  expiresAt: string;
  _embedded: {
    user: User;
  };
}

export interface SetPasswordRequest {
  stateToken: string;
  newPassword: string;
}

export interface SetPasswordResponse {
  sessionToken: string;
  expiresAt: string;
  _embedded: {
    user: User;
  };
}

export interface User {
  id: string;
  profile: Profile;
}

interface Profile {
  email: string;
  login: string;
  isGuardianUser?: boolean;
}
