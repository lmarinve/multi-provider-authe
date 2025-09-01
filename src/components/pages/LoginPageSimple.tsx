import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Provider } from "@/lib/config";

interface LoginPageProps {
  provider: Provider;
  onComplete: () => void;
  onBack: () => void;
}

export function LoginPage({ provider, onComplete, onBack }: LoginPageProps) {
  const [isLoading, setIsLoading] = useState(false);

  const getProviderName = (provider: Provider) => {
    switch (provider) {
      case "cilogon": return "CILogon";
      case "orcid": return "ORCID";
      default: return provider;
    }
  };

  const handleAuthenticate = async () => {
    setIsLoading(true);
    try {
      let tokenData;
      
      switch (provider) {
        case "cilogon":
          const { CILogonProvider } = await import("@/lib/providers/cilogon");
          const cilogonProvider = new CILogonProvider();
          tokenData = await cilogonProvider.startAuthenticationPopup();
          break;
        case "orcid":
          const { ORCIDProvider } = await import("@/lib/providers/orcid");
          const orcidProvider = new ORCIDProvider();
          tokenData = await orcidProvider.startAuthenticationPopup();
          break;
        default:
          throw new Error(`Unknown provider: ${provider}`);
      }
      
      toast.success(`Authentication with ${getProviderName(provider)} completed!`);
      onComplete();
      
    } catch (error) {
      console.error(`${provider} authentication error:`, error);
      toast.error(error instanceof Error ? error.message : `Authentication with ${getProviderName(provider)} failed`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-4 mb-8">
          <div className="flex flex-col items-center space-y-6">
            {/* Title with custom colors and slightly increased size */}
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
            
            {/* Subtitle with maximum size reduction and Deep Blue color */}
            <h2 
              className="text-[0.5rem] font-light uppercase tracking-wide opacity-70"
              style={{ color: 'rgb(64, 143, 204)' }}
            >
              International Distributed Software-Defined Exchange
            </h2>
          </div>
        </div>

        {/* Authentication Card */}
        <Card className="bg-[rgb(236,244,250)] border-[rgb(120,176,219)] shadow-lg">
          <CardHeader className="pb-3 pt-4 px-4 bg-[rgb(50,135,200)] text-white rounded-t-lg text-center">
            <CardTitle className="text-lg">Authenticate with {getProviderName(provider)}</CardTitle>
            <CardDescription className="text-[rgb(236,244,250)] mt-1">
              Complete the authentication flow to obtain your token
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <Alert>
              <AlertDescription className="text-[rgb(64,143,204)]">
                Click the button below to authenticate with {getProviderName(provider)}. 
                This will open a new window where you can complete the authentication process.
              </AlertDescription>
            </Alert>

            <div className="flex flex-col items-center space-y-4">
              <Button
                onClick={handleAuthenticate}
                disabled={isLoading}
                className="w-full max-w-xs"
                style={{
                  backgroundColor: 'rgb(50, 135, 200)',
                  color: 'rgb(255, 255, 255)'
                }}
              >
                {isLoading ? 'Authenticating...' : `Login with ${getProviderName(provider)}`}
              </Button>

              <Button
                variant="outline"
                onClick={onBack}
                disabled={isLoading}
                className="w-full max-w-xs"
                style={{
                  borderColor: 'rgb(120, 176, 219)',
                  color: 'rgb(64, 143, 204)'
                }}
              >
                Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}