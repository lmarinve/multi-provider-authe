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
import { 
  Copy, 
  ExternalLink, 
  CheckCircle, 
  XCircle, 
  Clock
} from "@phosphor-icons/react";
import sdxLogo from "@/assets/images/sdx-logo.svg";

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
      await ORCIDProvider.handleCallback(code, state);
      toast.success("ORCID authentication successful!");
      onComplete();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Authentication failed";
      toast.error(message);
      setDeviceFlow({ status: "error", error: message });
    } finally {
      setIsLoading(false);
    }
  };

  const startCILogonFlow = async () => {
    setIsLoading(true);
    try {
      const response = await CILogonProvider.startDeviceFlow();
      
      setDeviceFlow({
        status: "polling",
        deviceCode: response.device_code,
        userCode: response.user_code,
        verificationUri: response.verification_uri,
        verificationUriComplete: response.verification_uri_complete,
        expiresAt: Date.now() + (response.expires_in * 1000),
        interval: response.interval,
      });

      // Start polling
      pollForCILogonToken(response.device_code, response.interval);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to start device flow";
      toast.error(message);
      setDeviceFlow({ status: "error", error: message });
    } finally {
      setIsLoading(false);
    }
  };

  const pollForCILogonToken = async (deviceCode: string, interval: number) => {
    const pollInterval = setInterval(async () => {
      try {
        await CILogonProvider.exchangeForToken(deviceCode);
        clearInterval(pollInterval);
        setDeviceFlow({ status: "success" });
        toast.success("CILogon authentication successful!");
        setTimeout(onComplete, 1000);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        
        if (message.includes("authorization_pending")) {
          // Continue polling
          return;
        }
        
        if (message.includes("slow_down")) {
          // Increase interval
          clearInterval(pollInterval);
          setTimeout(() => pollForCILogonToken(deviceCode, interval + 5), (interval + 5) * 1000);
          return;
        }
        
        if (message.includes("access_denied") || message.includes("expired_token")) {
          clearInterval(pollInterval);
          setDeviceFlow({ status: "error", error: message });
          toast.error(`Authentication failed: ${message}`);
          return;
        }
        
        // Other errors
        clearInterval(pollInterval);
        setDeviceFlow({ status: "error", error: message });
        toast.error(`Authentication failed: ${message}`);
      }
    }, interval * 1000);

    // Clear interval if component unmounts or expires
    setTimeout(() => {
      clearInterval(pollInterval);
      if (deviceFlow.status === "polling") {
        setDeviceFlow({ status: "error", error: "Device code expired" });
      }
    }, deviceFlow.expiresAt ? deviceFlow.expiresAt - Date.now() : 600000);
  };

  const startORCIDFlow = async () => {
    setIsLoading(true);
    try {
      const authUrl = await ORCIDProvider.initiateLogin();
      window.location.href = authUrl;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to start ORCID flow";
      toast.error(message);
      setDeviceFlow({ status: "error", error: message });
      setIsLoading(false);
    }
  };

  const startFabricFlow = async () => {
    setIsLoading(true);
    try {
      const cilogonToken = TokenStorage.getToken("cilogon");
      
      if (!cilogonToken || !TokenStorage.isTokenValid(cilogonToken)) {
        toast.error("Please authenticate with CILogon first");
        setDeviceFlow({ status: "error", error: "CILogon token required" });
        setIsLoading(false);
        return;
      }

      await FabricProvider.createToken();
      toast.success("FABRIC API authentication successful!");
      onComplete();
    } catch (error) {
      const message = error instanceof Error ? error.message : "FABRIC API authentication failed";
      toast.error(message);
      setDeviceFlow({ status: "error", error: message });
    } finally {
      setIsLoading(false);
    }
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
          {/* Title and Logo in same line */}
          <div className="flex items-center justify-center gap-6">
            {/* SDX Logo */}
            <div className="w-16 h-16 bg-white border border-[rgb(120,176,219)] rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <img src={sdxLogo} alt="SDX Logo" className="h-12 w-auto object-contain" />
            </div>
            {/* Title with custom colors */}
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight leading-tight flex items-center gap-3">
              <span 
                className="px-2 py-1 rounded-md"
                style={{ 
                  color: 'rgb(50, 135, 200)', 
                  backgroundColor: 'rgb(255, 255, 255)' 
                }}
              >
                AtlanticWave
              </span>
              <span 
                className="px-2 py-1 rounded-md"
                style={{ 
                  color: 'rgb(255, 255, 255)', 
                  backgroundColor: 'rgb(255, 255, 255)' 
                }}
              >
                -
              </span>
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
          
          {/* Subtitle with maximum size reduction and Deep Blue color */}
          <h2 
            className="text-[0.5rem] font-light uppercase tracking-wide opacity-70"
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
                      Please visit the verification URL and enter the user code below.
                      Waiting for authentication...
                    </AlertDescription>
                  </Alert>

                  <div className="grid gap-8">
                    <div className="space-y-4">
                      <Label className="text-base font-semibold text-foreground">Verification URL</Label>
                      <div className="flex items-center gap-4">
                        <code className="flex-1 p-4 bg-muted rounded-xl text-base font-mono border-2 border-border/20">
                          {deviceFlow.verificationUri}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          className="px-4 py-2 border-2 border-border/20 hover:border-primary/30"
                          onClick={() => copyToClipboard(deviceFlow.verificationUri!)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="px-4 py-2 border-2 border-border/20 hover:border-primary/30"
                          onClick={() => window.open(deviceFlow.verificationUri, "_blank")}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-base font-semibold text-foreground">User Code</Label>
                      <div className="flex items-center gap-4">
                        <code className="flex-1 p-6 bg-accent/10 rounded-xl text-2xl font-mono tracking-widest text-center font-bold border-2 border-accent/20 text-accent">
                          {deviceFlow.userCode}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          className="px-4 py-2 border-2 border-border/20 hover:border-accent/30"
                          onClick={() => copyToClipboard(deviceFlow.userCode!)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {timeRemaining && (
                      <div className="space-y-4">
                        <div className="flex justify-between text-base">
                          <span className="font-semibold">Time remaining</span>
                          <span className="font-mono text-primary">{Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</span>
                        </div>
                        <Progress value={(timeRemaining / 600) * 100} className="h-3" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {deviceFlow.status === "success" && (
                <Alert className="border-2 border-accent/20 bg-accent/5">
                  <CheckCircle className="h-5 w-5 text-accent" />
                  <AlertDescription className="text-base ml-2">
                    Authentication successful! Redirecting...
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
                <Alert className="border-2 border-primary/20 bg-primary/5">
                  <Clock className="h-5 w-5 text-primary" />
                  <AlertDescription className="text-base ml-2">
                    Processing ORCID authentication...
                  </AlertDescription>
                </Alert>
              )}

              {deviceFlow.status === "error" && (
                <Alert variant="destructive" className="border-2 border-destructive/20">
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