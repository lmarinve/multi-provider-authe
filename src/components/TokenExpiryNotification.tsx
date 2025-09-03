import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, RefreshCw, AlertTriangle } from 'lucide-react';
import { TokenStorage } from '@/lib/token-storage';
import { TokenData, Provider } from '@/lib/types';

interface TokenExpiryNotificationProps {
  warningMinutes?: number;
  className?: string;
}

export function TokenExpiryNotification({ 
  warningMinutes = 10, 
  className = "" 
}: TokenExpiryNotificationProps) {
  const [expiringTokens, setExpiringTokens] = useState<Array<{ provider: Provider; token: TokenData; timeLeft: string }>>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    const checkTokens = () => {
      const providers: Provider[] = ['cilogon', 'orcid'];
      const expiring: Array<{ provider: Provider; token: TokenData; timeLeft: string }> = [];

      providers.forEach(provider => {
        const token = TokenStorage.getToken(provider);
        if (token && TokenStorage.isTokenValid(token)) {
          const isNearExpiry = TokenStorage.isTokenNearExpiry(token, warningMinutes);
          const dismissKey = `${provider}-${token.issued_at}`;
          
          if (isNearExpiry && !dismissed.has(dismissKey)) {
            expiring.push({
              provider,
              token,
              timeLeft: TokenStorage.formatTimeUntilExpiry(token)
            });
          }
        }
      });

      setExpiringTokens(expiring);
    };

    // Check immediately and then every 30 seconds
    checkTokens();
    const interval = setInterval(checkTokens, 30000);
    return () => clearInterval(interval);
  }, [warningMinutes, dismissed]);

  const handleDismiss = (provider: Provider, issuedAt: number) => {
    const dismissKey = `${provider}-${issuedAt}`;
    setDismissed(prev => new Set([...prev, dismissKey]));
  };

  const handleRefresh = (provider: Provider) => {
    // Simple refresh by redirecting to login page
    window.location.href = `/multi-provider-authe/login?provider=${provider}`;
  };

  if (expiringTokens.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {expiringTokens.map(({ provider, token, timeLeft }) => (
        <Alert key={`${provider}-${token.issued_at}`} className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-orange-800">
                <strong>{provider.toUpperCase()}</strong> token expires in {timeLeft}
              </span>
              {TokenStorage.canRefreshToken(token) && (
                <Badge variant="secondary" className="text-xs">
                  Refresh available
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {TokenStorage.canRefreshToken(token) && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRefresh(provider)}
                  className="h-6 px-2 text-xs"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Refresh Now
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDismiss(provider, token.issued_at)}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
}