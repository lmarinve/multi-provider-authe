import { AuthToken, Provider } from "./types";

const TOKEN_KEYS = {
  cilogon: "auth.cilogon",
  orcid: "auth.orcid"
};

export const saveToken = (provider: Provider, token: AuthToken): void => {
  try {
    const tokenData = {
      ...token,
      issued_at: Date.now()
    };
    localStorage.setItem(TOKEN_KEYS[provider], JSON.stringify(tokenData));
  } catch (error) {
    console.error(`Failed to save ${provider} token:`, error);
    throw new Error(`Failed to save authentication token`);
  }
};

export const getToken = (provider: Provider): AuthToken | null => {
  try {
    const stored = localStorage.getItem(TOKEN_KEYS[provider]);
    if (!stored) return null;

    const token: AuthToken = JSON.parse(stored);
    
    // Check if token is expired
    const now = Date.now();
    const expiresAt = token.issued_at + (token.expires_in * 1000);
    
    if (now >= expiresAt) {
      localStorage.removeItem(TOKEN_KEYS[provider]);
      return null;
    }
    
    return token;
  } catch (error) {
    console.error(`Failed to retrieve ${provider} token:`, error);
    localStorage.removeItem(TOKEN_KEYS[provider]);
    return null;
  }
};

export const deleteToken = (provider: Provider): void => {
  localStorage.removeItem(TOKEN_KEYS[provider]);
};

export const clearAllTokens = (): void => {
  Object.values(TOKEN_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
};

export const getAllTokens = (): Partial<Record<Provider, AuthToken>> => {
  const tokens: Partial<Record<Provider, AuthToken>> = {};
  
  (Object.keys(TOKEN_KEYS) as Provider[]).forEach(provider => {
    const token = getToken(provider);
    if (token) {
      tokens[provider] = token;
    }
  });
  
  return tokens;
};