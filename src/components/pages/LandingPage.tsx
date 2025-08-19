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
    <div className="container mx-auto px-6 py-16 max-w-2xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-6 tracking-tight">SDX Multi Provider Authentication</h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Select your environment and identity provider to authenticate with SDX
        </p>
      </div>

      <Card className="mb-8 shadow-sm">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Environment
          </CardTitle>
          <CardDescription>
            Choose the target environment for your authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <RadioGroup value={environment} onValueChange={onEnvironmentChange} className="space-y-4">
            <div className="flex items-center space-x-3 p-3 rounded-lg border border-transparent hover:border-border transition-colors">
              <RadioGroupItem value="test" id="test" />
              <Label htmlFor="test" className="flex items-center gap-2 cursor-pointer flex-1">
                <TestTube className="h-4 w-4" />
                Test Environment
                <Badge variant="secondary">Development</Badge>
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg border border-transparent hover:border-border transition-colors">
              <RadioGroupItem value="production" id="production" />
              <Label htmlFor="production" className="flex items-center gap-2 cursor-pointer flex-1">
                <Server className="h-4 w-4" />
                Production Environment
                <Badge variant="destructive">Live</Badge>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card className="mb-12 shadow-sm">
        <CardHeader className="pb-6">
          <CardTitle>Identity Provider</CardTitle>
          <CardDescription>
            Choose your preferred authentication provider
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid gap-4">
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
                        className="w-full justify-start p-6 h-auto min-h-20 transition-all hover:shadow-md"
                        onClick={() => onProviderSelect(provider)}
                      >
                        <div className={`p-3 rounded-full ${info.color} text-white mr-4 flex-shrink-0`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="text-left flex-1">
                          <div className="font-semibold text-base mb-1">{info.name}</div>
                          <div className="text-sm text-muted-foreground leading-relaxed">
                            {info.description}
                          </div>
                        </div>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">{info.description}</p>
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
          className="px-8 py-3 text-base font-medium min-w-64"
        >
          Continue with {selectedProvider ? providerInfo[selectedProvider].name : "Provider"}
        </Button>
      </div>
    </div>
  );
}