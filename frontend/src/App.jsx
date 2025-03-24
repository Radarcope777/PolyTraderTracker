import { useState } from 'react'
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client'
import Navbar from './components/Navbar'
import UserSearch from './components/UserSearch'
import UserStats from './components/UserStats'
import PnLChart from './components/PnLChart'

// Create Apollo client for connecting to the subgraph
const client = new ApolloClient({
  // Replace with the actual subgraph URL when deployed
  uri: process.env.GRAPH_API_URL || 'https://api.thegraph.com/subgraphs/name/yourusername/polymarket-pnl',
  cache: new InMemoryCache()
})

function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [timeRange, setTimeRange] = useState('30days')

  const handleUserSearch = (address) => {
    setCurrentUser(address)
  }

  const handleTimeRangeChange = (range) => {
    setTimeRange(range)
  }

  return (
    <ApolloProvider client={client}>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Polymarket PnL Tracker</h1>
            <p className="text-gray-600">
              Track your profit and loss across all Polymarket trades and rewards.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4">
              <div className="bg-white rounded-lg shadow p-6">
                <UserSearch onSearch={handleUserSearch} />
              </div>
              
              {currentUser && (
                <div className="bg-white rounded-lg shadow p-6 mt-6">
                  <UserStats 
                    address={currentUser} 
                    timeRange={timeRange}
                  />
                </div>
              )}
            </div>
            
            <div className="lg:col-span-8">
              {currentUser ? (
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">PnL Performance</h2>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleTimeRangeChange('7days')}
                        className={`px-3 py-1 rounded-md ${
                          timeRange === '7days' 
                            ? 'bg-primary-600 text-white' 
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        7D
                      </button>
                      <button 
                        onClick={() => handleTimeRangeChange('30days')}
                        className={`px-3 py-1 rounded-md ${
                          timeRange === '30days' 
                            ? 'bg-primary-600 text-white' 
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        30D
                      </button>
                      <button 
                        onClick={() => handleTimeRangeChange('90days')}
                        className={`px-3 py-1 rounded-md ${
                          timeRange === '90days' 
                            ? 'bg-primary-600 text-white' 
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        90D
                      </button>
                      <button 
                        onClick={() => handleTimeRangeChange('all')}
                        className={`px-3 py-1 rounded-md ${
                          timeRange === 'all' 
                            ? 'bg-primary-600 text-white' 
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        All
                      </button>
                    </div>
                  </div>
                  <PnLChart 
                    address={currentUser}
                    timeRange={timeRange}
                  />
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow p-6 flex items-center justify-center min-h-[400px]">
                  <div className="text-center text-gray-500">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-12 w-12 mx-auto mb-4" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={1.5} 
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                      />
                    </svg>
                    <h3 className="text-lg font-medium mb-2">No user selected</h3>
                    <p>Search for a Polymarket user (wallet address) to see their PnL data</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
        
        <footer className="bg-white py-6 mt-12">
          <div className="container mx-auto px-4">
            <p className="text-center text-gray-600">
              Polymarket PnL Tracker — Data powered by The Graph
            </p>
          </div>
        </footer>
      </div>
    </ApolloProvider>
  )
}

export default App