import { useState, useEffect } from "react";
import { useKV } from "@github/spark/hooks";
import { Toaster } from "@/components/ui/sonner";
import { LandingPage } from "@/components/pages/LandingPage";
import { LoginPage } from "@/components/pages/LoginPage";
import { TokenPage } from "@/components/pages/TokenPage";
import { config } from "@/lib/config";
import { Provider, Environment } from "@/lib/config";

type Page = "landing" | "login" | "token";

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("landing");
  const [environment, setEnvironment] = useKV<Environment>("auth.environment", config.defaultEnv);
  const [selectedProvider, setSelectedProvider] = useState<Provider | undefined>();
  const [loginProvider, setLoginProvider] = useState<Provider | undefined>();

  // Handle URL navigation
  useEffect(() => {
    const updatePageFromURL = () => {
      const path = window.location.pathname;
      const searchParams = new URLSearchParams(window.location.search);
      
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
    let path = "/";
    
    switch (page) {
      case "login":
        path = `/login${provider ? `?provider=${provider}` : ""}`;
        if (provider) setLoginProvider(provider);
        break;
      case "token":
        path = "/token";
        break;
    }
    
    window.history.pushState({}, "", path);
    setCurrentPage(page);
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
    setLoginProvider(undefined);
    navigateTo("landing");
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'rgb(255, 255, 255)' }}>
      <Toaster />
      
      {currentPage === "landing" && (
        <LandingPage
          selectedProvider={selectedProvider}
          onProviderSelect={setSelectedProvider}
          onLogin={handleLogin}
        />
      )}
      
      {currentPage === "login" && loginProvider && (
        <LoginPage
          provider={loginProvider}
          environment={environment}
          onComplete={handleLoginComplete}
          onBack={handleBackToLanding}
        />
      )}
      
      {currentPage === "token" && (
        <TokenPage
          environment={environment}
          onEnvironmentChange={setEnvironment}
          onBack={handleBackToLanding}
        />
      )}
    </div>
  );
}

export default App;