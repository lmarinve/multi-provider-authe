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

  // Debug: Verify provider classes are loaded
  useEffect(() => {
    console.log("LoginPage loaded for provider:", provider);
    console.log("Provider classes loaded:");
    console.log("- ORCIDProvider:", typeof ORCIDProvider);
    console.log("- CILogonProvider:", typeof CILogonProvider);
    console.log("- FabricProvider:", typeof FabricProvider);
  }, [provider]);

  useEffect(() => {
    // Check URL for ORCID callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const state = urlParams.get("state");
    const error = urlParams.get("error");
    const errorDescription = urlParams.get("error_description");

    if (provider === "orcid" && code && state) {
      handleORCIDCallback(code, state);
    } else if (provider === "orcid" && error) {
      const fullErrorMessage = errorDescription 
        ? `${error}: ${decodeURIComponent(errorDescription)}`
        : error;
        
      toast.error(`ORCID login failed: ${fullErrorMessage}`);
      setDeviceFlow({ 
        status: "error", 
        error: fullErrorMessage.includes('blocked') 
          ? "Content blocked by ORCID. This may be due to incorrect client configuration or security settings. Please ensure the redirect URI is properly registered with ORCID."
          : fullErrorMessage
      });
    }
    
    // Check if we were redirected back without any parameters (potential block)
    if (provider === "orcid" && !code && !state && !error && window.location.search === "?provider=orcid") {
      const referrer = document.referrer;
      if (referrer.includes('orcid.org') || sessionStorage.getItem('orcid_auth_started')) {
        // Clear the flag
        sessionStorage.removeItem('orcid_auth_started');
        setDeviceFlow({ 
          status: "error", 
          error: "Authentication was interrupted. This may be due to ORCID blocking the redirect or browser security settings. Please try again or check your browser's security settings."
        });
      }
    }
  }, [provider]);

  const handleORCIDCallback = async (code: string, state: string) => {
    setIsLoading(true);
    try {
      console.log("Handling ORCID callback with code:", code.substring(0, 10) + "...", "state:", state);
      const orcidProvider = new ORCIDProvider();
      console.log("ORCID provider instance created for callback:", orcidProvider);
      
      const tokenData = await orcidProvider.exchangeCodeForToken(code, state);
      console.log("Token exchange successful:", tokenData);
      
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
      let errorMessage = 'Unknown error';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Provide more helpful error messages for common issues
        if (errorMessage.includes('CORS')) {
          errorMessage = "CORS error: The ORCID authentication service is blocking this request. This may be due to an incorrect client configuration or missing CORS settings.";
        } else if (errorMessage.includes('Invalid state')) {
          errorMessage = "Security error: The authentication state doesn't match. Please try logging in again.";
        } else if (errorMessage.includes('Code verifier not found')) {
          errorMessage = "Session error: Authentication session lost. Please try logging in again.";
        } else if (errorMessage.includes('Token exchange failed')) {
          errorMessage = "Authentication failed: Unable to exchange authorization code for token. The client may not be properly configured with ORCID.";
        }
      }
      
      toast.error(`Failed to complete ORCID login: ${errorMessage}`);
      setDeviceFlow({ 
        status: "error", 
        error: errorMessage
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
    } catch (error: any) {
      console.error("Device flow error:", error);
      
      // Handle CORS errors which are expected for CILogon device flow
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        toast.error("Network error: Unable to connect to CILogon. This may be due to CORS restrictions.");
        setDeviceFlow({ 
          status: "error", 
          error: "Network connectivity issue with CILogon service. Please try again or contact support if the problem persists." 
        });
      } else {
        toast.error("Failed to start device flow");
        setDeviceFlow({ status: "error", error: error instanceof Error ? error.message : "Unknown error" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const startORCIDFlow = async () => {
    setIsLoading(true);
    try {
      console.log("Starting ORCID demo flow...");
      
      // Use the demo flow instead of real ORCID authentication
      const tokenData = await ORCIDProvider.startDemoFlow();
      
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
      console.error("ORCID demo flow error:", error);
      
      let errorMessage = 'Demo authentication failed';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast.error(`Failed to start ORCID login: ${errorMessage}`);
      setDeviceFlow({ 
        status: "error", 
        error: errorMessage
      });
    } finally {
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
    let pollCount = 0;
    const maxPolls = 10; // Demo will succeed after a few polls
    
    const poll = async () => {
      pollCount++;
      
      try {
        // Simulate authorization pending for first few polls
        if (pollCount < 3) {
          const error = new Error("User authorization pending");
          (error as any).error = "authorization_pending";
          throw error;
        }
        
        // Simulate success
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
        const errorCode = error.error || (error.message && error.message.includes("authorization_pending") ? "authorization_pending" : null);
        
        if (errorCode === "authorization_pending" || errorCode === "slow_down") {
          // Continue polling
          const nextInterval = errorCode === "slow_down" ? interval + 5 : interval;
          setTimeout(poll, nextInterval * 1000);
        } else if (errorCode === "expired_token" || pollCount >= maxPolls) {
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
                  Start CILogon Device Flow (Demo)
                </Button>
                <Alert className="border-2 border-[rgb(120,176,219)] bg-[rgb(236,244,250)]">
                  <AlertDescription className="text-sm text-[rgb(64,143,204)]">
                    <strong>Demo Mode:</strong> This simulates CILogon's device flow authentication. 
                    In production, this would connect to the actual CILogon OAuth2 endpoints.
                  </AlertDescription>
                </Alert>
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
                <div className="space-y-6">
                  <Alert className="border-2 border-[rgb(120,176,219)] bg-[rgb(236,244,250)]">
                    <AlertDescription className="text-base text-[rgb(64,143,204)]">
                      <div className="space-y-2">
                        <p><strong>Demo Mode:</strong> This is a simulated ORCID authentication for demonstration purposes.</p>
                        <p>In a production environment, you would need:</p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                          <li>A valid ORCID client ID registered with ORCID</li>
                          <li>Proper redirect URI configuration</li>
                          <li>CORS headers configured for your domain</li>
                        </ul>
                      </div>
                    </AlertDescription>
                  </Alert>
                  <Button 
                    onClick={startORCIDFlow} 
                    disabled={isLoading} 
                    size="lg" 
                    className="w-full py-4 text-lg font-semibold bg-[rgb(50,135,200)] hover:bg-[rgb(64,143,204)] text-[rgb(255,255,255)]"
                  >
                    Login with ORCID (Demo)
                  </Button>
                </div>
              )}

              {isLoading && (
                <Alert className="border-2 border-[rgb(120,176,219)] bg-[rgb(236,244,250)]">
                  <Clock className="h-5 w-5 text-[rgb(50,135,200)]" />
                  <AlertDescription className="text-base ml-2 text-[rgb(64,143,204)]">
                    Simulating ORCID authentication...
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
                <div className="space-y-4">
                  <Alert variant="destructive">
                    <XCircle className="h-5 w-5" />
                    <AlertDescription>
                      {deviceFlow.error}
                    </AlertDescription>
                  </Alert>
                  
                  <Alert className="border-2 border-[rgb(120,176,219)] bg-[rgb(236,244,250)]">
                    <AlertDescription className="text-sm text-[rgb(64,143,204)]">
                      <div className="space-y-2">
                        <p><strong>Troubleshooting Tips:</strong></p>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                          <li>Ensure you have a valid ORCID account</li>
                          <li>Try using a different browser or incognito mode</li>
                          <li>Check if your browser is blocking pop-ups or redirects</li>
                          <li>Clear your browser cache and cookies</li>
                          <li>Disable browser extensions that might interfere</li>
                        </ul>
                      </div>
                    </AlertDescription>
                  </Alert>
                  
                  <Button 
                    onClick={() => {
                      setDeviceFlow({ status: "idle" });
                      setIsLoading(false);
                    }}
                    variant="outline"
                    className="w-full border-2 border-[rgb(120,176,219)] text-[rgb(50,135,200)] hover:bg-[rgb(236,244,250)]"
                  >
                    Try Again
                  </Button>
                </div>
              )}
            </>
          )}

          {provider === "fabric" && (
            <>
              {deviceFlow.status === "idle" && (
                <div className="space-y-6">
                  <Alert className="border-2 border-[rgb(120,176,219)] bg-[rgb(236,244,250)]">
                    <AlertDescription className="text-base text-[rgb(64,143,204)]">
                      <strong>Demo Mode:</strong> This simulates FABRIC API token creation. 
                      In production, this would require a valid CILogon token and connect to the actual FABRIC Control Framework API.
                    </AlertDescription>
                  </Alert>
                  <Button 
                    onClick={startFabricFlow} 
                    disabled={isLoading} 
                    size="lg" 
                    className="w-full py-4 text-lg font-semibold bg-[rgb(50,135,200)] hover:bg-[rgb(64,143,204)] text-[rgb(255,255,255)]"
                  >
                    Login with FABRIC API (Demo)
                  </Button>
                </div>
              )}

              {isLoading && (
                <Alert className="border-2 border-[rgb(120,176,219)] bg-[rgb(236,244,250)]">
                  <Clock className="h-5 w-5 text-[rgb(50,135,200)]" />
                  <AlertDescription className="text-base ml-2 text-[rgb(64,143,204)]">
                    Simulating FABRIC API authentication...
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