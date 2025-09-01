import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";

type Page = "landing" | "login" | "token";
type Provider = "cilogon" | "orcid" | "fabric";

function SimpleApp() {
  const [currentPage, setCurrentPage] = useState<Page>("landing");

  return (
    <div className="min-h-screen bg-white">
      <Toaster />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-4">
            AtlanticWave-SDX
          </h1>
          <h2 className="text-lg text-blue-500 mb-8">
            International Distributed Software-Defined Exchange
          </h2>
          
          <p className="text-gray-600">
            Current page: {currentPage}
          </p>
          
          <div className="mt-8 space-x-4">
            <button 
              onClick={() => setCurrentPage("landing")}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Landing
            </button>
            <button 
              onClick={() => setCurrentPage("login")}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Login
            </button>
            <button 
              onClick={() => setCurrentPage("token")}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Token
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SimpleApp;