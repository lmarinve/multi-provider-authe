import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Provider } from "@/lib/config";
import { TokenData, DeviceFlowState } from "@/lib/types";
import { TokenStorage } from "@/lib/token-storage";
import { CILogonProvider } from "@/lib/providers/cilogon";
import { ORCIDProvider } from "@/lib/providers/orcid";
import { FabricProvider } from "@/lib/providers/fabric";
import sdxLogo from "@/assets/images/sdx-logo.svg";
import { 
  Copy, 
  ExternalLink, 
  CheckCircle, 
  XCircle, 
  Clock
} from "@phosphor-icons/react";

interface LoginPageProps {
  provider: Provider;
  onComplete: () => void;
  onBack: () => void;
}

export function LoginPage({ provider, onComplete, onBack }: LoginPageProps) {
  const [deviceFlow, setDeviceFlow] = useState<DeviceFlowState>({ status: "idle" });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check URL for ORCID callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const state = urlParams.get("state");
    const error = urlParams.get("error");

    if (provider === "orcid" && code && state) {
      handleORCIDCallback(code, state);
    } else if (provider === "orcid" && error) {
      toast.error(`ORCID login failed: ${error}`);
      setDeviceFlow({ status: "error", error });
    }
  }, [provider]);

  const handleORCIDCallback = async (code: string, state: string) => {
    setIsLoading(true);
    try {
      const orcidProvider = new ORCIDProvider();
      const tokenData = await orcidProvider.exchangeCodeForToken(code, state);
      
      // Store the token
      TokenStorage.setToken('orcid', tokenData);
      
      toast.success("Successfully logged in with ORCID!");
      setDeviceFlow({ 
        status: "complete", 
        token: tokenData.id_token
      });
      
      // Navigate to token page
      setTimeout(() => {
        onComplete();
      }, 1500);
    } catch (error) {
      console.error("ORCID callback error:", error);
      toast.error("Failed to complete ORCID login");
      setDeviceFlow({ 
        status: "error", 
        error: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startCILogonFlow = async () => {
    setIsLoading(true);
    try {
      const cilogonProvider = new CILogonProvider();
      const response = await cilogonProvider.startDeviceFlow();
      
      setDeviceFlow({
        status: "polling",
        deviceCode: response.device_code,
        userCode: response.user_code,
        verificationUri: response.verification_uri,
        verificationUriComplete: response.verification_uri_complete,
        expiresAt: Date.now() + (response.expires_in * 1000),
        interval: response.interval || 5
      });
      
      // Start polling for token
      pollForToken(cilogonProvider, response.device_code, response.interval || 5);
    } catch (error) {
      console.error("Device flow error:", error);
      toast.error("Failed to start device flow");
      setDeviceFlow({ status: "error", error: error instanceof Error ? error.message : "Unknown error" });
    } finally {
      setIsLoading(false);
    }
  };

  const startORCIDFlow = async () => {
    setIsLoading(true);
    try {
      const orcidProvider = new ORCIDProvider();
      const authUrl = await orcidProvider.getAuthUrl();
      
      // Redirect to ORCID for authentication
      window.location.href = authUrl;
    } catch (error) {
      console.error("ORCID flow error:", error);
      toast.error("Failed to start ORCID login");
      setDeviceFlow({ status: "error", error: error instanceof Error ? error.message : "Unknown error" });
      setIsLoading(false);
    }
  };

  const startFabricFlow = async () => {
    setIsLoading(true);
    try {
      const fabricProvider = new FabricProvider();
      const tokenData = await fabricProvider.authenticate();
      
      // Token is already stored by the provider
      
      toast.success("Successfully logged in with FABRIC API!");
      setDeviceFlow({ 
        status: "complete", 
        token: tokenData.id_token
      });
      
      // Navigate to token page
      setTimeout(() => {
        onComplete();
      }, 1500);
    } catch (error) {
      console.error("FABRIC flow error:", error);
      toast.error("Failed to authenticate with FABRIC API");
      setDeviceFlow({ 
        status: "error", 
        error: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const pollForToken = async (provider: CILogonProvider, deviceCode: string, interval: number) => {
    const poll = async () => {
      try {
        const tokenResponse = await provider.pollForToken(deviceCode);
        
        // Convert to TokenData and store
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
        
        toast.success("Successfully logged in!");
        setDeviceFlow({ 
          status: "complete", 
          token: tokenData.id_token
        });
        
        // Navigate to token page
        setTimeout(() => {
          onComplete();
        }, 1500);
      } catch (error: any) {
        if (error.error === "authorization_pending" || error.error === "slow_down") {
          // Continue polling
          const nextInterval = error.error === "slow_down" ? interval + 5 : interval;
          setTimeout(poll, nextInterval * 1000);
        } else if (error.error === "expired_token") {
          setDeviceFlow({ status: "error", error: "Device code expired. Please try again." });
        } else {
          console.error("Polling error:", error);
          setDeviceFlow({ status: "error", error: error.message || "Authentication failed" });
        }
      }
    };
    
    // Start polling after the initial interval
    setTimeout(poll, interval * 1000);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  const getTimeRemaining = () => {
    if (!deviceFlow.expiresAt) return null;
    const remaining = Math.max(0, deviceFlow.expiresAt - Date.now());
    return Math.ceil(remaining / 1000);
  };

  const timeRemaining = getTimeRemaining();

  return (
    <div className="container mx-auto px-6 py-16 max-w-3xl bg-[rgb(255,255,255)] min-h-screen">
     {/* Header */}
     <div className="text-center space-y-4 mb-12">
       <div className="flex flex-col items-center space-y-6">
         {/* Logo and Title */}
         <div className="flex items-center justify-center gap-4">
           <img src={sdxLogo} alt="SDX Logo" className="w-12 h-12 object-contain" />
           <h1 className="text-4xl font-bold tracking-tight leading-tight">
             <span style={{ color: 'rgb(50, 135, 200)' }}>AtlanticWave</span>
             <span style={{ color: 'rgb(64, 143, 204)' }}>-</span>
             <span
               className="px-3 py-1 rounded-md font-bold"
               style={{
                 color: 'rgb(255, 255, 255)',
                 backgroundColor: 'rgb(120, 176, 219)'
               }}
             >
               SDX
             </span>
           </h1>
         </div>
        
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
        <CardHeader className="pb-8 text-center">
          <CardTitle className="text-2xl text-[rgb(64,143,204)] text-center">
            Authenticate with {provider === 'fabric' ? 'FABRIC API' : provider.toUpperCase()}
          </CardTitle>
          <CardDescription className="text-lg mt-2 text-[rgb(50,135,200)] text-center">
            Complete the authentication flow to obtain your token
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-10 pt-0">
          {provider === "cilogon" && (
            <>
              {deviceFlow.status === "idle" && (
                <Button 
                  onClick={startCILogonFlow} 
                  disabled={isLoading} 
                  size="lg" 
                  className="w-full py-4 text-lg font-semibold bg-[rgb(50,135,200)] hover:bg-[rgb(64,143,204)] text-[rgb(255,255,255)]"
                >
                  Start CILogon Device Flow
                </Button>
              )}

              {deviceFlow.status === "polling" && (
                <div className="space-y-8">
                  <Alert className="border-2 border-[rgb(120,176,219)] bg-[rgb(236,244,250)]">
                    <Clock className="h-5 w-5 text-[rgb(50,135,200)]" />
                    <AlertDescription className="text-base ml-2 text-[rgb(64,143,204)]">
                      Please visit the URL below and enter the user code to complete authentication.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-6">
                    <div className="bg-[rgb(236,244,250)] p-6 rounded-lg border-2 border-[rgb(120,176,219)]">
                      <Label className="text-sm font-semibold text-[rgb(64,143,204)] mb-3 block">
                        Verification URL
                      </Label>
                      <div className="flex items-center justify-between bg-white p-3 rounded border">
                        <code className="text-sm text-[rgb(50,135,200)]">{deviceFlow.verificationUri}</code>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(deviceFlow.verificationUri!)}
                            className="text-[rgb(50,135,200)] hover:bg-[rgb(236,244,250)]"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(deviceFlow.verificationUri, '_blank')}
                            className="text-[rgb(50,135,200)] hover:bg-[rgb(236,244,250)]"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-[rgb(236,244,250)] p-6 rounded-lg border-2 border-[rgb(120,176,219)]">
                      <Label className="text-sm font-semibold text-[rgb(64,143,204)] mb-3 block">
                        User Code
                      </Label>
                      <div className="flex items-center justify-between bg-white p-4 rounded border">
                        <code className="text-xl font-mono font-bold text-[rgb(50,135,200)]">
                          {deviceFlow.userCode}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(deviceFlow.userCode!)}
                          className="text-[rgb(50,135,200)] hover:bg-[rgb(236,244,250)]"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {timeRemaining && (
                      <div className="text-center">
                        <Badge variant="outline" className="text-sm text-[rgb(64,143,204)] border-[rgb(120,176,219)]">
                          Code expires in {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  {deviceFlow.verificationUriComplete && (
                    <div className="text-center pt-4">
                      <Button
                        variant="outline"
                        onClick={() => window.open(deviceFlow.verificationUriComplete, '_blank')}
                        className="border-2 border-[rgb(120,176,219)] text-[rgb(50,135,200)] hover:bg-[rgb(236,244,250)]"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open Complete Authentication URL
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {deviceFlow.status === "complete" && (
                <Alert className="border-2 border-green-200 bg-green-50">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <AlertDescription className="text-base ml-2 text-green-800">
                    Authentication successful! Redirecting to your token...
                  </AlertDescription>
                </Alert>
              )}

              {deviceFlow.status === "error" && (
                <Alert variant="destructive" className="border-2 border-destructive/20">
                  <XCircle className="h-5 w-5" />
                  <AlertDescription className="text-base ml-2">
                    {deviceFlow.error}
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}

          {provider === "orcid" && (
            <>
              {deviceFlow.status === "idle" && (
                <Button 
                  onClick={startORCIDFlow} 
                  disabled={isLoading} 
                  size="lg" 
                  className="w-full py-4 text-lg font-semibold bg-[rgb(50,135,200)] hover:bg-[rgb(64,143,204)] text-[rgb(255,255,255)]"
                >
                  Login with ORCID
                </Button>
              )}

              {isLoading && (
                <Alert className="border-2 border-[rgb(120,176,219)] bg-[rgb(236,244,250)]">
                  <Clock className="h-5 w-5 text-[rgb(50,135,200)]" />
                  <AlertDescription className="text-base ml-2 text-[rgb(64,143,204)]">
                    Redirecting to ORCID...
                  </AlertDescription>
                </Alert>
              )}

              {deviceFlow.status === "complete" && (
                <Alert className="border-2 border-green-200 bg-green-50">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <AlertDescription className="text-base ml-2 text-green-800">
                    Authentication successful! Redirecting to your token...
                  </AlertDescription>
                </Alert>
              )}

              {deviceFlow.status === "error" && (
                <Alert variant="destructive">
                  <XCircle className="h-5 w-5" />
                  <AlertDescription>
                    {deviceFlow.error}
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}

          {provider === "fabric" && (
            <>
              {deviceFlow.status === "idle" && (
                <div className="space-y-6">
                  <Alert className="border-2 border-[rgb(120,176,219)] bg-[rgb(236,244,250)]">
                    <AlertDescription className="text-base text-[rgb(64,143,204)]">
                      FABRIC API authentication requires a valid CILogon token. 
                      Please authenticate with CILogon first if you haven't already.
                    </AlertDescription>
                  </Alert>
                  <Button 
                    onClick={startFabricFlow} 
                    disabled={isLoading} 
                    size="lg" 
                    className="w-full py-4 text-lg font-semibold bg-[rgb(50,135,200)] hover:bg-[rgb(64,143,204)] text-[rgb(255,255,255)]"
                  >
                    Login with FABRIC API
                  </Button>
                </div>
              )}

              {isLoading && (
                <Alert className="border-2 border-[rgb(120,176,219)] bg-[rgb(236,244,250)]">
                  <Clock className="h-5 w-5 text-[rgb(50,135,200)]" />
                  <AlertDescription className="text-base ml-2 text-[rgb(64,143,204)]">
                    Logging in with FABRIC API...
                  </AlertDescription>
                </Alert>
              )}

              {deviceFlow.status === "error" && (
                <Alert variant="destructive" className="border-2 border-destructive/20">
                  <XCircle className="h-5 w-5" />
                  <AlertDescription className="text-base ml-2">
                    {deviceFlow.error}
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}