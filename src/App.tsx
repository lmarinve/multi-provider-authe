import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { LandingPage } from "@/components/pages/LandingPage";
import { LoginPage } from "@/components/pages/LoginPage";
import { TokenPage } from "@/components/pages/TokenPage";
import { Provider } from "@/lib/types";

type Page = "landing" | "login" | "token";

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("landing");
  const [selectedProvider, setSelectedProvider] = useState<Provider | undefined>();

  const navigateTo = (page: Page, provider?: Provider) => {
    setCurrentPage(page);
    if (provider) {
      setSelectedProvider(provider);
    }
  };

  const handleLogin = (provider: Provider) => {
    setSelectedProvider(provider);
    navigateTo("login", provider);
  };

  const handleLoginComplete = () => {
    navigateTo("token");
  };

  const handleBackToLanding = () => {
    setSelectedProvider(undefined);
    navigateTo("landing");
  };

  return (
    <div className="min-h-screen bg-white">
      <Toaster />
      
      {currentPage === "landing" && (
        <LandingPage
          selectedProvider={selectedProvider}
          onProviderSelect={setSelectedProvider}
          onLogin={handleLogin}
        />
      )}
      
      {currentPage === "login" && selectedProvider && (
        <LoginPage
          provider={selectedProvider}
          onComplete={handleLoginComplete}
          onBack={handleBackToLanding}
        />
      )}
      
      {currentPage === "token" && (
        <TokenPage
          onBack={handleBackToLanding}
        />
      )}
    </div>
  );
}

export default App;