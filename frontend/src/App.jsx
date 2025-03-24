import React, { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

function App() {
  const [address, setAddress] = useState('');
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('30days');
  
  // Generated sample data for demonstration
  const generateSampleData = (address) => {
    const now = new Date();
    const data = [];
    let cumulativePnL = 0;
    
    // Create 30 days of data
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      
      // Generate random daily PnL between -50 and 100 USD
      const dailyPnL = Math.random() < 0.3 
        ? -Math.random() * 50 
        : Math.random() * 100;
      
      cumulativePnL += dailyPnL;
      
      data.push({
        date: date.toISOString().split('T')[0],
        dailyPnL: parseFloat(dailyPnL.toFixed(2)),
        cumulativePnL: parseFloat(cumulativePnL.toFixed(2))
      });
    }
    
    return {
      address,
      totalTradeVolume: parseFloat((Math.random() * 10000).toFixed(2)),
      totalPnL: parseFloat(cumulativePnL.toFixed(2)),
      pnlData: data
    };
  };
  
  const handleSearch = () => {
    if (!address) return;
    
    setLoading(true);
    setError(null);
    
    // Simulate API call
    setTimeout(() => {
      try {
        // In a real app, we would fetch from the subgraph here
        const sampleData = generateSampleData(address);
        setUserStats(sampleData);
        setLoading(false);
      } catch (err) {
        setError('Error fetching user data');
        setLoading(false);
      }
    }, 800);
  };
  
  // When user presses Enter in the input field
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  // Filter data based on selected time range
  const getFilteredData = () => {
    if (!userStats) return [];
    
    const { pnlData } = userStats;
    const now = new Date();
    let daysToShow = 30;
    
    switch (timeRange) {
      case '7days':
        daysToShow = 7;
        break;
      case '30days':
        daysToShow = 30;
        break;
      case '90days':
        daysToShow = 90;
        break;
      case 'all':
        return pnlData;
      default:
        daysToShow = 30;
    }
    
    return pnlData.slice(-daysToShow - 1);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-indigo-700 text-white shadow-lg">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Polymarket PnL Tracker</h1>
          <div className="hidden md:flex space-x-4">
            <a href="#" className="hover:text-indigo-200 transition">Dashboard</a>
            <a href="#" className="hover:text-indigo-200 transition">Analytics</a>
            <a href="#" className="hover:text-indigo-200 transition">About</a>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8 max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Track Your Polymarket Performance</h2>
          <p className="text-lg text-gray-600">
            Enter your wallet address to analyze your profit and loss metrics across all Polymarket trades.
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto mb-12">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <input 
              type="text" 
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter Ethereum address (0x...)" 
              className="flex-grow p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm text-base"
            />
            <button 
              onClick={handleSearch}
              disabled={loading}
              className={`px-6 py-4 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition duration-200 shadow-sm ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Loading...' : 'Analyze'}
            </button>
          </div>
        </div>
        
        {error && (
          <div className="max-w-3xl mx-auto mb-8 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        {loading && (
          <div className="max-w-3xl mx-auto my-16 text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Analyzing wallet activities...</p>
          </div>
        )}
        
        {userStats && !loading && (
          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Wallet Overview</h3>
                    <p className="text-gray-500 truncate max-w-md">{userStats.address}</p>
                  </div>
                  <div className="mt-4 md:mt-0 space-x-2">
                    <button 
                      onClick={() => setTimeRange('7days')}
                      className={`px-4 py-2 rounded-md ${timeRange === '7days' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                      7D
                    </button>
                    <button 
                      onClick={() => setTimeRange('30days')}
                      className={`px-4 py-2 rounded-md ${timeRange === '30days' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                      30D
                    </button>
                    <button 
                      onClick={() => setTimeRange('90days')}
                      className={`px-4 py-2 rounded-md ${timeRange === '90days' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                      90D
                    </button>
                    <button 
                      onClick={() => setTimeRange('all')}
                      className={`px-4 py-2 rounded-md ${timeRange === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                      All
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-indigo-50 p-6 rounded-lg">
                    <p className="text-indigo-500 font-medium">Total Trading Volume</p>
                    <p className="text-3xl font-bold">${userStats.totalTradeVolume.toLocaleString()}</p>
                  </div>
                  <div className={`p-6 rounded-lg ${userStats.totalPnL >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                    <p className={`font-medium ${userStats.totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>Total PnL</p>
                    <p className={`text-3xl font-bold ${userStats.totalPnL >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                      {userStats.totalPnL >= 0 ? '+' : ''}{userStats.totalPnL.toLocaleString()} USDC
                    </p>
                  </div>
                </div>
                
                <div className="h-80">
                  <h4 className="text-lg font-semibold mb-4">PnL Performance</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getFilteredData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => ['$' + value.toFixed(2), '']} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="cumulativePnL" 
                        name="Cumulative PnL" 
                        stroke="#4f46e5" 
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="dailyPnL" 
                        name="Daily PnL" 
                        stroke="#10b981" 
                        strokeWidth={1}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md overflow-hidden p-6 md:p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Trading History</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Daily PnL</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cumulative PnL</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getFilteredData().map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.date}</td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${item.dailyPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {item.dailyPnL >= 0 ? '+' : ''}{item.dailyPnL.toFixed(2)} USDC
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${item.cumulativePnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {item.cumulativePnL >= 0 ? '+' : ''}{item.cumulativePnL.toFixed(2)} USDC
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {!userStats && !loading && (
          <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-8 flex flex-col items-center justify-center space-y-6">
              <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-800">No Wallet Selected</h3>
                <p className="mt-2 text-gray-600 max-w-md">
                  Enter your Ethereum wallet address above to view your Polymarket trading performance and profit/loss analysis.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <footer className="bg-white border-t border-gray-200 py-8 mt-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 mb-4 md:mb-0">
              Polymarket PnL Tracker — Data powered by The Graph
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-500 hover:text-indigo-600 transition">Terms</a>
              <a href="#" className="text-gray-500 hover:text-indigo-600 transition">Privacy</a>
              <a href="#" className="text-gray-500 hover:text-indigo-600 transition">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App