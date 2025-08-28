import { config } from "@/lib/config";
import { TokenData, DeviceFlowResponse, TokenResponse } from "@/lib/types";
import { TokenStorage } from "@/lib/token-storage";

export class CILogonProvider {
  startDeviceFlow = async (): Promise<DeviceFlowResponse> => {
    const params = new URLSearchParams({
      client_id: config.cilogon.clientId,
      scope: config.cilogon.scope,
    });

    try {
      const response = await fetch(config.cilogon.deviceCodeUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept": "application/json",
        },
        mode: "cors",
        body: params,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Device flow failed: ${response.statusText}. ${errorText}`);
      }

      return await response.json();
    } catch (error: any) {
      // Handle network/CORS errors
      if (error.name === 'TypeError' && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
        throw new Error(`Network error connecting to CILogon: ${error.message}. This may be due to CORS restrictions or network connectivity issues.`);
      }
      throw error;
    }
  }

  pollForToken = async (deviceCode: string): Promise<TokenResponse> => {
    const params = new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:device_code",
      device_code: deviceCode,
      client_id: config.cilogon.clientId,
    });

    const response = await fetch(config.cilogon.tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
      },
      mode: "cors",
      body: params,
    });

    const data = await response.json();

    if (!response.ok) {
      // Create an error object that matches the expected format
      const error = new Error(data.error_description || data.error || "Token request failed");
      (error as any).error = data.error;
      (error as any).error_description = data.error_description;
      throw error;
    }

    return data;
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
    return provider.startDeviceFlow();
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