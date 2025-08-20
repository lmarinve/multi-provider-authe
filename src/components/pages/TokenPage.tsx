import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { TokenData, TokenClaims } from "@/lib/types";
import { TokenStorage, decodeJWT } from "@/lib/token-storage";
import { sendTokenToBackend } from "@/lib/backend";

interface TokenPageProps {
  onBack: () => void;
}

export function TokenPage({ onBack }: TokenPageProps) {
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
      const response = await sendTokenToBackend(selectedToken);
      
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
      <div className="container mx-auto px-6 py-16 max-w-3xl bg-[rgb(255,255,255)] min-h-screen">
      {/* Header */}
      <div className="text-center space-y-4 mb-12">
        <div className="flex flex-col items-center space-y-6">
          {/* Title with custom colors */}
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight leading-tight flex items-center gap-1">
            <span 
              className="px-3 py-1 rounded-md"
              style={{ 
                color: 'rgb(50, 135, 200)', 
                backgroundColor: 'rgb(255, 255, 255)' 
              }}
            >
              AtlanticWave
            </span>
            <span 
              className="px-1 py-1"
              style={{ 
                color: 'rgb(255, 255, 255)', 
                backgroundColor: 'rgb(255, 255, 255)' 
              }}
            >
              -
            </span>
            <span 
              className="px-4 py-1 rounded-md font-bold"
              style={{ 
                color: 'rgb(255, 255, 255)', 
                backgroundColor: 'rgb(120, 176, 219)' 
              }}
            >
              SDX
            </span>
          </h1>
          
          {/* Subtitle with very small size and Deep Blue color */}
          <h2 
            className="text-xs font-light uppercase tracking-wide opacity-70"
            style={{ color: 'rgb(64, 143, 204)' }}
          >
            International Distributed Software-Defined Exchange
          </h2>
        </div>
      </div>
        
        <Button variant="ghost" onClick={onBack} className="mb-8 -ml-2 text-base text-[rgb(50,135,200)] hover:bg-[rgb(236,244,250)]">
          ← Back to selection
        </Button>

        <Card className="shadow-lg border-2 border-[rgb(120,176,219)] bg-[rgb(255,255,255)]">
          <CardHeader className="pb-8">
            <CardTitle className="text-2xl text-[rgb(64,143,204)]">No Valid Tokens</CardTitle>
            <CardDescription className="text-lg mt-2 text-[rgb(50,135,200)]">
              You don't have any valid tokens. Please authenticate with a provider first.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <Button onClick={onBack} className="w-full py-4 text-lg font-semibold bg-[rgb(50,135,200)] hover:bg-[rgb(64,143,204)] text-[rgb(255,255,255)]" size="lg">
              Go Back to Authentication
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-16 max-w-6xl bg-[rgb(255,255,255)] min-h-screen">
      {/* Header */}
      <div className="text-center space-y-4 mb-12">
        <div className="flex flex-col items-center space-y-6">
          {/* Title with custom colors */}
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight leading-tight flex items-center gap-1">
            <span 
              className="px-3 py-1 rounded-md"
              style={{ 
                color: 'rgb(50, 135, 200)', 
                backgroundColor: 'rgb(255, 255, 255)' 
              }}
            >
              AtlanticWave
            </span>
            <span 
              className="px-1 py-1"
              style={{ 
                color: 'rgb(255, 255, 255)', 
                backgroundColor: 'rgb(255, 255, 255)' 
              }}
            >
              -
            </span>
            <span 
              className="px-4 py-1 rounded-md font-bold"
              style={{ 
                color: 'rgb(255, 255, 255)', 
                backgroundColor: 'rgb(120, 176, 219)' 
              }}
            >
              SDX
            </span>
          </h1>
          
          {/* Subtitle with very small size and Deep Blue color */}
          <h2 
            className="text-xs font-light uppercase tracking-wide opacity-70"
            style={{ color: 'rgb(64, 143, 204)' }}
          >
            International Distributed Software-Defined Exchange
          </h2>
        </div>
      </div>
      
      <Button variant="ghost" onClick={onBack} className="mb-8 -ml-2 text-base text-[rgb(50,135,200)] hover:bg-[rgb(236,244,250)]">
        ← Back to selection
      </Button>

      <div className="grid lg:grid-cols-2 gap-10">
        {/* Token Selection */}
        <Card className="shadow-lg border-2 border-[rgb(120,176,219)] bg-[rgb(255,255,255)]">
          <CardHeader className="pb-8">
            <CardTitle className="text-2xl text-[rgb(64,143,204)]">Available Tokens</CardTitle>
            <CardDescription className="text-lg mt-2 text-[rgb(50,135,200)]">
              Select a token to view details and send to backend
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-0">
            {availableTokens.map(([provider, token]) => {
              const status = getTokenStatus(token);
              const isSelected = selectedToken?.provider === provider;

              return (
                <div
                  key={provider}
                  className={`p-6 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${
                    isSelected 
                      ? "border-primary bg-primary/5 shadow-md" 
                      : "border-border/20 hover:border-primary/30 hover:bg-primary/5"
                  }`}
                  onClick={() => setSelectedToken(token)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary rounded-xl text-primary-foreground font-bold text-sm">
                        {provider === 'fabric' ? 'F' : provider.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-lg">{provider === 'fabric' ? 'FABRIC API' : provider.toUpperCase()}</div>
                        <div className="text-base text-muted-foreground mt-1">
                          Expires {status.expiresAt.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {status.isExpiringSoon && (
                        <Badge variant="destructive" className="text-sm px-3 py-1">
                          Expiring Soon
                        </Badge>
                      )}
                      {status.isValid ? (
                        <span className="text-accent text-2xl">✓</span>
                      ) : (
                        <span className="text-destructive text-2xl">✗</span>
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
          <Card className="shadow-lg border-2 border-border/20">
            <CardHeader className="pb-8">
              <CardTitle className="text-2xl text-[rgb(64,143,204)]">Token Details</CardTitle>
              <CardDescription className="text-lg mt-2 text-[rgb(50,135,200)]">
                Claims and metadata for the selected token
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 pt-0">
              <div className="space-y-6">
                {claims.sub && (
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/30 border border-border/20">
                    <div className="min-w-0 flex-1">
                      <div className="text-base font-semibold mb-2 text-foreground">Subject</div>
                      <div className="text-base text-muted-foreground break-all">
                        {claims.sub}
                      </div>
                    </div>
                  </div>
                )}

                {claims.email && (
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/30 border border-border/20">
                    <div className="min-w-0 flex-1">
                      <div className="text-base font-semibold mb-2 text-foreground">Email</div>
                      <div className="text-base text-muted-foreground">
                        {claims.email}
                      </div>
                    </div>
                  </div>
                )}

                {claims.iss && (
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/30 border border-border/20">
                    <div className="min-w-0 flex-1">
                      <div className="text-base font-semibold mb-2 text-foreground">Issuer</div>
                      <div className="text-base text-muted-foreground break-all">
                        {claims.iss}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/30 border border-border/20">
                  <div className="min-w-0 flex-1">
                    <div className="text-base font-semibold mb-2 text-foreground">Issued At</div>
                    <div className="text-base text-muted-foreground">
                      {formatDate(selectedToken.issued_at)}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/30 border border-border/20">
                  <div className="min-w-0 flex-1">
                    <div className="text-base font-semibold mb-2 text-foreground">Expires At</div>
                    <div className="text-base text-muted-foreground">
                      {formatDate(selectedToken.issued_at + selectedToken.expires_in)}
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="my-8" />

              <div className="space-y-6">
                <Button
                  onClick={handleSendToBackend}
                  disabled={isSending}
                  className="w-full py-4 text-lg font-semibold bg-[rgb(50,135,200)] hover:bg-[rgb(64,143,204)] text-[rgb(255,255,255)]"
                  size="lg"
                >
                  {isSending ? (
                    <>
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Token to Backend
                    </>
                  )}
                </Button>

                <Button 
                  variant="outline" 
                  onClick={handleClearAllTokens}
                  className="w-full py-3 text-base font-medium border-2 border-destructive/20 hover:border-destructive/30 text-destructive hover:text-destructive"
                >
                  Clear All Tokens
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Backend Configuration Info */}
      <Card className="mt-12 shadow-lg border-2 border-[rgb(120,176,219)] bg-[rgb(255,255,255)]">
        <CardHeader className="pb-6">
          <CardTitle className="text-2xl text-[rgb(64,143,204)]">Current Configuration</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="p-4 rounded-xl bg-[rgb(236,244,250)] border border-[rgb(120,176,219)]">
            <div className="font-semibold text-[rgb(64,143,204)] mb-2">Backend URL</div>
            <div className="text-[rgb(50,135,200)] break-all">
              https://sdxapi.atlanticwave-sdx.ai/
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}