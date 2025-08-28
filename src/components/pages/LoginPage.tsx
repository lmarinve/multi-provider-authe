import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Provider } from "@/lib/config";
import { DeviceFlowState } from "@/lib/types";
import { TokenStorage } from "@/lib/token-storage";
import { CILogonProvider } from "@/lib/providers/cilogon";
import { ORCIDProvider } from "@/lib/providers/orcid";
import { FabricProvider } from "@/lib/providers/fabric";
import sdxLogo from "@/assets/images/sdx-logo.svg";
import { 
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
    // Check URL for OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const state = urlParams.get("state");
    const error = urlParams.get("error");
    const errorDescription = urlParams.get("error_description");

    if (provider === "orcid" || provider === "cilogon") {
      if (code && state) {
        // Handle successful callback
        if (provider === "orcid") {
          handleORCIDCallback(code, state);
        } else if (provider === "cilogon") {
          handleCILogonCallback(code, state);
        }
      } else if (error) {
        // Handle error callback
        const fullErrorMessage = errorDescription 
          ? `${error}: ${decodeURIComponent(errorDescription)}`
          : error;
          
        toast.error(`${provider.toUpperCase()} authentication failed: ${fullErrorMessage}`);
        setDeviceFlow({ 
          status: "error", 
          error: `${provider.toUpperCase()} authentication was rejected or failed. Please try again or check your account status.`
        });
      } else if (window.location.search === `?provider=${provider}`) {
        // Check if we were redirected back without parameters (potential interruption)
        const referrer = document.referrer;
        const providerDomain = provider === "orcid" ? "orcid.org" : "cilogon.org";
        if (referrer.includes(providerDomain) || sessionStorage.getItem(`${provider}_auth_started`)) {
          sessionStorage.removeItem(`${provider}_auth_started`);
          setDeviceFlow({ 
            status: "error", 
            error: "Authentication was interrupted. This may be due to browser security settings or the provider blocking the redirect."
          });
        }
      }
    }
  }, [provider]);

  const handleCILogonCallback = async (code: string, state: string) => {
    console.log("Processing CILogon callback...");
    setIsLoading(true);
    
    try {
      const cilogonProvider = new CILogonProvider();
      const tokenData = await cilogonProvider.handleCallback();
      
      console.log("CILogon token exchange successful");
      
      toast.success("Successfully authenticated with CILogon!");
      setDeviceFlow({ 
        status: "complete", 
        token: tokenData.id_token
      });
      
      // Navigate to token page
      setTimeout(() => {
        onComplete();
      }, 1500);
      
    } catch (error) {
      console.error("CILogon callback processing error:", error);
      
      let errorMessage = 'CILogon authentication failed';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast.error(`CILogon authentication failed: ${errorMessage}`);
      setDeviceFlow({ 
        status: "error", 
        error: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

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
      // Mark that we're starting authentication
      sessionStorage.setItem('cilogon_auth_started', 'true');
      
      const cilogonProvider = new CILogonProvider();
      cilogonProvider.startAuthentication();
      
    } catch (error: any) {
      console.error("CILogon authentication error:", error);
      
      let errorMessage = "Failed to start CILogon authentication";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      setDeviceFlow({ 
        status: "error", 
        error: errorMessage
      });
      setIsLoading(false);
    }
  };

  const startORCIDFlow = async () => {
    console.log("Starting ORCID authentication flow...");
    setIsLoading(true);
    
    try {
      // Mark that we're starting authentication
      sessionStorage.setItem('orcid_auth_started', 'true');
      
      const orcidProvider = new ORCIDProvider();
      const authUrl = await orcidProvider.getAuthUrl();
      
      // Redirect to ORCID for authentication
      window.location.href = authUrl;
      
    } catch (error) {
      console.error("ORCID authentication error:", error);
      
      let errorMessage = 'Failed to start ORCID authentication';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      setDeviceFlow({ 
        status: "error", 
        error: errorMessage
      });
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
                    Login with CILogon
                  </Button>
                  <Alert className="border-2 border-[rgb(120,176,219)] bg-[rgb(236,244,250)]">
                    <AlertDescription className="text-sm text-[rgb(64,143,204)]">
                      <strong>Browser Authentication:</strong> You will be redirected to CILogon to authenticate with your institutional credentials. 
                      This uses the standard OAuth2 authorization code flow for secure authentication.
                    </AlertDescription>
                  </Alert>
                </>
              )}

              {isLoading && (
                <Alert className="border-2 border-[rgb(120,176,219)] bg-[rgb(236,244,250)]">
                  <Clock className="h-5 w-5 text-[rgb(50,135,200)]" />
                  <AlertDescription className="text-base ml-2 text-[rgb(64,143,204)]">
                    Redirecting to CILogon for authentication...
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
                      <strong>Browser Authentication:</strong> You will be redirected to ORCID to authenticate with your ORCID credentials. 
                      This uses the standard OAuth2 authorization code flow with PKCE for secure authentication.
                    </AlertDescription>
                  </Alert>
                  <Button 
                    onClick={startORCIDFlow} 
                    disabled={isLoading} 
                    size="lg" 
                    className="w-full py-4 text-lg font-semibold bg-[rgb(50,135,200)] hover:bg-[rgb(64,143,204)] text-[rgb(255,255,255)]"
                  >
                    Login with ORCID
                  </Button>
                </div>
              )}

              {isLoading && (
                <Alert className="border-2 border-[rgb(120,176,219)] bg-[rgb(236,244,250)]">
                  <Clock className="h-5 w-5 text-[rgb(50,135,200)]" />
                  <AlertDescription className="text-base ml-2 text-[rgb(64,143,204)]">
                    Redirecting to ORCID for authentication...
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