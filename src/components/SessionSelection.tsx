import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { TokenData } from "@/lib/types";

interface SessionSelectionProps {
  token: TokenData;
  onBack: () => void;
}

interface Topology {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive";
}

interface Port {
  id: string;
  name: string;
  node: string;
  status: "available" | "in-use" | "maintenance";
  bandwidth: string;
  location: string;
}

interface L2VPN {
  id: string;
  name: string;
  endpoints: string[];
  status: "active" | "inactive" | "configuring";
  bandwidth: string;
  vlan_id?: number;
}

export function SessionSelection({ token, onBack }: SessionSelectionProps) {
  const [selectedSession, setSelectedSession] = useState<string>("");
  const [selectedTopology, setSelectedTopology] = useState<string>("");
  const [selectedPorts, setSelectedPorts] = useState<string[]>([]);
  const [selectedL2VPNs, setSelectedL2VPNs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);

  // Mock data - in real app this would come from API
  const [sessions] = useState([
    { id: "session-1", name: "Research Project Alpha", status: "active", created: new Date("2024-01-15") },
    { id: "session-2", name: "Network Testing Beta", status: "active", created: new Date("2024-01-20") },
    { id: "session-3", name: "ML Pipeline Gamma", status: "inactive", created: new Date("2024-01-10") }
  ]);

  const [topologies] = useState<Topology[]>([
    { id: "topo-1", name: "East Coast Ring", description: "High-speed ring connecting east coast nodes", status: "active" },
    { id: "topo-2", name: "Multi-Cloud Mesh", description: "Mesh topology spanning AWS, Azure, and GCP", status: "active" },
    { id: "topo-3", name: "Campus Network", description: "University campus network topology", status: "inactive" }
  ]);

  const [ports] = useState<Port[]>([
    { id: "port-1", name: "NYC-01", node: "New York", status: "available", bandwidth: "100G", location: "NYC Data Center" },
    { id: "port-2", name: "ATL-01", node: "Atlanta", status: "available", bandwidth: "40G", location: "ATL Network Hub" },
    { id: "port-3", name: "MIA-01", node: "Miami", status: "in-use", bandwidth: "100G", location: "MIA Exchange" },
    { id: "port-4", name: "CHI-01", node: "Chicago", status: "available", bandwidth: "100G", location: "CHI Core" },
    { id: "port-5", name: "DAL-01", node: "Dallas", status: "maintenance", bandwidth: "40G", location: "DAL Hub" }
  ]);

  const [l2vpns] = useState<L2VPN[]>([
    { id: "vpn-1", name: "Research VPN Alpha", endpoints: ["NYC-01", "ATL-01"], status: "active", bandwidth: "10G", vlan_id: 100 },
    { id: "vpn-2", name: "Production Link Beta", endpoints: ["CHI-01", "DAL-01"], status: "active", bandwidth: "40G", vlan_id: 200 },
    { id: "vpn-3", name: "Test Connection", endpoints: ["MIA-01", "NYC-01"], status: "configuring", bandwidth: "1G" }
  ]);

  useEffect(() => {
    // Simulate loading session data
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  }, []);

  const handlePortToggle = (portId: string) => {
    setSelectedPorts(prev => 
      prev.includes(portId) 
        ? prev.filter(id => id !== portId)
        : [...prev, portId]
    );
  };

  const handleL2VPNToggle = (vpnId: string) => {
    setSelectedL2VPNs(prev => 
      prev.includes(vpnId) 
        ? prev.filter(id => id !== vpnId)
        : [...prev, vpnId]
    );
  };

  const handleConnect = async () => {
    if (!selectedSession || !selectedTopology) {
      toast.error("Please select both a session and topology");
      return;
    }

    setIsConnecting(true);
    
    // Simulate API connection
    try {
      const connectionData = {
        session: selectedSession,
        topology: selectedTopology,
        ports: selectedPorts,
        l2vpns: selectedL2VPNs,
        token: token.id_token
      };

      console.log("Connecting with:", connectionData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success("Successfully connected to SDX API with selected resources!");
      
    } catch (error) {
      toast.error("Failed to connect to SDX API");
      console.error("Connection error:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "available":
        return "bg-green-100 text-green-800";
      case "inactive":
      case "in-use":
        return "bg-yellow-100 text-yellow-800";
      case "maintenance":
      case "configuring":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-16 max-w-4xl bg-[rgb(255,255,255)] min-h-screen">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-[rgb(120,176,219)] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div className="text-xl text-[rgb(50,135,200)]">Loading session data...</div>
            <div className="text-sm text-[rgb(64,143,204)]">Fetching available resources from SDX API</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-16 max-w-7xl bg-[rgb(255,255,255)] min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={onBack} className="text-base text-[rgb(50,135,200)] hover:bg-[rgb(236,244,250)]">
          ← Back to tokens
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-[rgb(64,143,204)]">SDX Session Configuration</h1>
          <p className="text-lg text-[rgb(50,135,200)] mt-2">
            Configure your session with topology, ports, and L2VPNs
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Session & Topology */}
        <div className="space-y-6">
          {/* Session Selection */}
          <Card className="shadow-lg border-2 border-[rgb(120,176,219)]">
            <CardHeader>
              <CardTitle className="text-xl text-[rgb(64,143,204)]">Select Session</CardTitle>
              <CardDescription className="text-[rgb(50,135,200)]">
                Choose an existing session or create a new one
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedSession} onValueChange={setSelectedSession}>
                <SelectTrigger className="w-full border-[rgb(120,176,219)]">
                  <SelectValue placeholder="Choose a session" />
                </SelectTrigger>
                <SelectContent>
                  {sessions.map((session) => (
                    <SelectItem key={session.id} value={session.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{session.name}</span>
                        <Badge className={getStatusColor(session.status)}>
                          {session.status}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Topology Selection */}
          <Card className="shadow-lg border-2 border-[rgb(120,176,219)]">
            <CardHeader>
              <CardTitle className="text-xl text-[rgb(64,143,204)]">Select Topology</CardTitle>
              <CardDescription className="text-[rgb(50,135,200)]">
                Choose the network topology for your session
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topologies.map((topology) => (
                  <div
                    key={topology.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedTopology === topology.id
                        ? "border-[rgb(50,135,200)] bg-[rgb(236,244,250)]"
                        : "border-[rgb(120,176,219)] hover:border-[rgb(50,135,200)] hover:bg-[rgb(236,244,250)]"
                    }`}
                    onClick={() => setSelectedTopology(topology.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-[rgb(64,143,204)]">{topology.name}</div>
                        <div className="text-sm text-[rgb(50,135,200)] mt-1">{topology.description}</div>
                      </div>
                      <Badge className={getStatusColor(topology.status)}>
                        {topology.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Ports & L2VPNs */}
        <div className="space-y-6">
          {/* Available Ports */}
          <Card className="shadow-lg border-2 border-[rgb(120,176,219)]">
            <CardHeader>
              <CardTitle className="text-xl text-[rgb(64,143,204)]">Available Ports</CardTitle>
              <CardDescription className="text-[rgb(50,135,200)]">
                Select ports to include in your session ({selectedPorts.length} selected)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {ports.map((port) => (
                  <div
                    key={port.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedPorts.includes(port.id)
                        ? "border-[rgb(50,135,200)] bg-[rgb(236,244,250)]"
                        : "border-[rgb(120,176,219)] hover:bg-[rgb(236,244,250)]"
                    } ${port.status !== "available" ? "opacity-50 cursor-not-allowed" : ""}`}
                    onClick={() => port.status === "available" && handlePortToggle(port.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-[rgb(64,143,204)]">{port.name}</div>
                        <div className="text-sm text-[rgb(50,135,200)]">{port.location} • {port.bandwidth}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(port.status)}>
                          {port.status}
                        </Badge>
                        {selectedPorts.includes(port.id) && (
                          <span className="text-[rgb(50,135,200)]">✓</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Available L2VPNs */}
          <Card className="shadow-lg border-2 border-[rgb(120,176,219)]">
            <CardHeader>
              <CardTitle className="text-xl text-[rgb(64,143,204)]">Available L2VPNs</CardTitle>
              <CardDescription className="text-[rgb(50,135,200)]">
                Select L2VPN connections for your session ({selectedL2VPNs.length} selected)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {l2vpns.map((vpn) => (
                  <div
                    key={vpn.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedL2VPNs.includes(vpn.id)
                        ? "border-[rgb(50,135,200)] bg-[rgb(236,244,250)]"
                        : "border-[rgb(120,176,219)] hover:bg-[rgb(236,244,250)]"
                    }`}
                    onClick={() => handleL2VPNToggle(vpn.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-[rgb(64,143,204)]">{vpn.name}</div>
                        <div className="text-sm text-[rgb(50,135,200)]">
                          {vpn.endpoints.join(" ↔ ")} • {vpn.bandwidth}
                          {vpn.vlan_id && ` • VLAN ${vpn.vlan_id}`}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(vpn.status)}>
                          {vpn.status}
                        </Badge>
                        {selectedL2VPNs.includes(vpn.id) && (
                          <span className="text-[rgb(50,135,200)]">✓</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Connection Summary & Actions */}
      <Card className="mt-8 shadow-lg border-2 border-[rgb(120,176,219)]">
        <CardHeader>
          <CardTitle className="text-xl text-[rgb(64,143,204)]">Connection Summary</CardTitle>
          <CardDescription className="text-[rgb(50,135,200)]">
            Review your selection and establish the connection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-[rgb(236,244,250)] rounded-lg">
              <div className="text-2xl font-bold text-[rgb(50,135,200)]">
                {selectedSession ? "1" : "0"}
              </div>
              <div className="text-sm text-[rgb(64,143,204)]">Session</div>
            </div>
            <div className="text-center p-4 bg-[rgb(236,244,250)] rounded-lg">
              <div className="text-2xl font-bold text-[rgb(50,135,200)]">
                {selectedTopology ? "1" : "0"}
              </div>
              <div className="text-sm text-[rgb(64,143,204)]">Topology</div>
            </div>
            <div className="text-center p-4 bg-[rgb(236,244,250)] rounded-lg">
              <div className="text-2xl font-bold text-[rgb(50,135,200)]">
                {selectedPorts.length}
              </div>
              <div className="text-sm text-[rgb(64,143,204)]">Ports</div>
            </div>
            <div className="text-center p-4 bg-[rgb(236,244,250)] rounded-lg">
              <div className="text-2xl font-bold text-[rgb(50,135,200)]">
                {selectedL2VPNs.length}
              </div>
              <div className="text-sm text-[rgb(64,143,204)]">L2VPNs</div>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="flex gap-4">
            <Button
              onClick={handleConnect}
              disabled={!selectedSession || !selectedTopology || isConnecting}
              className="flex-1 py-3 text-lg font-semibold bg-[rgb(50,135,200)] hover:bg-[rgb(64,143,204)] text-[rgb(255,255,255)] disabled:opacity-50"
            >
              {isConnecting ? "Establishing Connection..." : "Connect to SDX API"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}