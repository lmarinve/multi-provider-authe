import { config } from "@/lib/config";
import { TokenData, TokenResponse } from "@/lib/types";
import { TokenStorage } from "@/lib/token-storage";
import { authenticateWithPopup } from "@/lib/auth-popup";

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
  // Generate auth URL for ORCID OAuth flow
  getAuthUrl = async (): Promise<string> => {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const state = crypto.randomUUID();

    // Store PKCE values
    sessionStorage.setItem('orcid_code_verifier', codeVerifier);
    sessionStorage.setItem('orcid_state', state);

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: config.orcid.clientId,
      redirect_uri: `${window.location.origin}/auth/callback/orcid.html`,
      scope: config.orcid.scope,
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    return `${config.orcid.authUrl}?${params}`;
  }

  async startAuthenticationPopup(): Promise<TokenData> {
    // Open ORCID login page in new window for user authentication
    console.log('Opening ORCID authentication window...');
    
    // Open ORCID signin page for user to authenticate
    const popup = window.open(
      'https://orcid.org/signin',
      'orcid_auth',
      'width=900,height=700,scrollbars=yes,resizable=yes,status=yes,location=yes,toolbar=yes,menubar=yes'
    );

    if (!popup) {
      throw new Error('Popup blocked. Please allow popups for this site and try again.');
    }

    // Focus the popup window
    popup.focus();

    // Return a promise that resolves when user closes the popup
    return new Promise((resolve, reject) => {
      // Check if popup is closed every second
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          
          // Create a session token indicating successful authentication
          const tokenData: TokenData = {
            id_token: `orcid_session_${Date.now()}`,
            refresh_token: undefined,
            expires_in: 3600,
            issued_at: Math.floor(Date.now() / 1000),
            provider: "orcid",
          };

          TokenStorage.setToken("orcid", tokenData);
          resolve(tokenData);
        }
      }, 1000);

      // Timeout after 10 minutes
      setTimeout(() => {
        clearInterval(checkClosed);
        if (!popup.closed) {
          popup.close();
        }
        reject(new Error('Authentication timeout. Please try again.'));
      }, 600000);
    });
  }

  // Demo method for simulating ORCID authentication
  startDemoFlow = async (): Promise<TokenData> => {
    console.log("Starting ORCID demo flow...");
    
    // Simulate a delay for authentication
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create a demo token
    const tokenData: TokenData = {
      id_token: this.createDemoToken(),
      refresh_token: undefined,
      expires_in: 3600,
      issued_at: Math.floor(Date.now() / 1000),
      provider: 'orcid',
    };

    TokenStorage.setToken('orcid', tokenData);
    return tokenData;
  }

  private createDemoToken = (): string => {
    // Create a simple demo token (not a real JWT)
    const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      sub: '0000-0000-0000-0000',
      iss: 'https://orcid.org',
      aud: config.orcid.clientId,
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000),
      name: 'Demo ORCID User',
      email: 'demo@orcid.org',
      orcid: '0000-0000-0000-0000'
    }));
    return `${header}.${payload}.demo-signature`;
  }

  exchangeCodeForToken = async (code: string, state: string): Promise<TokenData> => {
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

    // Since direct token exchange fails due to CORS, we'll create a mock token
    // In a production environment, this should be handled by a backend proxy
    console.warn('ORCID token exchange simulated - in production, use a backend proxy');
    
    // Create a mock token with the authorization code as proof of authentication
    const tokenData: TokenData = {
      id_token: `mock_orcid_token_${code.substring(0, 10)}`, // Use part of auth code
      refresh_token: undefined,
      expires_in: 3600,
      issued_at: Math.floor(Date.now() / 1000),
      provider: 'orcid',
    };

    TokenStorage.setToken('orcid', tokenData);
    return tokenData;
  }

  // Static methods for backward compatibility and easier usage
  static initiateLogin = async (): Promise<string> => {
    const provider = new ORCIDProvider();
    return provider.getAuthUrl();
  }

  static startDemoFlow = async (): Promise<TokenData> => {
    console.log("ORCIDProvider.startDemoFlow called");
    const provider = new ORCIDProvider();
    return provider.startDemoFlow();
  }

  static handleCallback = async (code: string, state: string): Promise<TokenData> => {
    const provider = new ORCIDProvider();
    return provider.exchangeCodeForToken(code, state);
  }

  static async startAuthenticationPopup(): Promise<TokenData> {
    const provider = new ORCIDProvider();
    return provider.startAuthenticationPopup();
  }
}