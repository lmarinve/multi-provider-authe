import { config } from "@/lib/config";
import { TokenData, DeviceFlowResponse, TokenResponse } from "@/lib/types";
import { TokenStorage } from "@/lib/token-storage";

export class CILogonProvider {
  startDeviceFlow = async (): Promise<DeviceFlowResponse> => {
    console.log("Starting CILogon device flow...");
    
    try {
      const response = await fetch(config.cilogon.deviceCodeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: config.cilogon.clientId,
          scope: config.cilogon.scope,
        }),
      });

      if (!response.ok) {
        throw new Error(`CILogon device flow failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as DeviceFlowResponse;
      console.log("CILogon device flow started successfully");
      
      return data;
    } catch (error) {
      console.error("Failed to start CILogon device flow:", error);
      throw new Error("Failed to start CILogon device flow. Please try again.");
    }
  }

  pollForToken = async (deviceCode: string, interval: number = 5): Promise<TokenResponse> => {
    console.log("Polling for CILogon token...");
    
    const maxAttempts = 120; // 10 minutes with 5 second intervals
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      try {
        const response = await fetch(config.cilogon.tokenUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
            device_code: deviceCode,
            client_id: config.cilogon.clientId,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          console.log("CILogon token received successfully");
          return data as TokenResponse;
        }

        // Handle specific OAuth2 device flow errors
        if (data.error === 'authorization_pending') {
          console.log("Authorization pending, continuing to poll...");
        } else if (data.error === 'slow_down') {
          console.log("Rate limited, slowing down polling...");
          interval += 5; // Increase interval when rate limited
        } else if (data.error === 'access_denied') {
          throw new Error("Authorization was denied by the user");
        } else if (data.error === 'expired_token') {
          throw new Error("The device code has expired. Please try again.");
        } else {
          throw new Error(data.error_description || data.error || "Unknown error during token exchange");
        }

        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, interval * 1000));
        attempts++;
        
      } catch (error) {
        if (error instanceof Error && error.message.includes("Authorization was denied")) {
          throw error;
        }
        if (error instanceof Error && error.message.includes("expired")) {
          throw error;
        }
        
        console.error("Error polling for token:", error);
        attempts++;
        
        if (attempts >= maxAttempts) {
          throw new Error("Timeout waiting for authorization. Please try again.");
        }
        
        // Wait before retrying on error
        await new Promise(resolve => setTimeout(resolve, interval * 1000));
      }
    }
    
    throw new Error("Timeout waiting for authorization. Please try again.");
  }

  exchangeForToken = async (deviceCode: string, interval: number = 5): Promise<TokenData> => {
    const tokenResponse = await this.pollForToken(deviceCode, interval);
    
    if (!tokenResponse.id_token) {
      throw new Error("No ID token received from CILogon");
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

  static pollForToken = async (deviceCode: string, interval: number = 5): Promise<TokenResponse> => {
    const provider = new CILogonProvider();
    return provider.pollForToken(deviceCode, interval);
  }

  static exchangeForToken = async (deviceCode: string, interval: number = 5): Promise<TokenData> => {
    const provider = new CILogonProvider();
    return provider.exchangeForToken(deviceCode, interval);
  }
}