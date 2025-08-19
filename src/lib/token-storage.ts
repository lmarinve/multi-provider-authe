import { TokenData } from "./types";

const TOKEN_KEYS = {
  cilogon: "auth.cilogon",
  orcid: "auth.orcid",
  fabric: "auth.fabric"
} as const;

export class TokenStorage {
  static getToken(provider: keyof typeof TOKEN_KEYS): TokenData | null {
    try {
      const stored = localStorage.getItem(TOKEN_KEYS[provider]);
      if (!stored) return null;
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }

  static setToken(provider: keyof typeof TOKEN_KEYS, token: TokenData): void {
    localStorage.setItem(TOKEN_KEYS[provider], JSON.stringify(token));
  }

  static removeToken(provider: keyof typeof TOKEN_KEYS): void {
    localStorage.removeItem(TOKEN_KEYS[provider]);
  }

  static clearAllTokens(): void {
    Object.values(TOKEN_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  static isTokenValid(token: TokenData | null): boolean {
    if (!token) return false;
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = token.issued_at + token.expires_in;
    return expiresAt > now;
  }

  static getTokenExpiryDate(token: TokenData): Date {
    return new Date((token.issued_at + token.expires_in) * 1000);
  }
}

export function decodeJWT(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}