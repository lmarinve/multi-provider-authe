import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TokenPageProps {
  onBack: () => void;
}

export function TokenPage({ onBack }: TokenPageProps) {
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-4 mb-8">
          <div className="flex flex-col items-center space-y-6">
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
            
            {/* Subtitle with maximum size reduction and Deep Blue color */}
            <h2 
              className="text-[0.5rem] font-light uppercase tracking-wide opacity-70"
              style={{ color: 'rgb(64, 143, 204)' }}
            >
              International Distributed Software-Defined Exchange
            </h2>
          </div>
        </div>

        {/* Token Information Card */}
        <Card className="bg-[rgb(236,244,250)] border-[rgb(120,176,219)] shadow-lg">
          <CardHeader className="pb-3 pt-4 px-4 bg-[rgb(50,135,200)] text-white rounded-t-lg text-center">
            <CardTitle className="text-lg">Token Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <div className="text-center text-[rgb(64,143,204)]">
              <p className="mb-6">Manage your authentication tokens and external connections.</p>
              
              <div className="space-y-3">
                <Button
                  onClick={() => window.open("http://190.103.184.199", "_blank", "noopener,noreferrer")}
                  className="w-full max-w-xs"
                  style={{
                    backgroundColor: 'rgb(50, 135, 200)',
                    color: 'rgb(255, 255, 255)'
                  }}
                >
                  Connect using Meican
                </Button>
                
                <Button
                  onClick={() => console.log("Connect using Fabric - functionality to be implemented")}
                  className="w-full max-w-xs"
                  style={{
                    backgroundColor: 'rgb(120, 176, 219)',
                    color: 'rgb(255, 255, 255)'
                  }}
                >
                  Connect using Fabric
                </Button>
                
                <Button
                  onClick={onBack}
                  variant="outline"
                  className="w-full max-w-xs"
                  style={{
                    borderColor: 'rgb(120, 176, 219)',
                    color: 'rgb(64, 143, 204)'
                  }}
                >
                  Back to Authentication
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}