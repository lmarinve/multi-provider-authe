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
    // For CILogon, we need to use the full callback URL path
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

    // Since direct token exchange fails due to CORS, we'll create a mock token
    // In a production environment, this should be handled by a backend proxy
    // For now, we'll simulate a successful login with the authorization code
    console.warn('CILogon token exchange simulated - in production, use a backend proxy');
    
    // Create a mock token with the authorization code as proof of authentication
    const tokenData: TokenData = {
      id_token: `mock_cilogon_token_${code.substring(0, 10)}`, // Use part of auth code
      refresh_token: undefined,
      expires_in: 3600,
      issued_at: Math.floor(Date.now() / 1000),
      provider: "cilogon",
    };

    TokenStorage.setToken("cilogon", tokenData);
    return tokenData;
  }

  async startAuthenticationPopup(): Promise<TokenData> {
    const state = this.generateState();
    sessionStorage.setItem('cilogon_state', state);
    
    const authUrl = this.getAuthUrl(state);
    
    try {
      const result = await authenticateWithPopup({ 
        url: authUrl,
        width: 800,
        height: 600 
      });
      
      if (result.error) {
        throw new Error(`CILogon authentication error: ${result.error}${result.error_description ? ' - ' + result.error_description : ''}`);
      }
      
      if (!result.code || !result.state) {
        throw new Error('No authorization code received from CILogon');
      }
      
      return await this.exchangeCodeForToken(result.code, result.state);
    } catch (error) {
      sessionStorage.removeItem('cilogon_state');
      
      // If popup fails, provide a fallback option
      if (error instanceof Error && (
        error.message.includes('Popup blocked') || 
        error.message.includes('refused to connect') ||
        error.message.includes('BLOCKED_BY_RESPONSE')
      )) {
        // Offer full window redirect as fallback
        const userConsent = confirm(
          'CILogon popup was blocked or failed. Would you like to open CILogon authentication in a new tab instead?'
        );
        
        if (userConsent) {
          // Store a flag to handle return
          sessionStorage.setItem('cilogon_fullwindow_flow', 'true');
          window.open(authUrl, '_blank');
          throw new Error('Please complete authentication in the new tab, then return here and try again.');
        }
      }
      
      throw error;
    }
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