import { config } from "@/lib/config";
import { TokenData } from "@/lib/types";
import { TokenStorage } from "@/lib/token-storage";

export class FabricProvider {
  static async createToken(): Promise<TokenData> {
    const cilogonToken = TokenStorage.getToken('cilogon');
    
    if (!cilogonToken || !TokenStorage.isTokenValid(cilogonToken)) {
      throw new Error('Valid CILogon token required for FABRIC authentication');
    }

    const response = await fetch(`${config.fabric.cmBase}${config.fabric.createPath}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cilogonToken.id_token}`,
      },
      body: JSON.stringify({
        project_id: config.fabric.projectId,
        project_name: config.fabric.projectName,
        scope: 'all',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`FABRIC token creation failed: ${error}`);
    }

    const tokenResponse = await response.json();

    const tokenData: TokenData = {
      id_token: tokenResponse.id_token || tokenResponse.access_token,
      refresh_token: tokenResponse.refresh_token,
      expires_in: tokenResponse.expires_in || 3600,
      issued_at: Math.floor(Date.now() / 1000),
      provider: 'fabric',
    };

    TokenStorage.setToken('fabric', tokenData);
    return tokenData;
  }

  static async refreshToken(): Promise<TokenData> {
    const fabricToken = TokenStorage.getToken('fabric');
    
    if (!fabricToken?.refresh_token) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${config.fabric.cmBase}${config.fabric.refreshPath}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${fabricToken.refresh_token}`,
      },
      body: JSON.stringify({
        project_id: config.fabric.projectId,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`FABRIC token refresh failed: ${error}`);
    }

    const tokenResponse = await response.json();

    const tokenData: TokenData = {
      id_token: tokenResponse.id_token || tokenResponse.access_token,
      refresh_token: tokenResponse.refresh_token || fabricToken.refresh_token,
      expires_in: tokenResponse.expires_in || 3600,
      issued_at: Math.floor(Date.now() / 1000),
      provider: 'fabric',
    };

    TokenStorage.setToken('fabric', tokenData);
    return tokenData;
  }
}