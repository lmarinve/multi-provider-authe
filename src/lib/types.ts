export interface TokenData {
  id_token: string;
  refresh_token?: string;
  expires_in: number;
  issued_at: number;
  provider: "cilogon" | "orcid" | "fabric";
}

export interface TokenClaims {
  sub?: string;
  iss?: string;
  exp?: number;
  email?: string;
  name?: string;
  [key: string]: any;
}

export interface DeviceFlowResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  verification_uri_complete?: string;
  expires_in: number;
  interval: number;
}

export interface TokenResponse {
  access_token?: string;
  id_token?: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
}

export interface BackendPayload {
  provider: "cilogon" | "orcid" | "fabric";
  id_token: string;
  refresh_token?: string;
  expires_in: number;
  issued_at: number;
  token_format: "jwt";
  claims_hint: TokenClaims;
}

export type AuthState = {
  selectedProvider?: "cilogon" | "orcid" | "fabric";
  tokens: {
    cilogon?: TokenData;
    orcid?: TokenData;
    fabric?: TokenData;
  };
};

export type DeviceFlowState = {
  status: "idle" | "requesting" | "polling" | "pending" | "complete" | "error";
  deviceCode?: string;
  userCode?: string;
  verificationUri?: string;
  verificationUriComplete?: string;
  expiresAt?: number;
  interval?: number;
  error?: string;
  token?: string;
  message?: string;
};