function App() {
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-blue-600">
            AtlanticWave-SDX
          </h1>
          <p className="text-sm text-blue-500">
            International Distributed Software-Defined Exchange
          </p>
        </div>
        
        <div className="space-y-4">
          <button className="w-full p-4 bg-white border border-blue-300 text-blue-600 rounded hover:bg-blue-50">
            CILogon - Academic federation
          </button>
          
          <button className="w-full p-4 bg-white border border-blue-300 text-blue-600 rounded hover:bg-blue-50">
            ORCID - Researcher identifier  
          </button>
          
          <button className="w-full p-4 bg-white border border-blue-300 text-blue-600 rounded hover:bg-blue-50">
            FABRIC API - Research infrastructure
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;