import { config } from "@/lib/config";
import { TokenData, TokenResponse } from "@/lib/types";
import { TokenStorage } from "@/lib/token-storage";
import { authenticateWithPopup } from "@/lib/auth-popup";

export class CILogonProvider {
  private generateState(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array)).replace(/[+/=]/g, '').substring(0, 43);
  }

  private getAuthUrl(state: string): string {
    // Use current origin as redirect URI
    const redirectUri = `${window.location.origin}/auth/callback/cilogon.html`;
    
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: config.cilogon.clientId,
      redirect_uri: redirectUri,
      scope: config.cilogon.scope,
      state: state,
    });

    return `${config.cilogon.authUrl}?${params.toString()}`;
  }

  async exchangeCodeForToken(code: string, state: string): Promise<TokenData> {
    const storedState = sessionStorage.getItem('cilogon_state');
    if (!state || state !== storedState) {
      throw new Error('Invalid state parameter');
    }

    sessionStorage.removeItem('cilogon_state');

    // Prepare token exchange request
    const redirectUri = `${window.location.origin}/auth/callback/cilogon.html`;
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      client_id: config.cilogon.clientId,
      redirect_uri: redirectUri,
    });

    try {
      const response = await fetch(config.cilogon.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (!response.ok) {
        throw new Error(`Token exchange failed: ${response.status} ${response.statusText}`);
      }

      const tokenResponse = await response.json();
      
      const tokenData: TokenData = {
        id_token: tokenResponse.id_token || tokenResponse.access_token,
        refresh_token: tokenResponse.refresh_token,
        expires_in: tokenResponse.expires_in || 3600,
        issued_at: Math.floor(Date.now() / 1000),
        provider: "cilogon",
      };

      TokenStorage.setToken("cilogon", tokenData);
      return tokenData;
    } catch (error) {
      console.error('CILogon token exchange error:', error);
      throw new Error(`Failed to exchange code for token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async startAuthenticationPopup(): Promise<TokenData> {
    const state = this.generateState();
    sessionStorage.setItem('cilogon_state', state);
    const authUrl = this.getAuthUrl(state);
    
    console.log('Opening CILogon authentication window...');
    
    // Open the actual CILogon OAuth URL in a new window
    const popup = window.open(
      authUrl,
      'cilogon_auth',
      'width=900,height=700,scrollbars=yes,resizable=yes,status=yes,location=yes,toolbar=yes,menubar=yes'
    );

    if (!popup) {
      throw new Error('Popup blocked. Please allow popups for this site and try again.');
    }

    // Focus the popup window
    popup.focus();

    // Return a promise that resolves when authentication completes
    return new Promise((resolve, reject) => {
      // Listen for messages from the popup
      const messageHandler = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data?.type === 'CILOGON_AUTH_SUCCESS') {
          window.removeEventListener('message', messageHandler);
          clearInterval(checkClosed);
          popup.close();
          
          const { code, state: returnedState } = event.data;
          this.exchangeCodeForToken(code, returnedState)
            .then(resolve)
            .catch(reject);
        } else if (event.data?.type === 'CILOGON_AUTH_ERROR') {
          window.removeEventListener('message', messageHandler);
          clearInterval(checkClosed);
          popup.close();
          reject(new Error(event.data.error || 'Authentication failed'));
        }
      };
      
      window.addEventListener('message', messageHandler);
      
      // Check if popup is closed every second
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageHandler);
          reject(new Error('Authentication window was closed before completion'));
        }
      }, 1000);

      // Timeout after 10 minutes
      setTimeout(() => {
        clearInterval(checkClosed);
        window.removeEventListener('message', messageHandler);
        if (!popup.closed) {
          popup.close();
        }
        reject(new Error('Authentication timeout. Please try again.'));
      }, 600000);
    });
  }

  // Legacy methods for URL-based callback handling
  async handleCallback(): Promise<TokenData> {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');

    if (error) {
      throw new Error(`CILogon authentication error: ${error}`);
    }

    if (!code || !state) {
      throw new Error('No authorization code received from CILogon');
    }

    return await this.exchangeCodeForToken(code, state);
  }

  startAuthentication(): void {
    const state = this.generateState();
    sessionStorage.setItem('cilogon_state', state);
    const authUrl = this.getAuthUrl(state);
    window.location.href = authUrl;
  }

  // Keep static methods for backward compatibility
  static getAuthUrl(): string {
    const provider = new CILogonProvider();
    const state = provider.generateState();
    return provider.getAuthUrl(state);
  }

  static handleCallback(): Promise<TokenData> {
    const provider = new CILogonProvider();
    return provider.handleCallback();
  }

  static startAuthentication(): void {
    const provider = new CILogonProvider();
    provider.startAuthentication();
  }

  static async startAuthenticationPopup(): Promise<TokenData> {
    const provider = new CILogonProvider();
    return provider.startAuthenticationPopup();
  }
}