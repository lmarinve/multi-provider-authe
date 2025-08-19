import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Environment, Provider } from "@/lib/config";
import { TokenData, DeviceFlowState } from "@/lib/types";
import { TokenStorage } from "@/lib/token-storage";
import { CILogonProvider } from "@/lib/providers/cilogon";
import { ORCIDProvider } from "@/lib/providers/orcid";
import { FabricProvider } from "@/lib/providers/fabric";
import { 
  ArrowLeft, 
  Copy, 
  ExternalLink, 
  CheckCircle, 
  XCircle, 
  Clock,
  University,
  Fingerprint,
  Shield
} from "@phosphor-icons/react";

interface LoginPageProps {
  provider: Provider;
  environment: Environment;
  onComplete: () => void;
  onBack: () => void;
}

const providerIcons = {
  cilogon: University,
  orcid: Fingerprint,
  fabric: Shield,
};

export function LoginPage({ provider, environment, onComplete, onBack }: LoginPageProps) {
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

  const Icon = providerIcons[provider];
  const timeRemaining = getTimeRemaining();

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Button variant="ghost" onClick={onBack} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to selection
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-full text-primary-foreground">
              <Icon className="h-5 w-5" />
            </div>
            Authenticate with {provider === 'fabric' ? 'FABRIC API' : provider.toUpperCase()}
            <Badge variant="secondary">{environment}</Badge>
          </CardTitle>
          <CardDescription>
            Complete the authentication flow to obtain your token
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {provider === "cilogon" && (
            <>
              {deviceFlow.status === "idle" && (
                <Button 
                  onClick={startCILogonFlow} 
                  disabled={isLoading} 
                  size="lg" 
                  className="w-full"
                >
                  Start CILogon Device Flow
                </Button>
              )}

              {deviceFlow.status === "polling" && (
                <div className="space-y-4">
                  <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertDescription>
                      Please visit the verification URL and enter the user code below.
                      Waiting for authentication...
                    </AlertDescription>
                  </Alert>

                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Verification URL</Label>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 p-3 bg-muted rounded-md text-sm">
                          {deviceFlow.verificationUri}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(deviceFlow.verificationUri!)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(deviceFlow.verificationUri, "_blank")}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">User Code</Label>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 p-3 bg-muted rounded-md text-lg font-mono tracking-wider text-center">
                          {deviceFlow.userCode}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(deviceFlow.userCode!)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {timeRemaining && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Time remaining</span>
                          <span>{Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</span>
                        </div>
                        <Progress value={(timeRemaining / 600) * 100} />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {deviceFlow.status === "success" && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Authentication successful! Redirecting...
                  </AlertDescription>
                </Alert>
              )}

              {deviceFlow.status === "error" && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
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
                  className="w-full"
                >
                  Login with ORCID
                </Button>
              )}

              {isLoading && (
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    Processing ORCID authentication...
                  </AlertDescription>
                </Alert>
              )}

              {deviceFlow.status === "error" && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
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
                <div className="space-y-4">
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      FABRIC API authentication requires a valid CILogon token. 
                      Please authenticate with CILogon first if you haven't already.
                    </AlertDescription>
                  </Alert>
                  <Button 
                    onClick={startFabricFlow} 
                    disabled={isLoading} 
                    size="lg" 
                    className="w-full"
                  >
                    Create FABRIC API Token
                  </Button>
                </div>
              )}

              {isLoading && (
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    Creating FABRIC API token...
                  </AlertDescription>
                </Alert>
              )}

              {deviceFlow.status === "error" && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
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