import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Provider } from "@/lib/config";
import { useKV } from "@github/spark/hooks";
import { toast } from "sonner";
import sdxLogo from "@/assets/images/sdx-logo.svg"; 

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
  }
} as const;

export function LandingPage({
  selectedProvider,
  onProviderSelect,
  onLogin
}: LandingPageProps) {
  const [email, setEmail] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useKV("auth.email-verified", false);
  const [verifiedEmail, setVerifiedEmail] = useKV("auth.verified-email", "");
  const [isLoading, setIsLoading] = useState(false);
  const [waitingForVerification, setWaitingForVerification] = useState(false);

  const canContinue = selectedProvider && isEmailVerified;

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendVerificationEmail = async () => {
    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      // Simulate sending verification email
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real implementation, you would send the email here
      // For demo purposes, we'll simulate the process
      setVerifiedEmail(email);
      setWaitingForVerification(true);
      
      toast.success(`Verification email sent to ${email}`, {
        description: "Please check your email and click the verification link to continue."
      });
    } catch (error) {
      toast.error("Failed to send verification email", {
        description: "Please try again or contact support."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailVerification = () => {
    // In a real implementation, this would be called when the user clicks the verification link
    setIsEmailVerified(true);
    setWaitingForVerification(false);
    toast.success("Email verified successfully! You can now select an identity provider.");
  };

  const handleClearEmail = () => {
    setIsEmailVerified(false);
    setVerifiedEmail("");
    setEmail("");
    setWaitingForVerification(false);
  };

  return (
    <div className="min-h-screen bg-white p-3 pt-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex flex-col items-center space-y-6">
            {/* Title and Logo in same line */}
            <div className="flex items-center justify-center gap-4">
              {/* SDX Logo */}
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <img src={sdxLogo} alt="SDX Logo" className="h-12 w-auto object-contain" />
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

        {/* Email Pre-Authentication */}
        {!isEmailVerified && (
          <Card className="bg-[rgb(236,244,250)] border-[rgb(120,176,219)] shadow-lg">
            <CardHeader className="pb-3 pt-4 px-4 bg-[rgb(50,135,200)] text-white rounded-t-lg text-center">
              <CardTitle className="text-lg font-semibold">Pre-Authentication Required</CardTitle>
              <CardDescription className="text-[rgb(236,244,250)] mt-1">
                Enter your email address to receive a verification link
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              {!waitingForVerification ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[rgb(64,143,204)] font-medium">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white border-[rgb(120,176,219)] focus:border-[rgb(50,135,200)] focus:ring-[rgb(50,135,200)]"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && isValidEmail(email)) {
                          handleSendVerificationEmail();
                        }
                      }}
                    />
                  </div>
                  
                  <Button
                    onClick={handleSendVerificationEmail}
                    disabled={!isValidEmail(email) || isLoading}
                    className={`w-full py-3 text-base font-semibold rounded-xl transition-all duration-200 ${
                      isValidEmail(email) && !isLoading
                        ? "bg-[rgb(50,135,200)] hover:bg-[rgb(64,143,204)] text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]" 
                        : "bg-[rgb(120,176,219)] text-white opacity-50 cursor-not-allowed"
                    }`}
                  >
                    {isLoading ? "Sending..." : "Send Verification Email"}
                  </Button>
                </>
              ) : (
                <div className="text-center space-y-4">
                  <div className="text-[rgb(64,143,204)] font-medium">
                    Verification email sent to:
                  </div>
                  <div className="font-semibold text-[rgb(50,135,200)] text-lg">
                    {verifiedEmail}
                  </div>
                  <div className="text-sm text-[rgb(64,143,204)] opacity-80">
                    Please check your email and click the verification link to continue.
                  </div>
                  
                  {/* Demo button - in production this would happen automatically */}
                  <div className="pt-4 border-t border-[rgb(120,176,219)] space-y-2">
                    <div className="text-xs text-[rgb(64,143,204)] opacity-60">
                      Demo Mode: Click below to simulate email verification
                    </div>
                    <Button
                      onClick={handleEmailVerification}
                      variant="outline"
                      className="w-full border-[rgb(120,176,219)] text-[rgb(64,143,204)] hover:bg-[rgb(236,244,250)]"
                    >
                      Simulate Email Verification
                    </Button>
                  </div>
                  
                  <Button
                    onClick={handleClearEmail}
                    variant="ghost"
                    className="w-full text-[rgb(64,143,204)] hover:bg-[rgb(236,244,250)]"
                  >
                    Use Different Email
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Email Verification Status */}
        {isEmailVerified && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                </div>
                <div>
                  <div className="font-medium text-green-800">Email Verified</div>
                  <div className="text-sm text-green-600">{verifiedEmail}</div>
                </div>
              </div>
              <Button
                onClick={handleClearEmail}
                variant="ghost"
                size="sm"
                className="text-green-700 hover:bg-green-100"
              >
                Change Email
              </Button>
            </div>
          </div>
        )}

        {/* Provider Selection - only shown after email verification */}
        {isEmailVerified && (
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
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-base text-[rgb(64,143,204)]">{info.name}</div>
                          <div className="text-sm text-[rgb(50,135,200)]">
                            {info.name === "ORCID" 
                              ? "Researcher identifiers" 
                              : info.name === "CILogon"
                              ? "Academic federation"
                              : "Identity provider"
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
        )}

        {/* Continue Button - only shown after email verification and provider selection */}
        {isEmailVerified && (
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
        )}
      </div>
    </div>
  );
}