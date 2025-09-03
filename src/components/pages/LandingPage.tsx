import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Provider } from "@/lib/types";
import { getAllTokens } from "@/lib/token-storage";

interface LandingPageProps {
  selectedProvider: Provider | undefined;
  onProviderSelect: (provider: Provider) => void;
  onLogin: (provider: Provider) => void;
}

export const LandingPage = ({ 
  selectedProvider, 
  onProviderSelect, 
  onLogin 
}: LandingPageProps) => {
  const tokens = getAllTokens();
  
  const providers = [
    {
      id: "cilogon" as Provider,
      name: "CILogon",
      subtitle: "Academic Federation",
      description: "CILogon provides secure access to cyberinfrastructure. Sign on with your home organization's credentials to access grid and cloud resources.",
      authenticated: !!tokens.cilogon
    },
    {
      id: "orcid" as Provider,
      name: "ORCID",
      subtitle: "Research Identity",
      description: "ORCID strives to enable transparent and trustworthy connections between researchers, their contributions, and their affiliations by providing a unique, persistent identifier.",
      authenticated: !!tokens.orcid
    }
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-2">
            <span style={{ color: 'rgb(50, 135, 200)' }}>Atlantic</span>
            <span style={{ color: 'rgb(64, 143, 204)' }}>Wave</span>
            <span className="text-white px-3 py-1 rounded-lg ml-2" style={{ backgroundColor: 'rgb(120, 176, 219)' }}>
              SDX
            </span>
          </h1>
          <p className="text-xs" style={{ color: 'rgb(64, 143, 204)' }}>
            International Distributed Software-Defined Exchange
          </p>
        </div>

        {/* Provider Selection */}
        <div className="text-center mb-8">
          <p className="text-lg text-primary mb-6">
            Select an Identity Provider
          </p>
          
          <div className="grid gap-6 md:grid-cols-2">
            {providers.map((provider) => (
              <Card 
                key={provider.id}
                className={`p-6 cursor-pointer transition-all duration-200 border-2 ${
                  selectedProvider === provider.id
                    ? 'border-primary bg-muted'
                    : 'border-border hover:border-primary'
                }`}
                onClick={() => onProviderSelect(provider.id)}
              >
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-primary mb-1">
                    {provider.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {provider.subtitle}
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    {provider.description}
                  </p>
                  <div className="text-sm">
                    {provider.authenticated ? (
                      <span className="text-green-600 font-medium">✓ Authenticated</span>
                    ) : (
                      <span className="text-muted-foreground">Not Authenticated</span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <Button
            size="lg"
            onClick={() => selectedProvider && onLogin(selectedProvider)}
            disabled={!selectedProvider}
            className="px-8 py-3 text-lg"
          >
            Continue to Provider
          </Button>
        </div>
      </div>
    </div>
  );
};