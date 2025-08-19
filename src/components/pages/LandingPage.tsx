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
    color: "bg-blue-500",
    bgColor: "bg-blue-50 hover:bg-blue-100 border-blue-200",
    selectedBgColor: "bg-blue-100 border-blue-300"
  },
  orcid: {
    name: "ORCID",
    description: "ORCID strives to enable transparent and trustworthy connections between researchers, their contributions, and their affiliations by providing a unique, persistent identifier for individuals to use as they engage in research, scholarship, and innovation activities.",
    icon: Fingerprint,
    color: "bg-green-500",
    bgColor: "bg-green-50 hover:bg-green-100 border-green-200",
    selectedBgColor: "bg-green-100 border-green-300"
  },
  fabric: {
    name: "FABRIC API",
    description: "FABRIC (FABRIC is Adaptive ProgrammaBle Research Infrastructure for Computer Science and Science Applications) is an International infrastructure that enables cutting-edge experimentation and research at-scale in the areas of networking, cybersecurity, distributed computing, storage, virtual reality, 5G, machine learning, and science applications.",
    icon: Shield,
    color: "bg-purple-500",
    bgColor: "bg-purple-50 hover:bg-purple-100 border-purple-200",
    selectedBgColor: "bg-purple-100 border-purple-300"
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
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-2xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold tracking-tight text-foreground">
            SDX Multi Provider Authentication
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Select your environment and identity provider to continue
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Environment Selection */}
          <Card className="h-fit">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Server className="h-6 w-6" />
                Environment
              </CardTitle>
              <CardDescription className="text-base">
                Choose your target environment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                value={environment} 
                onValueChange={onEnvironmentChange}
                className="space-y-4"
              >
                <div className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  environment === "test" 
                    ? "bg-blue-50 border border-blue-300" 
                    : "bg-gray-50 hover:bg-blue-50 border border-transparent hover:border-blue-200"
                }`}>
                  <RadioGroupItem value="test" id="test" />
                  <Label htmlFor="test" className="flex items-center gap-3 cursor-pointer flex-1">
                    <TestTube className="h-5 w-5 text-accent" />
                    <span className="text-base font-medium">Test Environment</span>
                    <Badge variant="secondary">Dev</Badge>
                  </Label>
                </div>
                <div className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  environment === "production" 
                    ? "bg-red-50 border border-red-300" 
                    : "bg-gray-50 hover:bg-red-50 border border-transparent hover:border-red-200"
                }`}>
                  <RadioGroupItem value="production" id="production" />
                  <Label htmlFor="production" className="flex items-center gap-3 cursor-pointer flex-1">
                    <Server className="h-5 w-5 text-destructive" />
                    <span className="text-base font-medium">Production Environment</span>
                    <Badge variant="destructive">Live</Badge>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Provider Selection */}
          <Card className="h-fit">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Identity Provider</CardTitle>
              <CardDescription className="text-base">
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
                          variant="ghost"
                          className={`w-full justify-start p-4 h-auto transition-all border ${
                            isSelected 
                              ? `${info.selectedBgColor} shadow-md` 
                              : `${info.bgColor} hover:shadow-sm`
                          }`}
                          onClick={() => onProviderSelect(provider)}
                        >
                          <div className={`p-2 rounded-lg ${info.color} text-white mr-4`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <div className="text-left">
                            <div className="font-semibold text-base text-foreground">{info.name}</div>
                            <div className="text-sm text-muted-foreground">
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
        </div>

        {/* Continue Button */}
        <div className="flex justify-center pt-6">
          <Button
            size="lg"
            disabled={!canContinue}
            onClick={() => canContinue && onLogin(selectedProvider)}
            className="w-full max-w-md px-8 py-3 text-lg"
          >
            Continue with {selectedProvider ? providerInfo[selectedProvider].name : "Provider"}
          </Button>
        </div>
      </div>
    </div>
  );
}