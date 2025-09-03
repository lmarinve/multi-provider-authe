import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllTokens, clearAllTokens } from "@/lib/token-storage";
import { toast } from "sonner";

interface TokenPageProps {
  onBack: () => void;
}

export const TokenPage = ({ onBack }: TokenPageProps) => {
  const [tokens] = useState(getAllTokens());
  const [isLoading, setIsLoading] = useState(false);

  const handleSendToBackend = async () => {
    setIsLoading(true);
    
    try {
      // Simulate sending token to backend
      toast.info("Sending token to backend...");
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success("Token sent successfully!");
    } catch (error) {
      console.error("Backend error:", error);
      toast.error("Failed to send token to backend");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearTokens = () => {
    clearAllTokens();
    toast.success("All tokens cleared");
    onBack();
  };

  const tokenEntries = Object.entries(tokens);

  if (tokenEntries.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">No Valid Tokens</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                You don't have any valid tokens. Please authenticate with a provider first.
              </p>
              <Button onClick={onBack} className="w-full">
                Back to Authentication
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl">
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
            <CardTitle>Authentication Tokens</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {tokenEntries.map(([provider, token]) => (
              <div key={provider} className="p-4 border rounded-lg">
                <h3 className="font-semibold text-lg mb-2 capitalize">
                  {provider} Token
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Provider:</span> {provider}
                  </div>
                  <div>
                    <span className="font-medium">Issued:</span>{" "}
                    {new Date(token.issued_at).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Expires:</span>{" "}
                    {new Date(token.issued_at + token.expires_in * 1000).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>{" "}
                    <span className="text-green-600">Valid</span>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="flex flex-col gap-3">
              <Button
                onClick={handleSendToBackend}
                disabled={isLoading}
                size="lg"
                className="w-full"
              >
                {isLoading ? "Sending..." : "Send Token to Backend"}
              </Button>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleClearTokens}
                  className="flex-1"
                >
                  Clear Tokens
                </Button>
                
                <Button
                  variant="outline"
                  onClick={onBack}
                  className="flex-1"
                >
                  Back to Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};