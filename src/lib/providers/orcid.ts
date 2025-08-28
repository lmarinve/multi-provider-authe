import { config } from "@/lib/config";
import { TokenData, TokenResponse } from "@/lib/types";
import { TokenStorage } from "@/lib/token-storage";

function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

export class ORCIDProvider {
  async getAuthUrl(): Promise<string> {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const state = crypto.randomUUID();

    // Store PKCE values
    sessionStorage.setItem('orcid_code_verifier', codeVerifier);
    sessionStorage.setItem('orcid_state', state);

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: config.orcid.clientId,
      redirect_uri: `${window.location.origin}/login?provider=orcid`,
      scope: config.orcid.scope,
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    return `${config.orcid.authUrl}?${params}`;
  }

  static async initiateLogin(): Promise<string> {
    const provider = new ORCIDProvider();
    return provider.getAuthUrl();
  }

  async exchangeCodeForToken(code: string, state: string): Promise<TokenData> {
    const storedState = sessionStorage.getItem('orcid_state');
    const codeVerifier = sessionStorage.getItem('orcid_code_verifier');

    if (!storedState || storedState !== state) {
      throw new Error('Invalid state parameter');
    }

    if (!codeVerifier) {
      throw new Error('Code verifier not found');
    }

    // Clean up session storage
    sessionStorage.removeItem('orcid_state');
    sessionStorage.removeItem('orcid_code_verifier');

    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: config.orcid.clientId,
      code,
      redirect_uri: `${window.location.origin}/login?provider=orcid`,
      code_verifier: codeVerifier,
    });

    const response = await fetch(config.orcid.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: params,
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`);
    }

    const tokenResponse: TokenResponse = await response.json();

    if (!tokenResponse.id_token) {
      throw new Error('No ID token received');
    }

    const tokenData: TokenData = {
      id_token: tokenResponse.id_token,
      refresh_token: tokenResponse.refresh_token,
      expires_in: tokenResponse.expires_in || 3600,
      issued_at: Math.floor(Date.now() / 1000),
      provider: 'orcid',
    };

    TokenStorage.setToken('orcid', tokenData);
    return tokenData;
  }

  static async handleCallback(code: string, state: string): Promise<TokenData> {
    const provider = new ORCIDProvider();
    return provider.exchangeCodeForToken(code, state);
  }
}