import { useState, useEffect } from "react";
import { useKV } from "@github/spark/hooks";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { LandingPage } from "@/components/pages/LandingPage";
import { LoginPage } from "@/components/pages/LoginPage";
import { TokenPage } from "@/components/pages/TokenPage";
import { TokenExpiryNotification } from "@/components/TokenExpiryNotification";
import { config } from "@/lib/config";
import { Provider } from "@/lib/config";
import { TokenStorage } from "@/lib/token-storage";
import { useTokenRefresh } from "@/hooks/useTokenRefresh";

type Page = "landing" | "login" | "token";

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("landing");
  const [selectedProvider, setSelectedProvider] = useState<Provider | undefined>();
  const [loginProvider, setLoginProvider] = useState<Provider | undefined>();

  // Initialize automatic token refresh system
  const tokenRefresh = useTokenRefresh({
    refreshBeforeExpiryMinutes: 5,
    checkIntervalMinutes: 1,
    showNotifications: true
  });

  // Handle URL navigation
  useEffect(() => {
    const updatePageFromURL = () => {
      const path = window.location.pathname;
      const searchParams = new URLSearchParams(window.location.search);
      
      // Handle both with and without /multi-provider-authe prefix
      if (path === "/multi-provider-authe/login" || path === "/login") {
        const provider = searchParams.get("provider") as Provider;
        if (provider && ["cilogon", "orcid", "fabric", "meican", "fabricConnection"].includes(provider)) {
          setLoginProvider(provider);
        }
        setCurrentPage("login");
        
        // If accessing without prefix, redirect to correct URL
        if (path === "/login") {
          const correctPath = `/multi-provider-authe/login${provider ? `?provider=${provider}` : ""}`;
          window.history.replaceState({}, "", correctPath);
        }
      } else if (path === "/multi-provider-authe/token" || path === "/token") {
        setCurrentPage("token");
        
        // If accessing without prefix, redirect to correct URL
        if (path === "/token") {
          window.history.replaceState({}, "", "/multi-provider-authe/token");
        }
      } else {
        setCurrentPage("landing");
        
        // Ensure we're on the correct landing URL
        if (path !== "/multi-provider-authe" && path !== "/") {
          window.history.replaceState({}, "", "/multi-provider-authe");
        }
      }
    };

    updatePageFromURL();
    window.addEventListener("popstate", updatePageFromURL);
    return () => window.removeEventListener("popstate", updatePageFromURL);
  }, []);

  const navigateTo = (page: Page, provider?: Provider) => {
    let path = "/multi-provider-authe";
    
    switch (page) {
      case "login":
        path = `/multi-provider-authe/login${provider ? `?provider=${provider}` : ""}`;
        if (provider) setLoginProvider(provider);
        break;
      case "token":
        path = "/multi-provider-authe/token";
        break;
      case "landing":
        path = "/multi-provider-authe";
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
      
      {/* Token expiry notifications - shown on all pages */}
      <TokenExpiryNotification 
        warningMinutes={15}
        className="fixed top-4 left-4 right-4 z-50 max-w-4xl mx-auto"
      />
      
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