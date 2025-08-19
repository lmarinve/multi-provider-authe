import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Environment, Provider } from "@/lib/config";
import { Shield, University, Fingerprint, Server, TestTube } from "@phosphor-icons/react";

interface LandingPageProps {
  environment: Environment;
  selectedProvider?: Provider;
  onEnvironmentChange: (env: Environment) => void;
  onProviderSelect: (provider: Provider) => void;
  onLogin: (provider: Provider) => void;
}

const providerInfo = {
  cilogon: {
    name: "CILogon",
    description: "Academic and research identity federation",
    icon: University,
    color: "bg-blue-500"
  },
  orcid: {
    name: "ORCID",
    description: "Persistent identifiers for researchers, enabling transparent connections between researchers, their contributions, and affiliations",
    icon: Fingerprint,
    color: "bg-green-500"
  },
  fabric: {
    name: "FABRIC API",
    description: "Adaptive programmable research infrastructure for networking, cybersecurity, distributed computing, and science applications",
    icon: Shield,
    color: "bg-purple-500"
  }
} as const;

export function LandingPage({
  environment,
  selectedProvider,
  onEnvironmentChange,
  onProviderSelect,
  onLogin
}: LandingPageProps) {
  const canContinue = selectedProvider;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-md mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            SDX Multi Provider Authentication
          </h1>
          <p className="text-muted-foreground text-lg">
            Select your environment and identity provider
          </p>
        </div>

        {/* Environment Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Environment
            </CardTitle>
            <CardDescription>
              Choose your target environment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup 
              value={environment} 
              onValueChange={onEnvironmentChange}
              className="space-y-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="test" id="test" />
                <Label htmlFor="test" className="flex items-center gap-2 cursor-pointer">
                  <TestTube className="h-4 w-4 text-accent" />
                  Test Environment
                  <Badge variant="secondary" className="ml-2">Dev</Badge>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="production" id="production" />
                <Label htmlFor="production" className="flex items-center gap-2 cursor-pointer">
                  <Server className="h-4 w-4 text-destructive" />
                  Production Environment
                  <Badge variant="destructive" className="ml-2">Live</Badge>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Provider Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Identity Provider</CardTitle>
            <CardDescription>
              Choose your authentication provider
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(providerInfo).map(([key, info]) => {
              const provider = key as Provider;
              const Icon = info.icon;
              const isSelected = selectedProvider === provider;
              
              return (
                <TooltipProvider key={provider}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={isSelected ? "default" : "outline"}
                        className={`w-full justify-start p-4 h-auto transition-all ${
                          isSelected ? 'shadow-md' : 'hover:shadow-sm'
                        }`}
                        onClick={() => onProviderSelect(provider)}
                      >
                        <div className={`p-2 rounded-lg ${info.color} text-white mr-3`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold">{info.name}</div>
                          <div className={`text-sm ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                            {info.name === "ORCID" 
                              ? "Researcher identifiers" 
                              : info.name === "FABRIC API" 
                              ? "Research infrastructure" 
                              : "Academic federation"
                            }
                          </div>
                        </div>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs">
                      <p className="text-sm">{info.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </CardContent>
        </Card>

        {/* Continue Button */}
        <div className="pt-4">
          <Button
            size="lg"
            disabled={!canContinue}
            onClick={() => canContinue && onLogin(selectedProvider)}
            className="w-full"
          >
            Continue with {selectedProvider ? providerInfo[selectedProvider].name : "Provider"}
          </Button>
        </div>
      </div>
    </div>
  );
}