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

  private generateCodeVerifier(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    
    // Convert to string
    let binary = '';
    for (let i = 0; i < array.length; i++) {
      binary += String.fromCharCode(array[i]);
    }
    
    // Generate base64url string with no padding - CRITICAL for PKCE S256
    const base64 = btoa(binary);
    const base64url = base64
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '') // Remove ALL padding
      .substring(0, 43); // Ensure proper length
    
    console.log('Generated code verifier (no padding):', base64url);
    return base64url;
  }

  private async generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    
    // Convert ArrayBuffer to base64url format (no padding)
    const bytes = new Uint8Array(digest);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    
    // Convert to base64url format - CRITICAL: no padding
    const base64 = btoa(binary);
    const base64url = base64
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, ''); // Remove ALL padding
    
    console.log('Generated code challenge (no padding):', base64url);
    return base64url;
  }

  private async getAuthUrl(state: string, codeVerifier: string): Promise<string> {
    const codeChallenge = await this.generateCodeChallenge(codeVerifier);
    
    console.log('Building CILogon auth URL with:', {
      redirect_uri: config.cilogon.redirectUri,
      client_id: config.cilogon.clientId,
      scope: config.cilogon.scope
    });
    
    // Build URL using URLSearchParams to ensure proper encoding
    const authUrl = new URL("https://cilogon.org/authorize");
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("client_id", config.cilogon.clientId);
    authUrl.searchParams.set("redirect_uri", config.cilogon.redirectUri);
    authUrl.searchParams.set("scope", config.cilogon.scope);
    authUrl.searchParams.set("state", state);
    authUrl.searchParams.set("code_challenge", codeChallenge);
    authUrl.searchParams.set("code_challenge_method", "S256");
    
    const authUrlString = authUrl.toString();
    console.log('Final CILogon auth URL:', authUrlString);
    return authUrlString;
  }

  async exchangeCodeForToken(code: string, state: string, codeVerifier: string): Promise<TokenData> {
    const storedState = sessionStorage.getItem('cilogon_state');
    if (!state || state !== storedState) {
      throw new Error('Invalid state parameter');
    }

    sessionStorage.removeItem('cilogon_state');
    sessionStorage.removeItem('cilogon_code_verifier');

    // Prepare token exchange request with PKCE using exact format required
    // CRITICAL: code_verifier should NOT be URL encoded since it's already base64url
    const body = `grant_type=authorization_code&code=${encodeURIComponent(code)}&redirect_uri=${encodeURIComponent(config.cilogon.redirectUri)}&client_id=${encodeURIComponent(config.cilogon.clientId)}&code_verifier=${codeVerifier}`;

    try {
      console.log('Token exchange using redirect_uri:', config.cilogon.redirectUri);

      const response = await fetch(config.cilogon.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('CILogon token exchange failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`Token exchange failed: ${response.status} ${response.statusText}. ${errorText}`);
      }

      const tokenResponse = await response.json();
      console.log('CILogon token exchange successful:', { has_id_token: !!tokenResponse.id_token, has_access_token: !!tokenResponse.access_token });
      
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
    const codeVerifier = this.generateCodeVerifier();
    
    sessionStorage.setItem('cilogon_state', state);
    sessionStorage.setItem('cilogon_code_verifier', codeVerifier);
    
    const authUrl = await this.getAuthUrl(state, codeVerifier);
    
    console.log('Opening CILogon authentication window...');
    
    // Calculate center position for popup
    const width = 800;
    const height = 600;
    const left = (window.screen.width / 2) - (width / 2);
    const top = (window.screen.height / 2) - (height / 2);
    
    // Open the actual CILogon OAuth URL in a popup window
    const popup = window.open(
      authUrl,
      'cilogon_auth',
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes,status=no,location=no,toolbar=no,menubar=no`
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
        // Be more permissive with origins for authentication flow
        console.log('Received message from origin:', event.origin, 'with data:', event.data);
        
        if (event.data?.type === 'CILOGON_AUTH_SUCCESS') {
          window.removeEventListener('message', messageHandler);
          clearInterval(checkClosed);
          clearInterval(fallbackCheck);
          popup.close();
          
          const { code, state: returnedState } = event.data;
          const storedCodeVerifier = sessionStorage.getItem('cilogon_code_verifier');
          if (!storedCodeVerifier) {
            reject(new Error('Code verifier not found'));
            return;
          }
          
          this.exchangeCodeForToken(code, returnedState, storedCodeVerifier)
            .then(resolve)
            .catch(reject);
        } else if (event.data?.type === 'CILOGON_AUTH_ERROR') {
          window.removeEventListener('message', messageHandler);
          clearInterval(checkClosed);
          clearInterval(fallbackCheck);
          popup.close();
          reject(new Error(event.data.error || 'Authentication failed'));
        }
      };
      
      window.addEventListener('message', messageHandler);
      
      // Fallback mechanism: check localStorage for auth result
      const fallbackCheck = setInterval(() => {
        try {
          const authResult = localStorage.getItem('cilogon_auth_result');
          if (authResult) {
            const result = JSON.parse(authResult);
            console.log('Found stored auth result:', result);
            // Only process recent results (within 2 minutes)
            if (Date.now() - result.timestamp < 120000) {
              localStorage.removeItem('cilogon_auth_result');
              window.removeEventListener('message', messageHandler);
              clearInterval(checkClosed);
              clearInterval(fallbackCheck);
              
              if (result.type === 'CILOGON_AUTH_SUCCESS') {
                console.log('Processing stored successful auth result');
                const storedCodeVerifier = sessionStorage.getItem('cilogon_code_verifier');
                if (!storedCodeVerifier) {
                  reject(new Error('Code verifier not found'));
                  return;
                }
                
                this.exchangeCodeForToken(result.code, result.state, storedCodeVerifier)
                  .then((tokenData) => {
                    console.log('Token exchange successful from localStorage fallback:', tokenData);
                    resolve(tokenData);
                  })
                  .catch((error) => {
                    console.error('Token exchange failed from localStorage fallback:', error);
                    reject(error);
                  });
              } else if (result.type === 'CILOGON_AUTH_ERROR') {
                console.log('Processing stored error auth result:', result.error);
                reject(new Error(result.error || 'Authentication failed'));
              }
            } else {
              console.log('Stored auth result is too old, ignoring');
            }
          }
        } catch (e) {
          console.error('Error checking localStorage fallback:', e);
        }
      }, 1000);
      
      // Check if popup is closed every second
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          clearInterval(fallbackCheck);
          window.removeEventListener('message', messageHandler);
          reject(new Error('Authentication window was closed before completion'));
        }
      }, 1000);

      // Timeout after 10 minutes
      setTimeout(() => {
        clearInterval(checkClosed);
        clearInterval(fallbackCheck);
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

    const storedCodeVerifier = sessionStorage.getItem('cilogon_code_verifier');
    if (!storedCodeVerifier) {
      throw new Error('Code verifier not found in session storage');
    }

    return await this.exchangeCodeForToken(code, state, storedCodeVerifier);
  }

  async startAuthentication(): Promise<void> {
    const state = this.generateState();
    const codeVerifier = this.generateCodeVerifier();
    
    sessionStorage.setItem('cilogon_state', state);
    sessionStorage.setItem('cilogon_code_verifier', codeVerifier);
    
    const authUrl = await this.getAuthUrl(state, codeVerifier);
    window.location.href = authUrl;
  }

  // Keep static methods for backward compatibility
  static async getAuthUrl(): Promise<string> {
    const provider = new CILogonProvider();
    const state = provider.generateState();
    const codeVerifier = provider.generateCodeVerifier();
    sessionStorage.setItem('cilogon_state', state);
    sessionStorage.setItem('cilogon_code_verifier', codeVerifier);
    return provider.getAuthUrl(state, codeVerifier);
  }

  static handleCallback(): Promise<TokenData> {
    const provider = new CILogonProvider();
    return provider.handleCallback();
  }

  static async startAuthentication(): Promise<void> {
    const provider = new CILogonProvider();
    return provider.startAuthentication();
  }

  static async startAuthenticationPopup(): Promise<TokenData> {
    const provider = new CILogonProvider();
    return provider.startAuthenticationPopup();
  }
}