export type Provider = "cilogon" | "orcid";

export interface AuthToken {
  id_token: string;
  access_token?: string;
  refresh_token?: string;
  expires_in: number;
  issued_at: number;
  provider: Provider;
  token_type?: string;
  scope?: string;
}

export interface Claims {
  sub: string;
  iss: string;
  aud: string;
  exp: number;
  iat: number;
  email?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  preferred_username?: string;
}

export interface BackendResponse {
  success: boolean;
  message: string;
  data?: any;
}