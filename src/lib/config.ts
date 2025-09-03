import { Provider } from "./types";

const BASE_URLS = {
  test: "https://sdxapi.atlanticwave-sdx.ai/",
  production: "https://sdxapi.atlanticwave-sdx.ai/"
};

export const getCurrentEnvironment = (): "test" | "production" => {
  return "test"; // Default environment
};

export const getBackendUrl = (env: "test" | "production" = getCurrentEnvironment()) => {
  return BASE_URLS[env] + "auth/oidc-token";
};

export const getProviderConfig = (provider: Provider) => {
  const configs = {
    cilogon: {
      clientId: "cilogon:/client_id/e33e29a20f84e0edd144d1e9a6e2b0",
      scope: "openid",
      authUrl: "https://cilogon.org/authorize",
      tokenUrl: "https://cilogon.org/oauth2/token",
      redirectUri: "https://lmarinve.github.io/multi-provider-authe/auth/callback/cilogon"
    },
    orcid: {
      clientId: "APP-S3BU1LVHOTHITEU2",
      scope: "openid",
      authUrl: "https://orcid.org/oauth/authorize",
      tokenUrl: "https://orcid.org/oauth/token",
      redirectUri: window.location.origin + "/auth/callback/orcid"
    }
  };

  return configs[provider];
};