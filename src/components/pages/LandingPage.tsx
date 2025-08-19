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
    <div className="container mx-auto px-6 py-16 max-w-4xl">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-8 tracking-tight text-foreground">
          SDX Multi Provider Authentication
        </h1>
        <p className="text-muted-foreground text-xl leading-relaxed max-w-2xl mx-auto">
          Select your environment and identity provider to authenticate with SDX
        </p>
      </div>

      <div className="space-y-8">
        <Card className="shadow-lg border-2 border-border/20">
          <CardHeader className="pb-8">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Server className="h-6 w-6 text-primary" />
              Environment
            </CardTitle>
            <CardDescription className="text-lg mt-2">
              Choose the target environment for your authentication
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <RadioGroup value={environment} onValueChange={onEnvironmentChange} className="space-y-6">
              <div className="flex items-center space-x-4 p-4 rounded-xl border-2 border-transparent hover:border-primary/20 hover:bg-primary/5 transition-all">
                <RadioGroupItem value="test" id="test" className="text-primary" />
                <Label htmlFor="test" className="flex items-center gap-3 cursor-pointer flex-1 text-base">
                  <TestTube className="h-5 w-5 text-accent" />
                  <span className="font-semibold">Test Environment</span>
                  <Badge variant="secondary" className="ml-auto">Development</Badge>
                </Label>
              </div>
              <div className="flex items-center space-x-4 p-4 rounded-xl border-2 border-transparent hover:border-primary/20 hover:bg-primary/5 transition-all">
                <RadioGroupItem value="production" id="production" className="text-primary" />
                <Label htmlFor="production" className="flex items-center gap-3 cursor-pointer flex-1 text-base">
                  <Server className="h-5 w-5 text-destructive" />
                  <span className="font-semibold">Production Environment</span>
                  <Badge variant="destructive" className="ml-auto">Live</Badge>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-2 border-border/20">
          <CardHeader className="pb-8">
            <CardTitle className="text-2xl">Identity Provider</CardTitle>
            <CardDescription className="text-lg mt-2">
              Choose your preferred authentication provider
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid gap-6">
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
                          className={`w-full justify-start p-6 h-auto min-h-24 transition-all hover:shadow-lg border-2 ${
                            isSelected 
                              ? 'border-primary shadow-lg bg-primary text-primary-foreground' 
                              : 'border-border/20 hover:border-primary/30 hover:bg-primary/5'
                          }`}
                          onClick={() => onProviderSelect(provider)}
                        >
                          <div className={`p-4 rounded-xl ${info.color} text-white mr-6 flex-shrink-0`}>
                            <Icon className="h-7 w-7" />
                          </div>
                          <div className="text-left flex-1 space-y-2">
                            <div className="font-bold text-lg">{info.name}</div>
                            <div className={`text-sm leading-relaxed ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                              {info.description}
                            </div>
                          </div>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-sm p-3">
                        <p className="text-sm">{info.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="text-center pt-8">
          <Button
            size="lg"
            disabled={!canContinue}
            onClick={() => canContinue && onLogin(selectedProvider)}
            className={`px-12 py-4 text-lg font-bold min-w-80 transition-all ${
              canContinue 
                ? 'bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl' 
                : 'opacity-50 cursor-not-allowed'
            }`}
          >
            Continue with {selectedProvider ? providerInfo[selectedProvider].name : "Provider"}
          </Button>
        </div>
      </div>
    </div>
  );
}