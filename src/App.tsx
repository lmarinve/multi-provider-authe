import { useState, useEffect } from "react";
import { useKV } from "@github/spark/hooks";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { LandingPage } from "@/components/pages/LandingPage";
import { LoginPage } from "@/components/pages/LoginPage";
import { TokenPage } from "@/components/pages/TokenPage";
import { config } from "@/lib/config";
import { Provider } from "@/lib/config";
import { TokenStorage } from "@/lib/token-storage";

type Page = "landing" | "login" | "token";

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("landing");
  const [selectedProvider, setSelectedProvider] = useState<Provider | undefined>();
  const [loginProvider, setLoginProvider] = useState<Provider | undefined>();

  // Handle URL navigation
  useEffect(() => {
    const updatePageFromURL = () => {
      const path = window.location.pathname;
      const searchParams = new URLSearchParams(window.location.search);
      
      // Check for OAuth callback parameters
      const authCode = searchParams.get("code");
      const authState = searchParams.get("state");
      const authError = searchParams.get("error");
      
      if (authCode || authError) {
        // This is an OAuth callback - handle it
        console.log("OAuth callback detected", { code: authCode, error: authError });
        
        if (authError) {
          console.error("OAuth error:", authError);
          toast.error(`Authentication failed: ${authError}`);
          // Stay on landing page and show error
          setCurrentPage("landing");
          return;
        }
        
        if (authCode) {
          // Successful OAuth callback - validate state and create token
          console.log("OAuth successful, validating state and creating token");
          
          // Check which provider this callback is for based on stored state
          const cilogonState = sessionStorage.getItem('cilogon_oauth_state');
          const orcidState = sessionStorage.getItem('orcid_oauth_state');
          
          let provider: Provider = "cilogon"; // default
          let isValidState = false;
          
          if (cilogonState && authState === cilogonState) {
            provider = "cilogon";
            isValidState = true;
            sessionStorage.removeItem('cilogon_oauth_state');
          } else if (orcidState && authState === orcidState) {
            provider = "orcid";
            isValidState = true;
            sessionStorage.removeItem('orcid_oauth_state');
          }
          
          if (!isValidState) {
            console.error("Invalid OAuth state parameter");
            toast.error("Authentication failed: Invalid state parameter");
            setCurrentPage("landing");
            return;
          }
          
          // Create token with the authorization code
          const mockToken = {
            id_token: `${provider}_token_${authCode.substring(0, 10)}_${Date.now()}`,
            refresh_token: null,
            expires_in: 3600,
            issued_at: Math.floor(Date.now() / 1000),
            provider: provider
          };
          
          // Store the token
          TokenStorage.setToken(provider, mockToken);
          
          toast.success(`${provider.toUpperCase()} authentication successful! Token created.`);
          
          // Clean up URL by removing query parameters
          window.history.replaceState({}, "", window.location.pathname);
          
          setCurrentPage("token");
          return;
        }
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