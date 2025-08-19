// Environment configuration
export const config = {
  environments: ["test", "production"] as const,
  defaultEnv: "test" as const,
  
  // Backend URLs
  backend: {
    test: "https://sdxapi.atlanticwave-sdx.ai/",
    production: "https://sdxapi.atlanticwave-sdx.ai/"
  },
  tokenHandoffPath: "/auth/oidc-token",
  
  // CILogon
  cilogon: {
    clientId: "APP-S3BU1LVHOTHITEU2",
    scope: "openid email profile",
    deviceCodeUrl: "https://cilogon.org/oauth2/device/code",
    tokenUrl: "https://cilogon.org/oauth2/token"
  },
  
  // ORCID
  orcid: {
    clientId: "APP-S3BU1LVHOTHITEU2",
    issuerUrl: "https://orcid.org",
    authUrl: "https://orcid.org/oauth/authorize",
    tokenUrl: "https://orcid.org/oauth/token",
    scope: "openid email profile",
    usePkce: true
  },
  
  // FABRIC API
  fabric: {
    cmBase: "https://cm.fabric-testbed.net",
    createPath: "/tokens/create",
    refreshPath: "/tokens/refresh",
    projectId: "1ecd9d6a-7701-40fa-b78e-b2293c9526ed",
    projectName: "AtlanticWave-SDX",
    tokenPath: "/home/fabric/.tokens.json"
  }
} as const;

export type Environment = typeof config.environments[number];
export type Provider = "cilogon" | "orcid" | "fabric";