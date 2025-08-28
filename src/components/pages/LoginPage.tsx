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

  useEffect(() => {
    // Debug: Log provider information
    console.log("LoginPage initialized for provider:", provider);
  }, [provider]);

  const startCILogonFlow = async () => {
    console.log("Opening CILogon authentication window...");
    setIsLoading(true);
    
    try {
      // Simply open CILogon authentication URL in a new window
      const authUrl = "https://cilogon.org/authorize?response_type=code&client_id=APP-S3BU1LVHOTHITEU2&redirect_uri=https://example.com/callback&scope=openid+email+profile";
      const authWindow = window.open(authUrl, "_blank", "width=600,height=700");
      
      if (!authWindow) {
        throw new Error("Popup blocked. Please allow popups for this site and try again.");
      }
      
      toast.success("Authentication window opened. Please complete login and return here.");
      setDeviceFlow({ 
        status: "complete", 
        token: "mock_cilogon_token"
      });
      
      // Create a mock token for demonstration
      const mockToken = {
        id_token: "mock_cilogon_jwt_token",
        refresh_token: null,
        expires_in: 3600,
        issued_at: Math.floor(Date.now() / 1000),
        provider: "cilogon" as const
      };
      
      // Store the mock token
      TokenStorage.storeToken("cilogon", mockToken);
      
      setTimeout(() => {
        onComplete();
      }, 2000);
      
    } catch (error: any) {
      console.error("Error opening CILogon window:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to open authentication window";
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
    console.log("Opening ORCID authentication window...");
    setIsLoading(true);
    
    try {
      // Simply open ORCID authentication URL in a new window
      const authUrl = "https://orcid.org/oauth/authorize?response_type=code&client_id=APP-S3BU1LVHOTHITEU2&redirect_uri=https://example.com/callback&scope=openid+email+profile";
      const authWindow = window.open(authUrl, "_blank", "width=600,height=700");
      
      if (!authWindow) {
        throw new Error("Popup blocked. Please allow popups for this site and try again.");
      }
      
      toast.success("Authentication window opened. Please complete login and return here.");
      setDeviceFlow({ 
        status: "complete", 
        token: "mock_orcid_token"
      });
      
      // Create a mock token for demonstration
      const mockToken = {
        id_token: "mock_orcid_jwt_token",
        refresh_token: null,
        expires_in: 3600,
        issued_at: Math.floor(Date.now() / 1000),
        provider: "orcid" as const
      };
      
      // Store the mock token
      TokenStorage.storeToken("orcid", mockToken);
      
      setTimeout(() => {
        onComplete();
      }, 2000);
      
    } catch (error: any) {
      console.error("Error opening ORCID window:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to open authentication window";
      toast.error(errorMessage);
      setDeviceFlow({ 
        status: "error", 
        error: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startFabricFlow = async () => {
    console.log("Opening FABRIC API authentication window...");
    setIsLoading(true);
    
    try {
      // Simply open FABRIC authentication URL in a new window
      const authUrl = "https://cm.fabric-testbed.net/login";
      const authWindow = window.open(authUrl, "_blank", "width=600,height=700");
      
      if (!authWindow) {
        throw new Error("Popup blocked. Please allow popups for this site and try again.");
      }
      
      toast.success("Authentication window opened. Please complete login and return here.");
      setDeviceFlow({ 
        status: "complete", 
        token: "mock_fabric_token"
      });
      
      // Create a mock token for demonstration
      const mockToken = {
        id_token: "mock_fabric_jwt_token",
        refresh_token: "mock_fabric_refresh_token",
        expires_in: 3600,
        issued_at: Math.floor(Date.now() / 1000),
        provider: "fabric" as const
      };
      
      // Store the mock token
      TokenStorage.storeToken("fabric", mockToken);
      
      setTimeout(() => {
        onComplete();
      }, 2000);
      
    } catch (error: any) {
      console.error("Error opening FABRIC window:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to open authentication window";
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
                      <strong>CILogon Authentication:</strong> Click the button to open CILogon in a new window. 
                      Complete your login there and return here to continue.
                    </AlertDescription>
                  </Alert>
                </>
              )}

              {isLoading && (
                <Alert className="border-2 border-[rgb(120,176,219)] bg-[rgb(236,244,250)]">
                  <Clock className="h-5 w-5 text-[rgb(50,135,200)]" />
                  <AlertDescription className="text-base ml-2 text-[rgb(64,143,204)]">
                    Opening authentication window...
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
                      <strong>ORCID Authentication:</strong> Click the button to open ORCID in a new window. 
                      Complete your login there and return here to continue.
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
                    Opening authentication window...
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
                      <strong>FABRIC API Authentication:</strong> Click the button to open FABRIC in a new window. 
                      Complete your login there and return here to continue.
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
                    Opening authentication window...
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