import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Check } from "lucide-react";
import { Environment, Provider } from "@/lib/config";

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
    description: "Academic and research identity federation providing secure access to research resources across institutions.",
    color: "bg-blue-500",
    bgColor: "bg-blue-50 hover:bg-blue-100 border-blue-200",
    selectedBgColor: "bg-blue-100 border-blue-300"
  },
  orcid: {
    name: "ORCID",
    description: "ORCID strives to enable transparent and trustworthy connections between researchers, their contributions, and their affiliations by providing a unique, persistent identifier for individuals to use as they engage in research, scholarship, and innovation activities.\n\nWe do this by providing three interrelated services:\n\n• The ORCID iD: a unique, persistent identifier free of charge to researchers\n• An ORCID record connected to the ORCID iD\n• A set of Application Programming Interfaces (APIs), as well as the services and support of communities of practice that enable interoperability",
    color: "bg-green-500",
    bgColor: "bg-green-50 hover:bg-green-100 border-green-200",
    selectedBgColor: "bg-green-100 border-green-300"
  },
  fabric: {
    name: "FABRIC API",
    description: "FABRIC (FABRIC is Adaptive ProgrammaBle Research Infrastructure for Computer Science and Science Applications) is an International infrastructure that enables cutting-edge experimentation and research at-scale in the areas of networking, cybersecurity, distributed computing, storage, virtual reality, 5G, machine learning, and science applications.\n\nThe FABRIC infrastructure is a distributed set of equipment at commercial collocation spaces, national labs and campuses. Each of the 29 FABRIC sites has large amounts of compute and storage, interconnected by high speed, dedicated optical links. It also connects to specialized testbeds (5G/IoT PAWR, NSF Clouds), the Internet and high-performance computing facilities to create a rich environment for a wide variety of experimental activities.",
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-3 pt-8">
      <div className="w-1/2 mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground bg-gradient-to-r from-gray-800 via-gray-700 to-gray-900 bg-clip-text text-transparent leading-tight">
            SDX Multi Provider Authentication
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Select your environment and identity provider to continue
          </p>
        </div>

        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 items-start">
          {/* Environment Selection */}
          <Card className="flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200 shadow-lg">
            <CardHeader className="pb-3 pt-4 px-4 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-t-lg">
              <CardTitle className="text-lg">Environment</CardTitle>
              <CardDescription className="text-slate-200 mt-1">
                Choose your target environment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4 flex-1">
              <div className="space-y-3">
                <div 
                  className={`flex items-center space-x-4 p-6 rounded-xl transition-all duration-200 border-2 cursor-pointer ${
                    environment === "test" 
                      ? "bg-gradient-to-r from-blue-100 to-blue-50 border-blue-400 shadow-lg transform scale-[1.02]" 
                      : "bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-25 border-gray-200 hover:border-blue-300 hover:shadow-md"
                  }`}
                  onClick={() => onEnvironmentChange("test")}
                >
                  <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-green-500 bg-white">
                    {environment === "test" && <Check className="w-3 h-3 text-green-600" />}
                  </div>
                  <Label className="flex items-center gap-3 cursor-pointer flex-1">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-semibold text-slate-700">Test Environment</span>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-sm">Dev</Badge>
                      </div>
                      <div className="text-sm text-slate-600">Development and testing</div>
                    </div>
                  </Label>
                </div>
                <div 
                  className={`flex items-center space-x-4 p-6 rounded-xl transition-all duration-200 border-2 cursor-pointer ${
                    environment === "production" 
                      ? "bg-gradient-to-r from-red-100 to-red-50 border-red-400 shadow-lg transform scale-[1.02]" 
                      : "bg-white hover:bg-gradient-to-r hover:from-red-50 hover:to-red-25 border-gray-200 hover:border-red-300 hover:shadow-md"
                  }`}
                  onClick={() => onEnvironmentChange("production")}
                >
                  <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-green-500 bg-white">
                    {environment === "production" && <Check className="w-3 h-3 text-green-600" />}
                  </div>
                  <Label className="flex items-center gap-3 cursor-pointer flex-1">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-semibold text-slate-700">Production</span>
                        <Badge variant="destructive" className="text-sm">Live</Badge>
                      </div>
                      <div className="text-sm text-slate-600">Live production environment</div>
                    </div>
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Provider Selection */}
          <Card className="flex flex-col bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 shadow-lg">
            <CardHeader className="pb-3 pt-4 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-t-lg">
              <CardTitle className="text-lg">Identity Provider</CardTitle>
              <CardDescription className="text-indigo-200 mt-1">
                Choose your authentication provider
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 p-4 flex-1">
              {Object.entries(providerInfo).map(([key, info]) => {
                const provider = key as Provider;
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
                          <div className="text-left flex-1 space-y-2">
                            <div className="font-semibold text-base text-slate-700">{info.name}</div>
                            <div className="text-sm text-slate-600">
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
                      <TooltipContent 
                        side="right" 
                        align="start"
                        sideOffset={10}
                        className="max-w-xs p-3 bg-blue-50 text-blue-800 border border-blue-200 shadow-lg z-50"
                        avoidCollisions={true}
                        collisionPadding={10}
                      >
                        <div className="text-sm space-y-2">
                          {info.description.split('\n').map((line, index) => (
                            <p key={index} className={line.startsWith('•') ? 'ml-2' : ''}>{line}</p>
                          ))}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Continue Button */}
        <div className="flex justify-center pt-4">
          <Button
            size="lg"
            disabled={!canContinue}
            onClick={() => canContinue && onLogin(selectedProvider)}
            className={`w-full max-w-md px-6 py-4 text-base font-semibold rounded-xl transition-all duration-200 ${
              canContinue 
                ? "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]" 
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Continue with {selectedProvider ? providerInfo[selectedProvider].name : "Provider"}
          </Button>
        </div>
      </div>
    </div>
  );
}