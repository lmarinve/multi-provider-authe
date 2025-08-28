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
      redirect_uri: `${window.location.origin}/login?provider=orcid`,
      scope: config.orcid.scope,
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    return `${config.orcid.authUrl}?${params}`;
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

    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: config.orcid.clientId,
      code,
      redirect_uri: `${window.location.origin}/login?provider=orcid`,
      code_verifier: codeVerifier,
    });

    try {
      const response = await fetch(config.orcid.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        mode: 'cors',
        body: params,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('ORCID token exchange failed:', response.status, errorText);
        throw new Error(`Token exchange failed: ${response.status} ${response.statusText}. ${errorText}`);
      }

      const tokenResponse: TokenResponse = await response.json();
      console.log('ORCID token response:', tokenResponse);

      // ORCID may not return an id_token, use access_token instead
      const token = tokenResponse.id_token || tokenResponse.access_token;
      if (!token) {
        throw new Error('No token received from ORCID');
      }

      const tokenData: TokenData = {
        id_token: token,
        refresh_token: tokenResponse.refresh_token,
        expires_in: tokenResponse.expires_in || 3600,
        issued_at: Math.floor(Date.now() / 1000),
        provider: 'orcid',
      };

      TokenStorage.setToken('orcid', tokenData);
      return tokenData;
    } catch (error) {
      console.error('ORCID token exchange error:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to ORCID. This may be due to CORS restrictions or network issues.');
      }
      throw error;
    }
  }

  static handleCallback = async (code: string, state: string): Promise<TokenData> => {
    const provider = new ORCIDProvider();
    return provider.exchangeCodeForToken(code, state);
  }
}