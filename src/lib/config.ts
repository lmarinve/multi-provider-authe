// Application configuration
export const config = {
  // Backend URL
  backend: {
    baseUrl: "https://sdxapi.atlanticwave-sdx.ai/"
  },
  tokenHandoffPath: "/auth/oidc-token",
  
  // Get the current base URL dynamically
  getBaseUrl: () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return "https://lmarinve.github.io";
  },
  
  // CILogon - Updated with correct OIDC settings
  cilogon: {
    clientId: "cilogon:/client_id/e33e29a20f84e0edd144d1e9a6e2b0",
    scope: "openid", // Strict scopes - only openid works
    authUrl: "https://cilogon.org/authorize",
    tokenUrl: "https://cilogon.org/oauth2/token",
    jwksUrl: "https://cilogon.org/oauth2/certs",
    issuerUrl: "https://cilogon.org",
    redirectUri: "https://lmarinve.github.io/multi-provider-authe/auth/callback/cilogon", // Updated to match current GitHub Pages URL structure
    usePkce: true // PKCE is required with S256
  },
  
  // ORCID - Using sandbox environment for testing
  orcid: {
    clientId: "APP-S3BU1LVHOTHITEU2", // Updated with proper ORCID client ID
    issuerUrl: "https://orcid.org",
    authUrl: "https://orcid.org/oauth/authorize", 
    tokenUrl: "https://orcid.org/oauth/token",
    scope: "/authenticate",
    get redirectUri() {
      return `${config.getBaseUrl()}/multi-provider-authe/auth/callback/orcid`;
    },
    usePkce: true
  },
  
  // Connection services (used after obtaining identity tokens)
  connections: {
    fabric: {
      cmBase: "https://cm.fabric-testbed.net",
      createPath: "/tokens/create",
      refreshPath: "/tokens/refresh",
      projectId: "1ecd9d6a-7701-40fa-b78e-b2293c9526ed",
      projectName: "AtlanticWave-SDX",
      tokenPath: "/home/fabric/.tokens.json"
    },
    meican: {
      baseUrl: "https://meican.rnp.br",
      authUrl: "https://meican.rnp.br/auth/login",
      apiUrl: "https://meican.rnp.br/api/v1"
    }
  }
} as const;

export type Provider = "cilogon" | "orcid";