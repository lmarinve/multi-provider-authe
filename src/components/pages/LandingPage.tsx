import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Provider } from "@/lib/config";

// Direct SVG import approach
const sdxLogoUrl = "/src/assets/images/sdx-logo.svg";

// Inline SVG component as fallback
const SDXLogoInline = () => (
  <svg version="1.1" viewBox="0 0 91 115" className="h-12 w-auto object-contain">
    <path fill="#FCFEFE" opacity="1.000000" stroke="none" 
      d="M49.000000,116.000000 C32.666668,116.000000 16.833334,116.000000 1.000000,116.000000 C1.000000,77.666664 1.000000,39.333332 1.000000,1.000000 C31.333334,1.000000 61.666668,1.000000 92.000000,1.000000 C92.000000,39.333332 92.000000,77.666664 92.000000,116.000000 C77.833336,116.000000 63.666668,116.000000 49.000000,116.000000 M51.136497,42.281837 C56.088856,42.281837 61.041214,42.281837 65.993568,42.281837 C65.990044,41.578705 65.986511,40.875576 65.982979,40.172443 C55.060036,35.875969 43.925758,34.494682 32.551571,38.999531 C21.093418,43.537640 10.541619,57.522717 8.861089,71.222038 C18.704062,54.543232 32.291718,45.188118 51.136497,42.281837 M81.376259,40.202236 C77.152199,30.431566 69.863525,23.745398 60.654835,18.931557 C77.921295,37.381596 79.505501,58.735973 72.836395,81.897789 C82.286583,69.433983 87.467316,56.310253 81.376259,40.202236 M61.500233,89.242569 C47.325836,85.746628 37.285728,76.129036 27.469872,65.510078 C27.072655,73.213364 36.342514,86.171936 45.480999,91.465164 C55.459774,97.245110 72.314667,97.664368 79.949310,92.734367 C74.396103,91.706863 68.337044,90.585762 61.500233,89.242569 z"/>
    <path fill="#11AFEE" opacity="1.000000" stroke="none" 
      d="M50.702984,42.366280 C32.291718,45.188118 18.704062,54.543232 8.861089,71.222038 C10.541619,57.522717 21.093418,43.537640 32.551571,38.999531 C43.925758,34.494682 55.060036,35.875969 65.982979,40.172443 C65.986511,40.875576 65.990044,41.578705 65.993568,42.281837 C61.041214,42.281837 56.088856,42.281837 50.702984,42.366280 z"/>
    <path fill="#14B1EF" opacity="1.000000" stroke="none" 
      d="M81.560493,40.544930 C87.467316,56.310253 82.286583,69.433983 72.836395,81.897789 C79.505501,58.735973 77.921295,37.381596 60.654835,18.931557 C69.863525,23.745398 77.152199,30.431566 81.560493,40.544930 z"/>
    <path fill="#0F559D" opacity="1.000000" stroke="none" 
      d="M61.889111,89.353622 C68.337044,90.585762 74.396103,91.706863 79.949310,92.734367 C72.314667,97.664368 55.459774,97.245110 45.480999,91.465164 C36.342514,86.171936 27.072655,73.213364 27.469872,65.510078 C37.285728,76.129036 47.325836,85.746628 61.889111,89.353622 z"/>
  </svg>
); 

interface LandingPageProps {
  selectedProvider?: Provider;
  onProviderSelect: (provider: Provider) => void;
  onLogin: (provider: Provider) => void;
}

const providerInfo = {
  cilogon: {
    name: "CILogon",
    color: "bg-[rgb(50,135,200)]",
    bgColor: "bg-[rgb(236,244,250)] hover:bg-[rgb(236,244,250)] border-[rgb(120,176,219)]",
    selectedBgColor: "bg-[rgb(236,244,250)] border-[rgb(64,143,204)]"
  },
  orcid: {
    name: "ORCID",
    color: "bg-[rgb(50,135,200)]",
    bgColor: "bg-[rgb(236,244,250)] hover:bg-[rgb(236,244,250)] border-[rgb(120,176,219)]",
    selectedBgColor: "bg-[rgb(236,244,250)] border-[rgb(64,143,204)]"
  },
  fabric: {
    name: "FABRIC API",
    color: "bg-[rgb(50,135,200)]",
    bgColor: "bg-[rgb(236,244,250)] hover:bg-[rgb(236,244,250)] border-[rgb(120,176,219)]",
    selectedBgColor: "bg-[rgb(236,244,250)] border-[rgb(64,143,204)]"
  }
} as const;

export function LandingPage({
  selectedProvider,
  onProviderSelect,
  onLogin
}: LandingPageProps) {
  const canContinue = selectedProvider;

  return (
    <div className="min-h-screen bg-white p-3 pt-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex flex-col items-center space-y-6">
            {/* Title and Logo in same line */}
            <div className="flex items-center justify-center gap-6">
              {/* SDX Logo */}
              <div className="w-16 h-16 bg-white border border-[rgb(120,176,219)] rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <SDXLogoInline />
              </div>
              {/* Title with custom colors and slightly increased size */}
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight leading-tight flex items-center gap-3">
                <span 
                  className="px-2 py-1 rounded-md"
                  style={{ 
                    color: 'rgb(50, 135, 200)', 
                    backgroundColor: 'rgb(255, 255, 255)' 
                  }}
                >
                  AtlanticWave
                </span>
                <span 
                  className="px-2 py-1 rounded-md"
                  style={{ 
                    color: 'rgb(255, 255, 255)', 
                    backgroundColor: 'rgb(255, 255, 255)' 
                  }}
                >
                  -
                </span>
                <span 
                  className="px-3 py-1 rounded-md font-bold"
                  style={{ 
                    color: 'rgb(255, 255, 255)', 
                    backgroundColor: 'rgb(120, 176, 219)' 
                  }}
                >
                  SDX
                </span>
              </h1>
            </div>
            
            {/* Subtitle with maximum size reduction and Deep Blue color */}
            <h2 
              className="text-[0.5rem] font-light uppercase tracking-wide opacity-70"
              style={{ color: 'rgb(64, 143, 204)' }}
            >
              International Distributed Software-Defined Exchange
            </h2>
          </div>
        </div>

        {/* Provider Selection */}
        <Card className="bg-[rgb(236,244,250)] border-[rgb(120,176,219)] shadow-lg">
          <CardHeader className="pb-3 pt-4 px-4 bg-[rgb(50,135,200)] text-white rounded-t-lg text-center">
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
                        : `bg-[rgb(255,255,255)] hover:bg-[rgb(236,244,250)] hover:shadow-md border-[rgb(120,176,219)] hover:border-opacity-100`
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
                ? "bg-[rgb(50,135,200)] hover:bg-[rgb(64,143,204)] text-[rgb(255,255,255)] shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]" 
                : "bg-[rgb(120,176,219)] text-[rgb(255,255,255)] opacity-50 cursor-not-allowed"
            }`}
          >
            Continue with {selectedProvider ? providerInfo[selectedProvider].name : "Provider"}
          </Button>
        </div>
      </div>
    </div>
  );
}