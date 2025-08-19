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
    description: "Researcher identifier system",
    icon: Fingerprint,
    color: "bg-green-500"
  },
  fabric: {
    name: "FABRIC API",
    description: "Adaptive programmable research infrastructure for networking, cybersecurity, and distributed computing",
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
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">SDX Multi Provider Authentication</h1>
        <p className="text-muted-foreground">
          Select your environment and identity provider to authenticate with SDX
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Environment
          </CardTitle>
          <CardDescription>
            Choose the target environment for your authentication
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={environment} onValueChange={onEnvironmentChange}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="test" id="test" />
              <Label htmlFor="test" className="flex items-center gap-2">
                <TestTube className="h-4 w-4" />
                Test Environment
                <Badge variant="secondary">Development</Badge>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="production" id="production" />
              <Label htmlFor="production" className="flex items-center gap-2">
                <Server className="h-4 w-4" />
                Production Environment
                <Badge variant="destructive">Live</Badge>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Identity Provider</CardTitle>
          <CardDescription>
            Choose your preferred authentication provider
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
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
                        size="lg"
                        className="w-full justify-start p-6 h-auto"
                        onClick={() => onProviderSelect(provider)}
                      >
                        <div className={`p-2 rounded-full ${info.color} text-white mr-4`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold">{info.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {info.description}
                          </div>
                        </div>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{info.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <Button
          size="lg"
          disabled={!canContinue}
          onClick={() => canContinue && onLogin(selectedProvider)}
        >
          Continue with {selectedProvider ? providerInfo[selectedProvider].name : "Provider"}
        </Button>
      </div>
    </div>
  );
}