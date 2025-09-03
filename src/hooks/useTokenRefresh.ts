import { useEffect, useCallback, useRef } from 'react';
import { useKV } from '@github/spark/hooks';
import { AuthToken, Provider } from '@/lib/types';
import { getToken, saveToken } from '@/lib/token-storage';
import { toast } from 'sonner';

interface TokenRefreshConfig {
  // How many minutes before expiry to refresh (default: 5 minutes)
  refreshBeforeExpiryMinutes?: number;
  // How often to check for token expiry (default: 1 minute)
  checkIntervalMinutes?: number;
  // Whether to show notifications when tokens are refreshed
  showNotifications?: boolean;
}

interface TokenRefreshStatus {
  isRefreshing: boolean;
  lastRefresh: Record<Provider, number>;
  refreshErrors: Record<Provider, string | null>;
}

/**
 * Hook to automatically refresh tokens when they are near expiry
 */
export function useTokenRefresh(config: TokenRefreshConfig = {}) {
  const {
    refreshBeforeExpiryMinutes = 5,
    checkIntervalMinutes = 1,
    showNotifications = true
  } = config;

  const [refreshStatus, setRefreshStatus] = useKV<TokenRefreshStatus>('token-refresh-status', {
    isRefreshing: false,
    lastRefresh: { cilogon: 0, orcid: 0 },
    refreshErrors: { cilogon: null, orcid: null }
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const refreshingRef = useRef<Set<Provider>>(new Set());

  const refreshToken = useCallback(async (provider: Provider): Promise<boolean> => {
    // Prevent concurrent refresh for the same provider
    if (refreshingRef.current.has(provider)) {
      console.log(`Token refresh already in progress for ${provider}`);
      return false;
    }

    refreshingRef.current.add(provider);
    
    try {
      setRefreshStatus(prev => ({
        ...prev,
        isRefreshing: true,
        refreshErrors: { ...prev.refreshErrors, [provider]: null }
      }));

      let newToken: AuthToken;

      switch (provider) {
        case 'cilogon':
          // CILogon tokens typically have long expiry, but we can try to refresh if refresh_token exists
          const cilogonToken = getToken('cilogon');
          if (cilogonToken?.refresh_token) {
            // Implement CILogon refresh token flow
            newToken = await refreshCILogonToken(cilogonToken.refresh_token);
          } else {
            throw new Error('CILogon refresh token not available. Manual re-authentication required.');
          }
          break;
          
        case 'orcid':
          // ORCID tokens can be refreshed if refresh_token exists
          const orcidToken = getToken('orcid');
          if (orcidToken?.refresh_token) {
            newToken = await refreshORCIDToken(orcidToken.refresh_token);
          } else {
            throw new Error('ORCID refresh token not available. Manual re-authentication required.');
          }
          break;
          
        default:
          throw new Error(`Unsupported provider for refresh: ${provider}`);
      }

      setRefreshStatus(prev => ({
        ...prev,
        lastRefresh: { ...prev.lastRefresh, [provider]: Date.now() },
        refreshErrors: { ...prev.refreshErrors, [provider]: null }
      }));

      if (showNotifications) {
        toast.success(`${provider.toUpperCase()} token refreshed successfully`);
      }

      console.log(`Successfully refreshed ${provider} token`);
      return true;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown refresh error';
      console.error(`Failed to refresh ${provider} token:`, errorMessage);

      setRefreshStatus(prev => ({
        ...prev,
        refreshErrors: { ...prev.refreshErrors, [provider]: errorMessage }
      }));

      if (showNotifications) {
        toast.error(`Failed to refresh ${provider.toUpperCase()} token: ${errorMessage}`);
      }

      return false;
    } finally {
      refreshingRef.current.delete(provider);
      setRefreshStatus(prev => ({
        ...prev,
        isRefreshing: refreshingRef.current.size > 0
      }));
    }
  }, [setRefreshStatus, showNotifications]);

  const checkTokens = useCallback(async () => {
    const providers: Provider[] = ['cilogon', 'orcid'];
    const now = Math.floor(Date.now() / 1000);
    const refreshThreshold = refreshBeforeExpiryMinutes * 60; // Convert to seconds

    for (const provider of providers) {
      const token = getToken(provider);
      
      if (!token) continue;

      const expiresAt = token.issued_at + token.expires_in;
      const timeUntilExpiry = expiresAt - now;

      // Check if token needs refresh
      if (timeUntilExpiry <= refreshThreshold && timeUntilExpiry > 0) {
        console.log(`Token for ${provider} expires in ${Math.floor(timeUntilExpiry / 60)} minutes, attempting refresh...`);
        
        // Only attempt refresh if we have a refresh token
        if (token.refresh_token) {
          await refreshToken(provider);
        } else {
          console.log(`No refresh token available for ${provider}, manual re-authentication will be required`);
          
          if (showNotifications && timeUntilExpiry <= 300) { // 5 minutes warning
            toast.warning(`${provider.toUpperCase()} token expires soon. Please re-authenticate manually.`);
          }
        }
      }
    }
  }, [refreshToken, refreshBeforeExpiryMinutes, showNotifications]);

  // Start the token refresh monitoring
  useEffect(() => {
    // Initial check
    checkTokens();

    // Set up periodic checking
    intervalRef.current = setInterval(() => {
      checkTokens();
    }, checkIntervalMinutes * 60 * 1000); // Convert to milliseconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [checkTokens, checkIntervalMinutes]);

  const manualRefresh = useCallback(async (provider: Provider) => {
    return await refreshToken(provider);
  }, [refreshToken]);

  const isTokenNearExpiry = useCallback((provider: Provider, warningMinutes: number = refreshBeforeExpiryMinutes): boolean => {
    const token = getToken(provider);
    if (!token) return false;

    const now = Math.floor(Date.now() / 1000);
    const expiresAt = token.issued_at + token.expires_in;
    const timeUntilExpiry = expiresAt - now;

    return timeUntilExpiry <= (warningMinutes * 60) && timeUntilExpiry > 0;
  }, [refreshBeforeExpiryMinutes]);

  return {
    refreshStatus,
    manualRefresh,
    isTokenNearExpiry,
    checkTokens
  };
}

/**
 * Refresh CILogon token using refresh token
 */
async function refreshCILogonToken(refreshToken: string): Promise<AuthToken> {
  const response = await fetch('https://cilogon.org/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: 'cilogon:/client_id/e33e29a20f84e0edd144d1e9a6e2b0',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`CILogon token refresh failed: ${error}`);
  }

  const tokenResponse = await response.json();

  const tokenData: AuthToken = {
    id_token: tokenResponse.id_token || tokenResponse.access_token,
    refresh_token: tokenResponse.refresh_token || refreshToken, // Keep existing if not provided
    expires_in: tokenResponse.expires_in || 3600,
    issued_at: Math.floor(Date.now() / 1000),
    provider: 'cilogon',
  };

  saveToken('cilogon', tokenData);
  return tokenData;
}

/**
 * Refresh ORCID token using refresh token
 */
async function refreshORCIDToken(refreshToken: string): Promise<AuthToken> {
  const response = await fetch('https://orcid.org/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: 'APP-S3BU1LVHOTHITEU2',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ORCID token refresh failed: ${error}`);
  }

  const tokenResponse = await response.json();

  const tokenData: AuthToken = {
    id_token: tokenResponse.id_token || tokenResponse.access_token,
    refresh_token: tokenResponse.refresh_token || refreshToken, // Keep existing if not provided
    expires_in: tokenResponse.expires_in || 3600,
    issued_at: Math.floor(Date.now() / 1000),
    provider: 'orcid',
  };

  saveToken('orcid', tokenData);
  return tokenData;
}