export interface ActivationRequest {
  token: string;
}

export interface ActivationResponse {
  stateToken: string;
  expiresAt: string;
  _embedded: {
    user: {
      id: string;
      profile: {
        login: string;
      };
    };
  };
}
