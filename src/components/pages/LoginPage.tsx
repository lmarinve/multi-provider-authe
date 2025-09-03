import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Provider, DeviceFlowState } from "@/lib/types";
import { config } from "@/lib/config";
import { TokenStorage } from "@/lib/token-storage";
import { CILogonProvider } from "@/lib/providers/cilogon";
import { ORCIDProvider } from "@/lib/providers/orcid";
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
    console.log("Starting CILogon authentication...");
    setIsLoading(true);
    setDeviceFlow({ status: "pending" });
    
    try {
      const token = await CILogonProvider.startAuthenticationPopup();
      console.log("CILogon authentication successful:", token);
      
      toast.success("✅ CILogon authentication successful!");
      setDeviceFlow({ status: "success", token });
      
      // Show success message briefly, then complete
      setTimeout(() => {
        onComplete();
      }, 2000);
      
    } catch (error: any) {
      console.error("CILogon authentication failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Authentication failed";
      
      // Check if this was actually a successful authentication (popup closed after success)
      if (errorMessage.includes("window was closed") && provider === "cilogon") {
        // Check localStorage one more time for successful authentication
        try {
          const authResult = localStorage.getItem('cilogon_auth_result');
          if (authResult) {
            const result = JSON.parse(authResult);
            if (result.type === 'CILOGON_AUTH_SUCCESS' && Date.now() - result.timestamp < 300000) {
              console.log('Found successful authentication after popup closed error, performing token exchange...');
              localStorage.removeItem('cilogon_auth_result');
              
              try {
                // Get stored code verifier
                let storedCodeVerifier = sessionStorage.getItem('cilogon_code_verifier');
                
                // Try to recover from backup if missing
                if (!storedCodeVerifier) {
                  const backup = localStorage.getItem('cilogon_state_backup');
                  if (backup) {
                    const parsed = JSON.parse(backup);
                    if (Date.now() - parsed.timestamp < 600000) {
                      storedCodeVerifier = parsed.codeVerifier;
                      console.log('Recovered code verifier from backup for popup closed handler');
                    }
                  }
                }
                
                if (!storedCodeVerifier) {
                  throw new Error('Code verifier not found');
                }
                
                // Perform token exchange
                const cilogonProvider = new CILogonProvider();
                const token = await cilogonProvider.exchangeCodeForToken(result.code, result.state, storedCodeVerifier);
                
                console.log('Token exchange successful in popup closed handler:', token);
                
                toast.success("✅ CILogon authentication successful!");
                setDeviceFlow({ status: "success", token });
                setTimeout(() => {
                  onComplete();
                }, 1500);
                setIsLoading(false);
                return;
                
              } catch (exchangeError) {
                console.error('Token exchange failed in popup closed handler:', exchangeError);
                toast.error(`Token exchange failed: ${exchangeError instanceof Error ? exchangeError.message : 'Unknown error'}`);
                setDeviceFlow({ 
                  status: "error", 
                  error: `Token exchange failed: ${exchangeError instanceof Error ? exchangeError.message : 'Unknown error'}`
                });
                setIsLoading(false);
                return;
              }
            }
          }
        } catch (e) {
          console.error('Error checking auth after popup close:', e);
        }
        
        // Set a special state for this case
        setDeviceFlow({ 
          status: "window_closed",
          error: errorMessage
        });
        toast.info("🔄 Authentication window was closed. If you completed the login, click the Continue button below.");
      } else {
        toast.error(`❌ ${errorMessage}`);
        setDeviceFlow({ 
          status: "error", 
          error: errorMessage
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Add effect to check for completed authentication when window regains focus
  useEffect(() => {
    let authCheckInterval: NodeJS.Timeout | null = null;
    
    const handleVisibilityChange = () => {
      if (!document.hidden && deviceFlow.status === "pending") {
        console.log('Window regained focus, checking for completed authentication...');
        
        // Set up periodic check for completed authentication
        if (authCheckInterval) {
          clearInterval(authCheckInterval);
        }
        
        authCheckInterval = setInterval(async () => {
          try {
            const authResult = localStorage.getItem('cilogon_auth_result');
            if (authResult) {
              const result = JSON.parse(authResult);
              if (result.type === 'CILOGON_AUTH_SUCCESS' && Date.now() - result.timestamp < 120000) {
                console.log('Found completed authentication in localStorage, performing token exchange...');
                
                // Clear the stored result immediately
                localStorage.removeItem('cilogon_auth_result');
                
                // Clear the interval
                if (authCheckInterval) {
                  clearInterval(authCheckInterval);
                  authCheckInterval = null;
                }
                
                try {
                  // Get stored code verifier
                  let storedCodeVerifier = sessionStorage.getItem('cilogon_code_verifier');
                  
                  // Try to recover from backup if missing
                  if (!storedCodeVerifier) {
                    const backup = localStorage.getItem('cilogon_state_backup');
                    if (backup) {
                      const parsed = JSON.parse(backup);
                      if (Date.now() - parsed.timestamp < 600000) {
                        storedCodeVerifier = parsed.codeVerifier;
                        console.log('Recovered code verifier from backup');
                      }
                    }
                  }
                  
                  if (!storedCodeVerifier) {
                    throw new Error('Code verifier not found');
                  }
                  
                  // Perform token exchange
                  const cilogonProvider = new CILogonProvider();
                  const token = await cilogonProvider.exchangeCodeForToken(result.code, result.state, storedCodeVerifier);
                  
                  console.log('Token exchange successful:', token);
                  
                  // Trigger success state
                  setDeviceFlow({ status: "success", token });
                  toast.success("✅ CILogon authentication successful!");
                  setTimeout(() => {
                    onComplete();
                  }, 1500);
                  
                } catch (exchangeError) {
                  console.error('Token exchange failed:', exchangeError);
                  toast.error(`Token exchange failed: ${exchangeError instanceof Error ? exchangeError.message : 'Unknown error'}`);
                  setDeviceFlow({ 
                    status: "error", 
                    error: `Token exchange failed: ${exchangeError instanceof Error ? exchangeError.message : 'Unknown error'}`
                  });
                }
              }
            }
          } catch (e) {
            console.error('Error checking for completed auth:', e);
          }
        }, 1000);
        
        // Stop checking after 10 seconds
        setTimeout(() => {
          if (authCheckInterval) {
            clearInterval(authCheckInterval);
            authCheckInterval = null;
          }
        }, 10000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
      if (authCheckInterval) {
        clearInterval(authCheckInterval);
      }
    };
  }, [deviceFlow.status, onComplete]);

  const startORCIDFlow = async () => {
    console.log("Starting ORCID authentication...");
    setIsLoading(true);
    
    try {
      const token = await ORCIDProvider.startAuthenticationPopup();
      console.log("ORCID authentication successful:", token);
      
      toast.success("ORCID authentication successful!");
      setDeviceFlow({ status: "success", token });
      
      // Complete the login process
      setTimeout(() => {
        onComplete();
      }, 1000);
      
    } catch (error: any) {
      console.error("ORCID authentication failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Authentication failed";
      toast.error(errorMessage);
      setDeviceFlow({ 
        status: "error", 
        error: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = async () => {
    // Manual check for completed authentication
    try {
      const authResult = localStorage.getItem('cilogon_auth_result');
      if (authResult) {
        const result = JSON.parse(authResult);
        if (result.type === 'CILOGON_AUTH_SUCCESS' && Date.now() - result.timestamp < 300000) {
          console.log('Manual check found completed authentication, performing token exchange...');
          localStorage.removeItem('cilogon_auth_result');
          
          try {
            // Get stored code verifier
            let storedCodeVerifier = sessionStorage.getItem('cilogon_code_verifier');
            
            // Try to recover from backup if missing
            if (!storedCodeVerifier) {
              const backup = localStorage.getItem('cilogon_state_backup');
              if (backup) {
                const parsed = JSON.parse(backup);
                if (Date.now() - parsed.timestamp < 600000) {
                  storedCodeVerifier = parsed.codeVerifier;
                  console.log('Recovered code verifier from backup for manual continue');
                }
              }
            }
            
            if (!storedCodeVerifier) {
              throw new Error('Code verifier not found');
            }
            
            // Perform token exchange
            const cilogonProvider = new CILogonProvider();
            const token = await cilogonProvider.exchangeCodeForToken(result.code, result.state, storedCodeVerifier);
            
            console.log('Token exchange successful in manual continue:', token);
            
            setDeviceFlow({ status: "success", token });
            toast.success("✅ CILogon authentication successful!");
            setIsLoading(false);
            setTimeout(() => {
              onComplete();
            }, 1500);
            
          } catch (exchangeError) {
            console.error('Token exchange failed in manual continue:', exchangeError);
            toast.error(`Token exchange failed: ${exchangeError instanceof Error ? exchangeError.message : 'Unknown error'}`);
            setDeviceFlow({ 
              status: "error", 
              error: `Token exchange failed: ${exchangeError instanceof Error ? exchangeError.message : 'Unknown error'}`
            });
          }
          
        } else if (result.type === 'CILOGON_AUTH_SUCCESS') {
          toast.info("Found authentication data but it's too old. Please try again.");
          localStorage.removeItem('cilogon_auth_result');
        } else {
          toast.info("No successful authentication found. Please complete the login in the popup window.");
        }
      } else {
        toast.info("No authentication data found. Please complete the login in the popup window first.");
      }
    } catch (e) {
      console.error('Error checking for completed auth:', e);
      toast.error("Error checking authentication status.");
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
            Authenticate with {provider.toUpperCase()}
          </CardTitle>
          <CardDescription className="text-lg mt-2 text-[rgb(50,135,200)] text-center">
            Complete the authentication flow to obtain your token
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-10 pt-0">
          {provider === "cilogon" && (
            <>
              {deviceFlow.status === "idle" && (
                <div className="space-y-6">
                  <Alert className="border-2 border-[rgb(120,176,219)] bg-[rgb(236,244,250)]">
                    <AlertDescription className="text-base text-[rgb(64,143,204)]">
                      <strong>CILogon Authentication:</strong> Click the button below to open CILogon in a popup window. After completing authentication, the popup will close automatically and return your token.
                    </AlertDescription>
                  </Alert>
                  
                  {/* URL Information Display */}
                  <Alert className="border-2 border-[rgb(50,135,200)] bg-white">
                    <AlertDescription className="text-sm text-[rgb(64,143,204)]">
                      <div className="space-y-2">
                        <p><strong>Debug Information:</strong></p>
                        <div className="space-y-1 font-mono text-xs break-all">
                          <div>
                            <span className="font-bold text-[rgb(50,135,200)]">Client ID:</span>
                            <br />
                            <span className="text-[rgb(64,143,204)]">{config.cilogon.clientId}</span>
                          </div>
                          <div>
                            <span className="font-bold text-[rgb(50,135,200)]">Registered Redirect URI:</span>
                            <br />
                            <span className="text-[rgb(64,143,204)]">{config.cilogon.redirectUri}</span>
                          </div>
                          <div>
                            <span className="font-bold text-[rgb(50,135,200)]">Current Window Location:</span>
                            <br />
                            <span className="text-[rgb(64,143,204)]">{typeof window !== 'undefined' ? window.location.origin + window.location.pathname : 'N/A'}</span>
                          </div>
                          <div>
                            <span className="font-bold text-[rgb(50,135,200)]">Scope:</span>
                            <br />
                            <span className="text-[rgb(64,143,204)]">{config.cilogon.scope}</span>
                          </div>
                          <div className="mt-2 p-2 bg-[rgb(236,244,250)] rounded">
                            <span className="font-bold text-[rgb(50,135,200)]">Callback Status:</span>
                            <br />
                            <span className="text-[rgb(64,143,204)]">✓ Callback file exists at both /auth/callback/cilogon/ and /multi-provider-authe/auth/callback/cilogon/</span>
                          </div>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                  
                  <Button 
                    onClick={startCILogonFlow} 
                    disabled={isLoading} 
                    size="lg" 
                    className="w-full py-4 text-lg font-semibold bg-[rgb(50,135,200)] hover:bg-[rgb(64,143,204)] text-[rgb(255,255,255)]"
                  >
                    {isLoading ? "Opening Authentication..." : "Login with CILogon"}
                  </Button>
                </div>
              )}
              {deviceFlow.status === "pending" && (
                <div className="space-y-4">
                  <Alert className="border-2 border-[rgb(120,176,219)] bg-[rgb(236,244,250)]">
                    <Clock className="h-5 w-5 text-[rgb(50,135,200)]" />
                    <AlertDescription className="text-base ml-2 text-[rgb(64,143,204)]">
                      <strong>Please complete authentication in the popup window.</strong> If you don't see a popup, check if your browser blocked it and allow popups for this site.
                      <br />
                      <small className="text-xs mt-2 block opacity-75">If you've completed authentication and see "Authentication data saved locally" message, please click the button below to continue.</small>
                    </AlertDescription>
                  </Alert>
                  
                  <Button 
                    onClick={handleContinue}
                    variant="default"
                    size="lg"
                    className="w-full bg-[rgb(50,135,200)] hover:bg-[rgb(64,143,204)] text-[rgb(255,255,255)]"
                  >
                    ✅ I've completed authentication - Continue
                  </Button>
                </div>
              )}

              {deviceFlow.status === "success" && (
                <Alert className="border-2 border-green-200 bg-green-50">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <AlertDescription className="text-base ml-2 text-green-800">
                    ✅ Authentication successful! Redirecting to your token page...
                  </AlertDescription>
                </Alert>
              )}

              {deviceFlow.status === "window_closed" && (
                <div className="space-y-4">
                  <Alert className="border-2 border-[rgb(120,176,219)] bg-[rgb(236,244,250)]">
                    <AlertDescription className="text-base text-[rgb(64,143,204)]">
                      <strong>Authentication window was closed.</strong> If you completed the authentication process in the popup window, please click the button below to continue.
                    </AlertDescription>
                  </Alert>
                  
                  <Button 
                    onClick={handleContinue}
                    variant="default"
                    size="lg"
                    className="w-full bg-[rgb(50,135,200)] hover:bg-[rgb(64,143,204)] text-[rgb(255,255,255)]"
                  >
                    ✅ I've completed authentication - Continue
                  </Button>
                  
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

              {deviceFlow.status === "error" && (
                <div className="space-y-4">
                  <Alert variant="destructive">
                    <XCircle className="h-5 w-5" />
                    <AlertDescription>
                      {deviceFlow.error}
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-4">
                    <Alert className="border-2 border-[rgb(120,176,219)] bg-[rgb(236,244,250)]">
                      <AlertDescription className="text-sm text-[rgb(64,143,204)]">
                        <p><strong>Troubleshooting Tips:</strong></p>
                        <ul className="list-disc ml-4 mt-2 space-y-1">
                          <li>Ensure you have a valid CILogon account</li>
                          <li>Try using a different browser or incognito mode</li>
                          <li>Check if your browser is blocking pop-ups or redirects</li>
                          <li>Clear your browser cache and cookies</li>
                          <li>Disable browser extensions that might interfere</li>
                        </ul>
                      </AlertDescription>
                    </Alert>
                    
                    <Button 
                      onClick={() => {
                        setDeviceFlow({ status: "idle" });
                        setIsLoading(false);
                      }}
                      variant="default"
                      size="lg"
                      className="w-full bg-[rgb(50,135,200)] hover:bg-[rgb(64,143,204)] text-[rgb(255,255,255)]"
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}

          {provider === "orcid" && (
            <>
              {deviceFlow.status === "idle" && (
                <div className="space-y-6">
                  <Alert className="border-2 border-[rgb(120,176,219)] bg-[rgb(236,244,250)]">
                    <AlertDescription className="text-base text-[rgb(64,143,204)]">
                      <strong>ORCID strives to enable transparent and trustworthy connections between researchers, their contributions, and their affiliations by providing a unique, persistent identifier for individuals to use as they engage in research, scholarship, and innovation activities.</strong>
                      <br /><br />
                      We do this by providing three interrelated services:
                      <ul className="list-disc ml-4 mt-2">
                        <li>The ORCID iD: a unique, persistent identifier free of charge to researchers</li>
                        <li>An ORCID record connected to the ORCID iD, and</li>
                        <li>A set of Application Programming Interfaces (APIs), as well as the services and support of communities of practice that enable interoperability between an ORCID record and member organizations so researchers can choose to allow connection of their iD with their affiliations and contributions</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                  
                  <Button 
                    onClick={startORCIDFlow} 
                    disabled={isLoading}
                    size="lg"
                    className="w-full py-4 text-lg font-semibold bg-[rgb(50,135,200)] hover:bg-[rgb(64,143,204)] text-[rgb(255,255,255)]"
                  >
                    {isLoading ? "Opening Authentication..." : "Login with ORCID"}
                  </Button>
                </div>
              )}

              {deviceFlow.status === "success" && (
                <Alert className="border-2 border-green-200 bg-green-50">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <AlertDescription className="text-base ml-2 text-green-800">
                    ✅ Authentication successful! Redirecting to your token page...
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
                  
                  <div className="space-y-4">
                    <Alert className="border-2 border-[rgb(120,176,219)] bg-[rgb(236,244,250)]">
                      <AlertDescription className="text-sm text-[rgb(64,143,204)]">
                        <p><strong>Troubleshooting Tips:</strong></p>
                        <ul className="list-disc ml-4 mt-2 space-y-1">
                          <li>Ensure you have a valid ORCID account</li>
                          <li>Try using a different browser or incognito mode</li>
                          <li>Check if your browser is blocking pop-ups or redirects</li>
                          <li>Clear your browser cache and cookies</li>
                          <li>Disable browser extensions that might interfere</li>
                        </ul>
                      </AlertDescription>
                    </Alert>
                    
                    <Button 
                      onClick={() => {
                        setDeviceFlow({ status: "idle" });
                        setIsLoading(false);
                      }}
                      variant="default"
                      size="lg"
                      className="w-full bg-[rgb(50,135,200)] hover:bg-[rgb(64,143,204)] text-[rgb(255,255,255)]"
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}