import React from 'react'

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-purple-700">Polymarket PnL Tracker</h1>
        </div>
      </header>
      
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome to Polymarket PnL Tracker</h2>
          <p className="text-gray-600">
            Track your profit and loss across all Polymarket trades and rewards.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-purple-600 text-6xl font-bold mb-4">PnL</div>
            <h3 className="text-lg font-medium mb-2">Enter a wallet address to start</h3>
            <div className="mt-4">
              <input 
                type="text" 
                placeholder="0x..." 
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button className="mt-4 w-full bg-purple-600 text-white py-3 rounded-md hover:bg-purple-700 transition">
                Search
              </button>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-white py-6 mt-12">
        <div className="container mx-auto px-6">
          <p className="text-center text-gray-600">
            Polymarket PnL Tracker — Data powered by The Graph
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App