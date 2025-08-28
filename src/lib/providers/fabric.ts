import { config } from "@/lib/config";
import { TokenData } from "@/lib/types";
import { TokenStorage } from "@/lib/token-storage";

export class FabricProvider {
  authenticate = async (): Promise<TokenData> => {
    console.log("Starting FABRIC API authentication (demo mode)...");
    
    // For demo purposes, simulate FABRIC API authentication
    // In production, this would require a valid CILogon token and make real API calls
    
    // Simulate checking for CILogon token
    const cilogonToken = TokenStorage.getToken('cilogon');
    
    if (!cilogonToken || !TokenStorage.isTokenValid(cilogonToken)) {
      // For demo, create a simulated CILogon token if one doesn't exist
      console.log("No valid CILogon token found for FABRIC authentication");
      throw new Error('FABRIC API authentication requires a valid CILogon token. Please authenticate with CILogon first.');
    }

    console.log("CILogon token found, proceeding with FABRIC authentication...");

    // Simulate FABRIC API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const tokenData: TokenData = {
      id_token: this.createDemoToken(),
      refresh_token: 'demo_fabric_refresh_' + crypto.randomUUID(),
      expires_in: 3600,
      issued_at: Math.floor(Date.now() / 1000),
      provider: 'fabric',
    };

    TokenStorage.setToken('fabric', tokenData);
    console.log("FABRIC token created successfully");
    return tokenData;
  }

  private createDemoToken = (): string => {
    // Create a simple demo token (not a real JWT)
    const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      sub: 'demo-fabric-user',
      iss: 'https://cm.fabric-testbed.net',
      aud: 'fabric-api',
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000),
      project_id: config.fabric.projectId,
      project_name: config.fabric.projectName,
      scope: 'all'
    }));
    return `${header}.${payload}.demo-signature`;
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

  // Keep static methods for backward compatibility
  static createToken = async (): Promise<TokenData> => {
    const provider = new FabricProvider();
    return provider.authenticate();
  }

  static refreshToken = async (): Promise<TokenData> => {
    const provider = new FabricProvider();
    return provider.refreshToken();
  }
}