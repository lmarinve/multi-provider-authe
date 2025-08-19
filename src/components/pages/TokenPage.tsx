import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Environment } from "@/lib/config";
import { TokenData, TokenClaims } from "@/lib/types";
import { TokenStorage, decodeJWT } from "@/lib/token-storage";
import { sendTokenToBackend } from "@/lib/backend";
import { 
  ArrowLeft, 
  Clock, 
  User, 
  At, 
  Calendar,
  Send,
  Trash,
  RefreshCw,
  CheckCircle,
  XCircle,
  University,
  Fingerprint,
  Shield
} from "@phosphor-icons/react";

interface TokenPageProps {
  environment: Environment;
  onEnvironmentChange: (env: Environment) => void;
  onBack: () => void;
}

const providerIcons = {
  cilogon: University,
  orcid: Fingerprint,
  fabric: Shield,
};

export function TokenPage({ environment, onEnvironmentChange, onBack }: TokenPageProps) {
  const [tokens, setTokens] = useState<{
    cilogon?: TokenData;
    orcid?: TokenData;
    fabric?: TokenData;
  }>({});
  const [selectedToken, setSelectedToken] = useState<TokenData | null>(null);
  const [claims, setClaims] = useState<TokenClaims | null>(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    loadTokens();
  }, []);

  useEffect(() => {
    if (selectedToken) {
      const tokenClaims = decodeJWT(selectedToken.id_token);
      setClaims(tokenClaims);
    } else {
      setClaims(null);
    }
  }, [selectedToken]);

  const loadTokens = () => {
    const cilogon = TokenStorage.getToken("cilogon");
    const orcid = TokenStorage.getToken("orcid");
    const fabric = TokenStorage.getToken("fabric");

    const validTokens: any = {};
    
    if (cilogon && TokenStorage.isTokenValid(cilogon)) {
      validTokens.cilogon = cilogon;
    }
    if (orcid && TokenStorage.isTokenValid(orcid)) {
      validTokens.orcid = orcid;
    }
    if (fabric && TokenStorage.isTokenValid(fabric)) {
      validTokens.fabric = fabric;
    }

    setTokens(validTokens);

    // Auto-select the first valid token
    const firstToken = Object.values(validTokens)[0] as TokenData | undefined;
    if (firstToken && !selectedToken) {
      setSelectedToken(firstToken);
    }
  };

  const handleSendToBackend = async () => {
    if (!selectedToken) return;

    setIsSending(true);
    try {
      const response = await sendTokenToBackend(selectedToken, environment);
      
      if (response.ok) {
        const result = await response.json();
        toast.success("Token sent to backend successfully!");
        console.log("Backend response:", result);
      } else {
        const error = await response.text();
        toast.error(`Backend request failed: ${response.status} ${response.statusText}`);
        console.error("Backend error:", error);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to send token";
      toast.error(`Network error: ${message}`);
      console.error("Send token error:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleClearAllTokens = () => {
    TokenStorage.clearAllTokens();
    setTokens({});
    setSelectedToken(null);
    setClaims(null);
    toast.success("All tokens cleared");
  };

  const handleSwitchEnvironment = () => {
    const newEnv = environment === "test" ? "production" : "test";
    onEnvironmentChange(newEnv);
    toast.success(`Switched to ${newEnv} environment`);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const getTokenStatus = (token: TokenData) => {
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = token.issued_at + token.expires_in;
    const isValid = expiresAt > now;
    const timeUntilExpiry = expiresAt - now;

    return {
      isValid,
      expiresAt: new Date(expiresAt * 1000),
      timeUntilExpiry,
      isExpiringSoon: timeUntilExpiry < 300 // Less than 5 minutes
    };
  };

  const availableTokens = Object.entries(tokens);

  if (availableTokens.length === 0) {
    return (
      <div className="container mx-auto px-6 py-12 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">SDX Multi Provider Authentication</h1>
        </div>
        
        <Button variant="ghost" onClick={onBack} className="mb-8 -ml-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to selection
        </Button>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>No Valid Tokens</CardTitle>
            <CardDescription>
              You don't have any valid tokens. Please authenticate with a provider first.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <Button onClick={onBack} className="w-full" size="lg">
              Go Back to Authentication
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">SDX Multi Provider Authentication</h1>
      </div>
      
      <Button variant="ghost" onClick={onBack} className="mb-8 -ml-2">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to selection
      </Button>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Token Selection */}
        <Card className="shadow-sm">
          <CardHeader className="pb-6">
            <CardTitle>Available Tokens</CardTitle>
            <CardDescription>
              Select a token to view details and send to backend
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            {availableTokens.map(([provider, token]) => {
              const Icon = providerIcons[provider as keyof typeof providerIcons];
              const status = getTokenStatus(token);
              const isSelected = selectedToken?.provider === provider;

              return (
                <div
                  key={provider}
                  className={`p-5 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
                    isSelected ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedToken(token)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-primary rounded-full text-primary-foreground">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium text-base">{provider === 'fabric' ? 'FABRIC API' : provider.toUpperCase()}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Expires {status.expiresAt.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {status.isExpiringSoon && (
                        <Badge variant="destructive" className="text-xs">
                          Expiring Soon
                        </Badge>
                      )}
                      {status.isValid ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Token Details */}
        {selectedToken && claims && (
          <Card className="shadow-sm">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-2">
                Token Details
                <Badge variant="secondary">{environment}</Badge>
              </CardTitle>
              <CardDescription>
                Claims and metadata for the selected token
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-0">
              <div className="space-y-5">
                {claims.sub && (
                  <div className="flex items-start gap-3">
                    <User className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium mb-1">Subject</div>
                      <div className="text-sm text-muted-foreground break-all">
                        {claims.sub}
                      </div>
                    </div>
                  </div>
                )}

                {claims.email && (
                  <div className="flex items-start gap-3">
                    <At className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium mb-1">Email</div>
                      <div className="text-sm text-muted-foreground">
                        {claims.email}
                      </div>
                    </div>
                  </div>
                )}

                {claims.iss && (
                  <div className="flex items-start gap-3">
                    <Shield className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium mb-1">Issuer</div>
                      <div className="text-sm text-muted-foreground break-all">
                        {claims.iss}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium mb-1">Issued At</div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(selectedToken.issued_at)}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium mb-1">Expires At</div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(selectedToken.issued_at + selectedToken.expires_in)}
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <Button
                  onClick={handleSendToBackend}
                  disabled={isSending}
                  className="w-full"
                  size="lg"
                >
                  {isSending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Token to Backend
                    </>
                  )}
                </Button>

                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" onClick={handleSwitchEnvironment}>
                    Switch to {environment === "test" ? "Production" : "Test"}
                  </Button>
                  <Button variant="outline" onClick={handleClearAllTokens}>
                    <Trash className="h-4 w-4 mr-2" />
                    Clear All Tokens
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Backend Configuration Info */}
      <Card className="mt-8 shadow-sm">
        <CardHeader>
          <CardTitle>Current Configuration</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium">Environment</div>
              <div className="text-muted-foreground">{environment}</div>
            </div>
            <div>
              <div className="font-medium">Backend URL</div>
              <div className="text-muted-foreground break-all">
                {environment === "test" 
                  ? "https://sdxapi.atlanticwave-sdx.ai/" 
                  : "https://sdxapi.atlanticwave-sdx.ai/"
                }
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}