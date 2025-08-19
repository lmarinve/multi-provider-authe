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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-foreground bg-gradient-to-r from-gray-800 via-gray-700 to-gray-900 bg-clip-text text-transparent">
            SDX Multi Provider Authentication
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Select your environment and identity provider to continue
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Environment Selection */}
          <Card className="h-fit bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200 shadow-lg">
            <CardHeader className="pb-4 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Server className="h-6 w-6" />
                Environment
              </CardTitle>
              <CardDescription className="text-slate-200">
                Choose your target environment
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <RadioGroup 
                value={environment} 
                onValueChange={onEnvironmentChange}
                className="space-y-4"
              >
                <div className={`flex items-center space-x-3 p-4 rounded-xl transition-all duration-200 ${
                  environment === "test" 
                    ? "bg-gradient-to-r from-blue-100 to-blue-50 border-2 border-blue-400 shadow-md" 
                    : "bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-25 border border-gray-200 hover:border-blue-300 hover:shadow-sm"
                }`}>
                  <RadioGroupItem value="test" id="test" />
                  <Label htmlFor="test" className="flex items-center gap-3 cursor-pointer flex-1">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                      <TestTube className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <span className="text-base font-semibold text-gray-900">Test Environment</span>
                      <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800">Dev</Badge>
                    </div>
                  </Label>
                </div>
                <div className={`flex items-center space-x-3 p-4 rounded-xl transition-all duration-200 ${
                  environment === "production" 
                    ? "bg-gradient-to-r from-red-100 to-red-50 border-2 border-red-400 shadow-md" 
                    : "bg-white hover:bg-gradient-to-r hover:from-red-50 hover:to-red-25 border border-gray-200 hover:border-red-300 hover:shadow-sm"
                }`}>
                  <RadioGroupItem value="production" id="production" />
                  <Label htmlFor="production" className="flex items-center gap-3 cursor-pointer flex-1">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-red-600 text-white">
                      <Server className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <span className="text-base font-semibold text-gray-900">Production Environment</span>
                      <Badge variant="destructive" className="ml-2">Live</Badge>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Provider Selection */}
          <Card className="h-fit bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 shadow-lg">
            <CardHeader className="pb-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-t-lg">
              <CardTitle className="text-xl">Identity Provider</CardTitle>
              <CardDescription className="text-indigo-200">
                Choose your authentication provider
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
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
                          className={`w-full justify-start p-4 h-auto transition-all duration-200 border-2 rounded-xl ${
                            isSelected 
                              ? `${info.selectedBgColor} shadow-lg border-opacity-100 transform scale-[1.02]` 
                              : `bg-white ${info.bgColor.replace('bg-', 'hover:bg-')} hover:shadow-md border-gray-200 hover:border-opacity-100`
                          }`}
                          onClick={() => onProviderSelect(provider)}
                        >
                          <div className={`p-3 rounded-xl ${info.color.replace('bg-', 'bg-gradient-to-br from-').replace('-500', '-500 to-').concat('-600')} text-white mr-4 shadow-sm`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <div className="text-left flex-1">
                            <div className="font-semibold text-base text-gray-900">{info.name}</div>
                            <div className="text-sm text-gray-600">
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
        <div className="flex justify-center pt-8">
          <Button
            size="lg"
            disabled={!canContinue}
            onClick={() => canContinue && onLogin(selectedProvider)}
            className={`w-full max-w-md px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-200 ${
              canContinue 
                ? "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]" 
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            <div className="flex items-center gap-2">
              {selectedProvider && (
                <div className="p-1 rounded-md bg-white/20">
                  {(() => {
                    const Icon = providerInfo[selectedProvider].icon;
                    return <Icon className="h-5 w-5" />;
                  })()}
                </div>
              )}
              Continue with {selectedProvider ? providerInfo[selectedProvider].name : "Provider"}
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}