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
    color: "bg-blue-500",
    bgColor: "bg-blue-50 hover:bg-blue-100 border-blue-200",
    selectedBgColor: "bg-blue-100 border-blue-300"
  },
  orcid: {
    name: "ORCID",
    color: "bg-green-500",
    bgColor: "bg-green-50 hover:bg-green-100 border-green-200",
    selectedBgColor: "bg-green-100 border-green-300"
  },
  fabric: {
    name: "FABRIC API",
    color: "bg-purple-500",
    bgColor: "bg-purple-50 hover:bg-purple-100 border-purple-200",
    selectedBgColor: "bg-purple-100 border-purple-300"
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
          <div className="space-y-2">
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-foreground bg-gradient-to-r from-blue-600 via-blue-700 to-blue-900 bg-clip-text text-transparent leading-tight">
              AtlanticWave SDX
            </h1>
            <h2 className="text-lg lg:text-xl font-medium text-blue-600 uppercase tracking-wide">
              International Distributed Software-Defined Exchange
            </h2>
          </div>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed pt-4">
            Select an Identity Provider and continue
          </p>
        </div>

        {/* Provider Selection */}
        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 shadow-lg">
          <CardHeader className="pb-3 pt-4 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-t-lg">
            <CardTitle className="text-lg">Identity Provider</CardTitle>
            <CardDescription className="text-indigo-200 mt-1">
              Choose your authentication provider
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 p-4">
            {Object.entries(providerInfo).map(([key, info]) => {
              const provider = key as Provider;
              const isSelected = selectedProvider === provider;
              
              return (
                <Button
                  key={provider}
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
              );
            })}
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