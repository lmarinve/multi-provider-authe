import { config } from "@/lib/config";
import { TokenData, DeviceFlowResponse, TokenResponse } from "@/lib/types";
import { TokenStorage } from "@/lib/token-storage";

export class CILogonProvider {
  startDeviceFlow = async (): Promise<DeviceFlowResponse> => {
    console.log("Starting CILogon device flow (demo mode)...");
    
    // For demo purposes, simulate the device flow API call
    // In production, this would make a real API call to CILogon
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate a device flow response
    const userCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const deviceCode = crypto.randomUUID();
    
    return {
      device_code: deviceCode,
      user_code: userCode,
      verification_uri: 'https://cilogon.org/device',
      verification_uri_complete: `https://cilogon.org/device?user_code=${userCode}`,
      expires_in: 600,
      interval: 5
    };
  }

  startDemoFlow = async (): Promise<DeviceFlowResponse> => {
    return this.startDeviceFlow();
  }

  pollForToken = async (deviceCode: string): Promise<TokenResponse> => {
    console.log("Polling for CILogon token (demo mode):", deviceCode.substring(0, 10) + "...");
    
    // Simulate polling - in a real app this would poll the CILogon token endpoint
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate success after some time
    return {
      id_token: this.createDemoToken(),
      access_token: 'demo_cilogon_access_' + crypto.randomUUID(),
      refresh_token: 'demo_cilogon_refresh_' + crypto.randomUUID(),
      expires_in: 3600,
      token_type: 'Bearer'
    };
  }

  private createDemoToken = (): string => {
    // Create a simple demo token (not a real JWT)
    const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      sub: 'demo-user@university.edu',
      iss: 'https://cilogon.org',
      aud: config.cilogon.clientId,
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000),
      name: 'Demo University User',
      email: 'demo-user@university.edu',
      idp: 'Demo University',
      idp_name: 'Demo University Identity Provider'
    }));
    return `${header}.${payload}.demo-signature`;
  }

  exchangeForToken = async (deviceCode: string): Promise<TokenData> => {
    const tokenResponse = await this.pollForToken(deviceCode);
    
    if (!tokenResponse.id_token) {
      throw new Error("No ID token received");
    }

    const tokenData: TokenData = {
      id_token: tokenResponse.id_token,
      refresh_token: tokenResponse.refresh_token,
      expires_in: tokenResponse.expires_in || 3600,
      issued_at: Math.floor(Date.now() / 1000),
      provider: "cilogon",
    };

    TokenStorage.setToken("cilogon", tokenData);
    return tokenData;
  }

  // Keep static methods for backward compatibility
  static startDeviceFlow = async (): Promise<DeviceFlowResponse> => {
    const provider = new CILogonProvider();
    return provider.startDemoFlow();
  }

  static startDemoFlow = async (): Promise<DeviceFlowResponse> => {
    const provider = new CILogonProvider();
    return provider.startDemoFlow();
  }

  static pollForToken = async (deviceCode: string): Promise<TokenResponse> => {
    const provider = new CILogonProvider();
    return provider.pollForToken(deviceCode);
  }

  static exchangeForToken = async (deviceCode: string): Promise<TokenData> => {
    const provider = new CILogonProvider();
    return provider.exchangeForToken(deviceCode);
  }
}