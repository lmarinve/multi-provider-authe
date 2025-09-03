import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Provider } from "@/lib/types";
import { toast } from "sonner";

interface LoginPageProps {
  provider: Provider;
  onComplete: () => void;
  onBack: () => void;
}

export const LoginPage = ({ provider, onComplete, onBack }: LoginPageProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const providerInfo = {
    cilogon: {
      name: "CILogon",
      description: "Academic Federation Login"
    },
    orcid: {
      name: "ORCID", 
      description: "Research Identity Login"
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    
    try {
      // Simulate login process
      toast.info(`Initiating ${providerInfo[provider].name} authentication...`);
      
      // In a real implementation, this would handle the OAuth flow
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success("Authentication successful!");
      onComplete();
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Authentication failed. Please try again.");
    } finally {
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

        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              Authenticate with {providerInfo[provider].name.toUpperCase()}
            </CardTitle>
            <p className="text-center text-sm text-muted-foreground">
              Complete the authentication flow to obtain your token
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? "Authenticating..." : `Login with ${providerInfo[provider].name}`}
            </Button>
            
            <Button
              variant="outline"
              onClick={onBack}
              className="w-full"
              disabled={isLoading}
            >
              Back to Provider Selection
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};