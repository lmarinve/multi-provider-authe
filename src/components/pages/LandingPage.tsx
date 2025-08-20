import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Provider } from "@/lib/config";

interface LandingPageProps {
  selectedProvider?: Provider;
  onProviderSelect: (provider: Provider) => void;
  onLogin: (provider: Provider) => void;
}

const providerInfo = {
  cilogon: {
    name: "CILogon",
    color: "bg-[rgb(50,135,200)]",
    bgColor: "bg-[rgb(236,244,250)] hover:bg-[rgb(220,238,248)] border-[rgb(120,176,219)]",
    selectedBgColor: "bg-[rgb(220,238,248)] border-[rgb(64,143,204)]"
  },
  orcid: {
    name: "ORCID",
    color: "bg-[rgb(50,135,200)]",
    bgColor: "bg-[rgb(236,244,250)] hover:bg-[rgb(220,238,248)] border-[rgb(120,176,219)]",
    selectedBgColor: "bg-[rgb(220,238,248)] border-[rgb(64,143,204)]"
  },
  fabric: {
    name: "FABRIC API",
    color: "bg-[rgb(50,135,200)]",
    bgColor: "bg-[rgb(236,244,250)] hover:bg-[rgb(220,238,248)] border-[rgb(120,176,219)]",
    selectedBgColor: "bg-[rgb(220,238,248)] border-[rgb(64,143,204)]"
  }
} as const;

export function LandingPage({
  selectedProvider,
  onProviderSelect,
  onLogin
}: LandingPageProps) {
  const canContinue = selectedProvider;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-3 pt-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex flex-col items-center space-y-6">
            {/* Logo placeholder - replace with your logo */}
            <div className="w-32 h-32 bg-gradient-to-br from-[rgb(50,135,200)] to-[rgb(64,143,204)] rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">YOUR LOGO</span>
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-foreground bg-gradient-to-r from-blue-600 via-blue-700 to-blue-900 bg-clip-text text-transparent leading-tight">
                AtlanticWave SDX
              </h1>
              <h2 className="text-sm lg:text-base font-medium text-blue-600 uppercase tracking-wide">
                International Distributed Software-Defined Exchange
              </h2>
            </div>
          </div>
        </div>

        {/* Provider Selection */}
        <Card className="bg-gradient-to-br from-[rgb(236,244,250)] to-[rgb(220,238,248)] border-[rgb(120,176,219)] shadow-lg">
          <CardHeader className="pb-3 pt-4 px-4 bg-gradient-to-r from-[rgb(50,135,200)] to-[rgb(64,143,204)] text-white rounded-t-lg text-center">
            <CardDescription className="text-[rgb(236,244,250)] mt-1">
              Select an Identity Provider
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 p-4 flex flex-col items-center justify-center">
            <div className="w-full max-w-md space-y-3 mx-auto">
              {Object.entries(providerInfo).map(([key, info]) => {
                const provider = key as Provider;
                const isSelected = selectedProvider === provider;
                
                return (
                  <Button
                    key={provider}
                    variant="ghost"
                    className={`w-full justify-center p-4 h-auto transition-all duration-200 border-2 rounded-xl ${
                      isSelected 
                        ? `${info.selectedBgColor} shadow-lg border-opacity-100 transform scale-[1.02]` 
                        : `bg-white ${info.bgColor.replace('bg-', 'hover:bg-')} hover:shadow-md border-[rgb(120,176,219)] hover:border-opacity-100`
                    }`}
                    onClick={() => onProviderSelect(provider)}
                  >
                    <div className="text-center flex-1 space-y-2">
                      <div className="font-semibold text-base text-[rgb(64,143,204)]">{info.name}</div>
                      <div className="text-sm text-[rgb(50,135,200)]">
                        {info.name === "ORCID" 
                          ? "Researcher identifiers" 
                          : info.name === "FABRIC API" 
                          ? "Research infrastructure" 
                          : "Academic federation"
                        }
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Continue Button */}
        <div className="flex justify-center pt-4">
          <Button
            size="lg"
            disabled={!canContinue}
            onClick={() => canContinue && onLogin(selectedProvider)}
            className={`w-full max-w-md px-6 py-4 text-base font-semibold rounded-xl transition-all duration-200 ${
              canContinue 
                ? "bg-gradient-to-r from-[rgb(50,135,200)] to-[rgb(64,143,204)] hover:from-[rgb(64,143,204)] hover:to-[rgb(50,135,200)] text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]" 
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