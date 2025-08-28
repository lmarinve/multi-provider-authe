import { config } from "@/lib/config";
import { TokenData, TokenResponse } from "@/lib/types";
import { TokenStorage } from "@/lib/token-storage";

export class CILogonProvider {
  private generateState(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array)).replace(/[+/=]/g, '').substring(0, 43);
  }

  getAuthUrl(): string {
    const state = this.generateState();
    const redirectUri = `${window.location.origin}/login?provider=cilogon`;
    
    // Store state for validation
    sessionStorage.setItem('cilogon_state', state);
    
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: config.cilogon.clientId,
      redirect_uri: redirectUri,
      scope: config.cilogon.scope,
      state: state,
    });

    return `${config.cilogon.authUrl}?${params.toString()}`;
  }

  async handleCallback(): Promise<TokenData> {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');

    if (error) {
      throw new Error(`CILogon authentication error: ${error}`);
    }

    if (!code) {
      throw new Error('No authorization code received from CILogon');
    }

    const storedState = sessionStorage.getItem('cilogon_state');
    if (!state || state !== storedState) {
      throw new Error('Invalid state parameter');
    }

    sessionStorage.removeItem('cilogon_state');

    // Exchange code for tokens
    const redirectUri = `${window.location.origin}/login?provider=cilogon`;
    
    const response = await fetch(config.cilogon.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        client_id: config.cilogon.clientId,
        redirect_uri: redirectUri,
      }),
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.status} ${response.statusText}`);
    }

    const tokenResponse = await response.json() as TokenResponse;

    if (!tokenResponse.id_token) {
      throw new Error("No ID token received from CILogon");
    }

    const tokenData: TokenData = {
      id_token: tokenResponse.id_token,
      refresh_token: tokenResponse.refresh_token,
      expires_in: tokenResponse.expires_in || 3600,
      issued_at: Math.floor(Date.now() / 1000),
      provider: "cilogon",
    };

    TokenStorage.setToken("cilogon", tokenData);
    return tokenData;
  }

  startAuthentication(): void {
    const authUrl = this.getAuthUrl();
    window.location.href = authUrl;
  }

  // Keep static methods for backward compatibility
  static getAuthUrl(): string {
    const provider = new CILogonProvider();
    return provider.getAuthUrl();
  }

  static handleCallback(): Promise<TokenData> {
    const provider = new CILogonProvider();
    return provider.handleCallback();
  }

  static startAuthentication(): void {
    const provider = new CILogonProvider();
    provider.startAuthentication();
  }
}