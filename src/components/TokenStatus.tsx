import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle2, RefreshCw, Clock, AlertCircle } from 'lucide-react';
import { TokenStorage } from '@/lib/token-storage';
import { TokenData, Provider } from '@/lib/types';
import { useTokenRefresh } from '@/hooks/useTokenRefresh';

interface TokenStatusProps {
  providers?: Provider[];
  showRefreshButtons?: boolean;
  compact?: boolean;
}

export function TokenStatus({ 
  providers = ['cilogon', 'orcid', 'fabric'], 
  showRefreshButtons = true,
  compact = false 
}: TokenStatusProps) {
  const [tokens, setTokens] = useState<Record<string, TokenData | null>>({});
  
  const { refreshStatus, manualRefresh, isTokenNearExpiry } = useTokenRefresh({
    showNotifications: true,
    refreshBeforeExpiryMinutes: 5
  });

  // Update token status every second
  useEffect(() => {
    const updateTokens = () => {
      const newTokens: Record<string, TokenData | null> = {};
      providers.forEach(provider => {
        newTokens[provider] = TokenStorage.getToken(provider);
      });
      setTokens(newTokens);
    };

    updateTokens();
    const interval = setInterval(updateTokens, 1000);
    return () => clearInterval(interval);
  }, [providers]);

  const getTokenStatusInfo = (provider: Provider, token: TokenData | null) => {
    if (!token) {
      return {
        status: 'missing' as const,
        color: 'text-muted-foreground',
        bgColor: 'bg-muted',
        icon: AlertCircle,
        message: 'Not authenticated'
      };
    }

    const isValid = TokenStorage.isTokenValid(token);
    const isNearExpiry = isTokenNearExpiry(provider, 15); // 15 minute warning
    const canRefresh = TokenStorage.canRefreshToken(token);

    if (!isValid) {
      return {
        status: 'expired' as const,
        color: 'text-destructive',
        bgColor: 'bg-destructive/10',
        icon: AlertTriangle,
        message: 'Token expired'
      };
    }

    if (isNearExpiry) {
      return {
        status: 'warning' as const,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        icon: AlertTriangle,
        message: canRefresh ? 'Expires soon (auto-refresh enabled)' : 'Expires soon (manual auth required)'
      };
    }

    return {
      status: 'valid' as const,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      icon: CheckCircle2,
      message: 'Valid'
    };
  };

  const handleRefresh = async (provider: Provider) => {
    await manualRefresh(provider);
  };

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {providers.map((provider) => {
          const token = tokens[provider];
          const statusInfo = getTokenStatusInfo(provider, token);
          const Icon = statusInfo.icon;
          const isRefreshing = refreshStatus.isRefreshing && refreshStatus.refreshErrors[provider] === null;

          return (
            <Badge 
              key={provider} 
              variant="outline" 
              className={`${statusInfo.bgColor} ${statusInfo.color} border-current`}
            >
              <Icon className="w-3 h-3 mr-1" />
              {provider === 'fabricConnection' ? 'FABRIC-CONN' : 
               provider === 'meican' ? 'MEICAN' :
               provider.toUpperCase()}: {statusInfo.message}
              {token && (
                <span className="ml-1 text-xs">
                  ({TokenStorage.formatTimeUntilExpiry(token)})
                </span>
              )}
            </Badge>
          );
        })}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Token Status
          {refreshStatus.isRefreshing && (
            <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {providers.map((provider) => {
          const token = tokens[provider];
          const statusInfo = getTokenStatusInfo(provider, token);
          const Icon = statusInfo.icon;
          const canRefresh = token && TokenStorage.canRefreshToken(token);
          const isRefreshing = refreshStatus.isRefreshing && refreshStatus.refreshErrors[provider] === null;
          const refreshError = refreshStatus.refreshErrors[provider];

          return (
            <div key={provider} className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${statusInfo.color}`} />
                <div>
                  <div className="font-medium">
                    {provider === 'fabricConnection' ? 'FABRIC Connection' : 
                     provider === 'meican' ? 'MEICAN' :
                     provider === 'fabric' ? 'FABRIC API' :
                     provider.toUpperCase()}
                  </div>
                  <div className={`text-sm ${statusInfo.color}`}>
                    {statusInfo.message}
                  </div>
                  {token && (
                    <div className="text-xs text-muted-foreground">
                      Expires: {TokenStorage.getTokenExpiryDate(token).toLocaleString()}
                    </div>
                  )}
                  {refreshError && (
                    <div className="text-xs text-destructive mt-1">
                      Refresh failed: {refreshError}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {token && (
                  <Badge variant="secondary" className="text-xs">
                    {TokenStorage.formatTimeUntilExpiry(token)}
                  </Badge>
                )}
                
                {showRefreshButtons && canRefresh && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRefresh(provider)}
                    disabled={isRefreshing}
                    className="h-8"
                  >
                    {isRefreshing ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <>
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Refresh
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          );
        })}

        {refreshStatus.isRefreshing && (
          <div className="text-sm text-blue-600 flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Refreshing tokens...
          </div>
        )}
      </CardContent>
    </Card>
  );
}