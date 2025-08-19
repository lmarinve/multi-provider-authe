import { config } from "@/lib/config";
import { TokenData, DeviceFlowResponse, TokenResponse } from "@/lib/types";
import { TokenStorage } from "@/lib/token-storage";

export class CILogonProvider {
  static async startDeviceFlow(): Promise<DeviceFlowResponse> {
    const params = new URLSearchParams({
      client_id: config.cilogon.clientId,
      scope: config.cilogon.scope,
    });

    const response = await fetch(config.cilogon.deviceCodeUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    if (!response.ok) {
      throw new Error(`Device flow failed: ${response.statusText}`);
    }

    return response.json();
  }

  static async pollForToken(deviceCode: string): Promise<TokenResponse> {
    const params = new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:device_code",
      device_code: deviceCode,
      client_id: config.cilogon.clientId,
    });

    const response = await fetch(config.cilogon.tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Token request failed");
    }

    return data;
  }

  static async exchangeForToken(deviceCode: string): Promise<TokenData> {
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
}