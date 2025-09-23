import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { LandingPage } from "@/components/pages/LandingPage";
import { LoginPage } from "@/components/pages/LoginPage";
import { TokenPage } from "@/components/pages/TokenPage";
import { config } from "@/lib/config";
import { Provider } from "@/lib/config";
import { TokenStorage } from "@/lib/token-storage";
import { CILogonProvider } from "@/lib/providers/cilogon";

type Page = "landing" | "login" | "token";

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("landing");
  const [selectedProvider, setSelectedProvider] = useState<Provider | undefined>();
  const [loginProvider, setLoginProvider] = useState<Provider | undefined>();

  // Handle URL navigation and OAuth callback
  useEffect(() => {
    const updatePageFromURL = async () => {
      const path = window.location.pathname;
      const searchParams = new URLSearchParams(window.location.search);
      
      // Check for CILogon callback
      if (searchParams.get('callback') === 'cilogon') {
        try {
          const cilogonProvider = new CILogonProvider();
          const tokenData = await cilogonProvider.processCallback();
          
          if (tokenData) {
            // Clear the callback parameter from URL
            window.history.replaceState({}, '', window.location.pathname);
            toast.success('CILogon authentication successful!');
            setCurrentPage('token');
            return;
          }
        } catch (error) {
          console.error('CILogon callback error:', error);
          toast.error(`Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
          // Clear the callback parameter from URL
          window.history.replaceState({}, '', window.location.pathname);
        }
      }
      
      // Handle error parameter
      const errorParam = searchParams.get('error');
      if (errorParam) {
        toast.error(`Authentication error: ${errorParam}`);
        window.history.replaceState({}, '', window.location.pathname);
        return;
      }
      
      if (path === "/login") {
        const provider = searchParams.get("provider") as Provider;
        if (provider && ["cilogon", "orcid", "fabric"].includes(provider)) {
          setLoginProvider(provider);
        }
        setCurrentPage("login");
      } else if (path === "/token") {
        setCurrentPage("token");
      } else {
        setCurrentPage("landing");
      }
    };

    updatePageFromURL();
    window.addEventListener("popstate", updatePageFromURL);
    return () => window.removeEventListener("popstate", updatePageFromURL);
  }, []);

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