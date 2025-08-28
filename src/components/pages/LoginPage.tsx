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

  // Debug: Log provider information
  useEffect(() => {
    console.log("LoginPage initialized for provider:", provider);
  }, [provider]);

  useEffect(() => {
    // Check URL for ORCID callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const state = urlParams.get("state");
    const error = urlParams.get("error");
    const errorDescription = urlParams.get("error_description");

    if (provider === "orcid") {
      if (code && state) {
        // Handle successful callback
        handleORCIDCallback(code, state);
      } else if (error) {
        // Handle error callback
        const fullErrorMessage = errorDescription 
          ? `${error}: ${decodeURIComponent(errorDescription)}`
          : error;
          
        toast.error(`ORCID authentication failed: ${fullErrorMessage}`);
        setDeviceFlow({ 
          status: "error", 
          error: "ORCID authentication was rejected or failed. Please try again or check your ORCID account status."
        });
      } else if (window.location.search === "?provider=orcid") {
        // Check if we were redirected back without parameters (potential interruption)
        const referrer = document.referrer;
        if (referrer.includes('orcid.org') || sessionStorage.getItem('orcid_auth_started')) {
          sessionStorage.removeItem('orcid_auth_started');
          setDeviceFlow({ 
            status: "error", 
            error: "Authentication was interrupted. This may be due to ORCID blocking the redirect or browser security settings."
          });
        }
      }
    }
  }, [provider]);

  const handleORCIDCallback = async (code: string, state: string) => {
    console.log("Processing ORCID callback...");
    setIsLoading(true);
    
    try {
      const orcidProvider = new ORCIDProvider();
      const tokenData = await orcidProvider.exchangeCodeForToken(code, state);
      
      console.log("ORCID token exchange successful");
      
      // Store the token
      TokenStorage.setToken('orcid', tokenData);
      
      toast.success("Successfully authenticated with ORCID!");
      setDeviceFlow({ 
        status: "complete", 
        token: tokenData.id_token
      });
      
      // Navigate to token page
      setTimeout(() => {
        onComplete();
      }, 1500);
      
    } catch (error) {
      console.error("ORCID callback processing error:", error);
      
      let errorMessage = 'ORCID authentication failed';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Provide more helpful error messages for common issues
        if (errorMessage.includes('CORS')) {
          errorMessage = "CORS error: The ORCID service is blocking this request. This may be due to client configuration or CORS policy issues.";
        } else if (errorMessage.includes('Invalid state')) {
          errorMessage = "Security error: Authentication state verification failed. Please try again.";
        } else if (errorMessage.includes('Code verifier not found')) {
          errorMessage = "Session error: Authentication session expired. Please try again.";
        } else if (errorMessage.includes('Token exchange failed')) {
          errorMessage = "Authentication failed: Unable to complete the ORCID authentication process.";
        }
      }
      
      toast.error(`ORCID authentication failed: ${errorMessage}`);
      setDeviceFlow({ 
        status: "error", 
        error: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startCILogonFlow = async () => {
    console.log("Starting CILogon authentication flow...");
    setIsLoading(true);
    
    try {
      const cilogonProvider = new CILogonProvider();
      const response = await cilogonProvider.startDeviceFlow();
      
      console.log("CILogon device flow started:", response);
      
      setDeviceFlow({
        status: "polling",
        deviceCode: response.device_code,
        userCode: response.user_code,
        verificationUri: response.verification_uri,
        verificationUriComplete: response.verification_uri_complete,
        expiresAt: Date.now() + (response.expires_in * 1000),
        interval: response.interval || 5
      });
      
      // Start polling for token with real API calls
      pollForTokenReal(cilogonProvider, response.device_code, response.interval || 5);
    } catch (error: any) {
      console.error("CILogon device flow error:", error);
      
      let errorMessage = "Failed to start CILogon authentication";
      
      // Handle different types of errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = "Network error: Unable to connect to CILogon. Please check your internet connection and try again.";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      setDeviceFlow({ 
        status: "error", 
        error: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startORCIDFlow = async () => {
    console.log("Starting ORCID authentication flow...");
    setIsLoading(true);
    
    try {
      const tokenData = await ORCIDProvider.startDemoFlow();
      
      console.log("ORCID authentication successful:", tokenData);
      
      toast.success("Successfully authenticated with ORCID!");
      setDeviceFlow({ 
        status: "complete", 
        token: tokenData.id_token
      });
      
      // Navigate to token page
      setTimeout(() => {
        onComplete();
      }, 1500);
      
    } catch (error) {
      console.error("ORCID authentication error:", error);
      
      let errorMessage = 'ORCID authentication failed';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast.error(`Failed to authenticate with ORCID: ${errorMessage}`);
      setDeviceFlow({ 
        status: "error", 
        error: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startFabricFlow = async () => {
    console.log("Starting FABRIC API authentication flow...");
    setIsLoading(true);
    
    try {
      const fabricProvider = new FabricProvider();
      const tokenData = await fabricProvider.authenticate();
      
      console.log("FABRIC authentication successful:", tokenData);
      
      toast.success("Successfully authenticated with FABRIC API!");
      setDeviceFlow({ 
        status: "complete", 
        token: tokenData.id_token
      });
      
      // Navigate to token page
      setTimeout(() => {
        onComplete();
      }, 1500);
      
    } catch (error) {
      console.error("FABRIC authentication error:", error);
      
      let errorMessage = "FABRIC API authentication failed";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      setDeviceFlow({ 
        status: "error", 
        error: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  const pollForTokenReal = async (provider: CILogonProvider, deviceCode: string, interval: number) => {
    console.log("Starting real token polling for device code:", deviceCode.substring(0, 10) + "...");
    
    try {
      // Use the provider's real polling method which handles all the OAuth2 device flow logic
      const tokenData = await provider.exchangeForToken(deviceCode, interval);
      
      console.log("CILogon authentication successful!");
      toast.success("Successfully authenticated with CILogon!");
      setDeviceFlow({ 
        status: "complete", 
        token: tokenData.id_token
      });
      
      // Navigate to token page
      setTimeout(() => {
        onComplete();
      }, 1500);
      
    } catch (error: any) {
      console.error("Real polling error:", error);
      
      let errorMessage = "Authentication failed";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      setDeviceFlow({ 
        status: "error", 
        error: errorMessage
      });
    }
  };

  const pollForToken = async (provider: CILogonProvider, deviceCode: string, interval: number) => {
    let pollCount = 0;
    const maxPolls = 20; // Maximum number of polling attempts
    
    console.log("Starting token polling for device code:", deviceCode.substring(0, 10) + "...");
    
    const poll = async () => {
      pollCount++;
      console.log(`Polling attempt ${pollCount}/${maxPolls}`);
      
      try {
        // Simulate authorization pending for first few polls (demo behavior)
        if (pollCount < 3) {
          const error = new Error("User authorization pending");
          (error as any).error = "authorization_pending";
          throw error;
        }
        
        // Simulate success after some attempts
        const tokenResponse = await provider.pollForToken(deviceCode);
        
        if (!tokenResponse.id_token) {
          throw new Error("No ID token received from provider");
        }

        const tokenData: TokenData = {
          id_token: tokenResponse.id_token,
          refresh_token: tokenResponse.refresh_token,
          expires_in: tokenResponse.expires_in || 3600,
          issued_at: Math.floor(Date.now() / 1000),
          provider: "cilogon",
        };

        TokenStorage.setToken("cilogon", tokenData);
        
        console.log("CILogon authentication successful!");
        toast.success("Successfully authenticated with CILogon!");
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
        
        if (errorCode === "authorization_pending") {
          console.log("Authorization still pending, continuing to poll...");
          // Continue polling after interval
          setTimeout(poll, interval * 1000);
        } else if (errorCode === "slow_down") {
          console.log("Rate limited, increasing interval...");
          // Continue polling with increased interval
          setTimeout(poll, (interval + 5) * 1000);
        } else if (errorCode === "expired_token" || pollCount >= maxPolls) {
          console.log("Polling expired or max attempts reached");
          setDeviceFlow({ 
            status: "error", 
            error: "Device code expired or authentication timed out. Please try again." 
          });
        } else {
          console.error("Polling error:", error);
          setDeviceFlow({ 
            status: "error", 
            error: error.message || "Authentication failed unexpectedly" 
          });
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
                <>
                  <Button 
                    onClick={startCILogonFlow} 
                    disabled={isLoading} 
                    size="lg" 
                    className="w-full py-4 text-lg font-semibold bg-[rgb(50,135,200)] hover:bg-[rgb(64,143,204)] text-[rgb(255,255,255)]"
                  >
                    Start CILogon Device Flow
                  </Button>
                  <Alert className="border-2 border-[rgb(120,176,219)] bg-[rgb(236,244,250)]">
                    <AlertDescription className="text-sm text-[rgb(64,143,204)]">
                      <strong>Device Flow Authentication:</strong> You will be redirected to CILogon to complete authentication. 
                      This uses the standard OAuth2 device flow for secure authentication with your institutional credentials.
                    </AlertDescription>
                  </Alert>
                </>
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
                        <p><strong>Demo Mode:</strong> This simulates ORCID authentication for demonstration.</p>
                        <p>In production, you would need:</p>
                        <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                          <li>A valid ORCID client ID registered at orcid.org</li>
                          <li>Proper redirect URI configuration in your ORCID application</li>
                          <li>CORS headers configured for your domain</li>
                          <li>Valid SSL/TLS certificates</li>
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
                      In production, this requires a valid CILogon token and connects to the actual FABRIC Control Framework API at fabric-testbed.net.
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