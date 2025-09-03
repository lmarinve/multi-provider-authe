import { config } from "@/lib/config";
import { TokenData } from "@/lib/types";
import { TokenStorage } from "@/lib/token-storage";

export class FabricProvider {
  authenticate = async (): Promise<TokenData> => {
    console.log("Starting FABRIC API authentication...");
    
    // Require a valid CILogon token for FABRIC authentication
    const cilogonToken = TokenStorage.getToken('cilogon');
    
    if (!cilogonToken || !TokenStorage.isTokenValid(cilogonToken)) {
      console.log("No valid CILogon token found for FABRIC authentication");
      throw new Error('FABRIC API authentication requires a valid CILogon token. Please authenticate with CILogon first.');
    }

    console.log("CILogon token found, proceeding with FABRIC authentication...");

    // Call FABRIC API to create token using CILogon token
    const response = await fetch(`${config.fabric.cmBase}${config.fabric.createPath}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${cilogonToken.id_token}`,
      },
      mode: 'cors',
      body: JSON.stringify({
        project_id: config.fabric.projectId,
        project_name: config.fabric.projectName,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`FABRIC API token creation failed: ${response.status} ${response.statusText} - ${errorText}`);
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
    console.log("FABRIC token created successfully");
    return tokenData;
  }

  refreshToken = async (): Promise<TokenData> => {
    const fabricToken = TokenStorage.getToken('fabric');
    
    if (!fabricToken?.refresh_token) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${config.fabric.cmBase}${config.fabric.refreshPath}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${fabricToken.refresh_token}`,
      },
      mode: 'cors',
      body: JSON.stringify({
        project_id: config.fabric.projectId,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`FABRIC API token refresh failed: ${error}`);
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

  static createToken = async (cilogonToken?: TokenData): Promise<TokenData> => {
    const provider = new FabricProvider();
    return provider.authenticate();
  }

  static refreshToken = async (): Promise<TokenData> => {
    const provider = new FabricProvider();
    return provider.refreshToken();
  }
}