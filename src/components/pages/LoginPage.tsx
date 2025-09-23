import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle } from "@phosphor-icons/react";
import { Provider } from "@/lib/config";
import { CILogonProvider } from "@/lib/providers/cilogon";
import { toast } from "sonner";

interface LoginPageProps {
  provider: Provider;
  onComplete: () => void;
  onBack: () => void;
}

export const LoginPage = ({ provider, onComplete, onBack }: LoginPageProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [deviceFlow, setDeviceFlow] = useState<{
    status: "idle" | "success" | "error";
    error?: string;
  }>({ status: "idle" });

  const startCILogonFlow = async () => {
    setIsLoading(true);
    try {
      const cilogonProvider = new CILogonProvider();
      await cilogonProvider.startAuthentication();
    } catch (error: any) {
      console.error("CILogon authentication failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Authentication failed";
      toast.error(errorMessage);
      setDeviceFlow({ 
        status: "error", 
        error: errorMessage
      });
      setIsLoading(false);
    }
  };

  const startORCIDFlow = async () => {
    setIsLoading(true);
    try {
      // ORCID authentication logic would go here
      toast.error("ORCID authentication not yet implemented");
      setDeviceFlow({ 
        status: "error", 
        error: "ORCID authentication not yet implemented"
      });
      setIsLoading(false);
    } catch (error: any) {
      console.error("ORCID authentication failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Authentication failed";
      toast.error(errorMessage);
      setDeviceFlow({ 
        status: "error", 
        error: errorMessage
      });
      setIsLoading(false);
    }
  };

  const startFabricFlow = async () => {
    setIsLoading(true);
    try {
      // FABRIC authentication logic would go here
      toast.error("FABRIC authentication not yet implemented");
      setDeviceFlow({ 
        status: "error", 
        error: "FABRIC authentication not yet implemented"
      });
      setIsLoading(false);
    } catch (error: any) {
      console.error("FABRIC authentication failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Authentication failed";
      toast.error(errorMessage);
      setDeviceFlow({ 
        status: "error", 
        error: errorMessage
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span style={{ color: 'rgb(50, 135, 200)' }}>Atlantic</span>
            <span style={{ color: 'rgb(64, 143, 204)' }}>Wave</span>
            <span className="text-white px-2 py-1 rounded-lg ml-2" style={{ backgroundColor: 'rgb(120, 176, 219)' }}>
              SDX
            </span>
          </h1>
          <p className="text-xs" style={{ color: 'rgb(64, 143, 204)' }}>
            International Distributed Software-Defined Exchange
          </p>
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
                  <div className="space-y-6">
                    <Alert className="border-2 border-[rgb(120,176,219)] bg-[rgb(236,244,250)]">
                      <AlertDescription className="text-base text-[rgb(64,143,204)]">
                        <strong>CILogon Authentication:</strong> Click the button below to authenticate with your institution via CILogon. You will be redirected to CILogon.org and then back to complete the authentication.
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

                {deviceFlow.status === "success" && (
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

            {provider === "orcid" && (
              <>
                {deviceFlow.status === "idle" && (
                  <div className="space-y-6">
                    <Alert className="border-2 border-[rgb(120,176,219)] bg-[rgb(236,244,250)]">
                      <AlertDescription className="text-base text-[rgb(64,143,204)]">
                        <strong>ORCID Authentication:</strong> Click the button below to authenticate with your ORCID account.
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
                        <strong>FABRIC API Authentication:</strong> FABRIC API authentication requires a valid CILogon token. 
                        Please authenticate with CILogon first if you haven't already.
                      </AlertDescription>
                    </Alert>
                    <Button 
                      onClick={startFabricFlow} 
                      disabled={isLoading} 
                      size="lg" 
                      className="w-full py-4 text-lg font-semibold bg-[rgb(50,135,200)] hover:bg-[rgb(64,143,204)] text-[rgb(255,255,255)]"
                    >
                      {isLoading ? "Creating Token..." : "Login with FABRIC API"}
                    </Button>
                  </div>
                )}

                {deviceFlow.status === "success" && (
                  <Alert className="border-2 border-green-200 bg-green-50">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <AlertDescription className="text-base ml-2 text-green-800">
                      Authentication successful! Redirecting to your token...
                    </AlertDescription>
                  </Alert>
                )}

                {deviceFlow.status === "error" && (
                  <div className="space-y-4">
                    <Alert variant="destructive" className="border-2 border-destructive/20">
                      <XCircle className="h-5 w-5" />
                      <AlertDescription className="text-base ml-2">
                        {deviceFlow.error}
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};