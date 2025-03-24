import React, { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts'
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, ChartBarIcon, CircleStackIcon, ArrowPathIcon, WalletIcon, DocumentChartBarIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

function App() {
  const [address, setAddress] = useState('');
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('30days');
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddressTooltip, setShowAddressTooltip] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Generated sample data for demonstration
  const generateSampleData = (address) => {
    const now = new Date();
    const data = [];
    let cumulativePnL = 0;
    
    // Create sample markets data
    const markets = [
      { name: "Will BTC exceed $100k in 2025?", volume: 12458.32, pnl: 841.75 },
      { name: "Will ETH 2.0 launch before October?", volume: 5321.87, pnl: -245.32 },
      { name: "Will US inflation drop below 3% this year?", volume: 8741.25, pnl: 1256.89 },
      { name: "Will SpaceX reach Mars by 2026?", volume: 6325.41, pnl: 374.12 },
      { name: "Will NVIDIA stock exceed $1000?", volume: 9874.32, pnl: -578.65 }
    ];
    
    // Create 90 days of data for longer historical view
    for (let i = 90; i >= 0; i--) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      
      // Generate random daily PnL with slight trend bias
      const trend = Math.sin(i / 10) * 30; // Add some cyclical behavior
      const dailyPnL = Math.random() < 0.35
        ? -Math.random() * 80 - trend
        : Math.random() * 120 + trend;
      
      cumulativePnL += dailyPnL;
      
      // Generate trading activity - some days have more trades than others
      const tradesCount = Math.floor(Math.random() * 8);
      
      data.push({
        date: date.toISOString().split('T')[0],
        dailyPnL: parseFloat(dailyPnL.toFixed(2)),
        cumulativePnL: parseFloat(cumulativePnL.toFixed(2)),
        tradesCount: tradesCount
      });
    }
    
    // Generate trades data for activity feed
    const recentActivities = [
      { type: 'buy', market: "Will BTC exceed $100k in 2025?", outcome: "Yes", amount: 250.00, timestamp: "2 hours ago" },
      { type: 'sell', market: "Will ETH 2.0 launch before October?", outcome: "No", amount: 150.50, timestamp: "5 hours ago" },
      { type: 'redeem', market: "US Presidential Election 2024", outcome: "Winner", amount: 845.75, timestamp: "1 day ago" },
      { type: 'buy', market: "Will NVIDIA stock exceed $1000?", outcome: "Yes", amount: 320.25, timestamp: "2 days ago" },
      { type: 'sell', market: "Will SpaceX reach Mars by 2026?", outcome: "No", amount: 175.80, timestamp: "3 days ago" },
    ];
    
    return {
      address,
      totalTradeVolume: parseFloat((Math.random() * 25000 + 5000).toFixed(2)),
      totalPnL: parseFloat(cumulativePnL.toFixed(2)),
      winRate: parseFloat((Math.random() * 30 + 50).toFixed(1)),
      totalMarkets: Math.floor(Math.random() * 30 + 20),
      totalTrades: Math.floor(Math.random() * 200 + 100),
      pnlData: data,
      markets,
      recentActivities
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
  
  const copyAddressToClipboard = () => {
    if (userStats) {
      navigator.clipboard.writeText(userStats.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  // Format numbers with dynamic precision for better readability
  const formatNumber = (num, digits = 2) => {
    if (Math.abs(num) < 0.01) return "0.00";
    
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: digits,
    }).format(num);
  };
  
  // Get gradient colors for charts based on PnL
  const getGradientColors = () => {
    if (!userStats) return { start: '#4f46e5', end: '#818cf8' };
    
    return userStats.totalPnL >= 0
      ? { start: '#10b981', end: '#d1fae5' }  // Green gradient for positive
      : { start: '#ef4444', end: '#fee2e2' };  // Red gradient for negative
  };
  
  // Custom tooltip for PnL chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 shadow-lg rounded-lg">
          <p className="text-gray-600 font-medium">{label}</p>
          <p className={`font-semibold ${payload[0].value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            Cumulative: {payload[0].value >= 0 ? '+' : ''}${formatNumber(payload[0].value)}
          </p>
          <p className={`font-semibold ${payload[1].value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            Daily: {payload[1].value >= 0 ? '+' : ''}${formatNumber(payload[1].value)}
          </p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Animated gradient background header */}
      <header className="relative bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-800 text-white shadow-lg overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQ0MCIgaGVpZ2h0PSI0MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IHgxPSI4LjclIiB5MT0iNTAuNSUiIHgyPSI5MC44JSIgeTI9IjQ5LjUlIiBpZD0iYSI+PHN0b3Agc3RvcC1jb2xvcj0iI0ZGRiIgc3RvcC1vcGFjaXR5PSIwIiBvZmZzZXQ9IjAlIi8+PHN0b3Agc3RvcC1jb2xvcj0iI0ZGRiIgc3RvcC1vcGFjaXR5PSIuMiIgb2Zmc2V0PSIxMDAlIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHBhdGggZD0iTTAgNDAwVjBoMTQ0MHY0MDBIMHoiIGZpbGw9InVybCgjYSkiIGZpbGwtcnVsZT0iZXZlbm9kZCIgZmlsbC1vcGFjaXR5PSIuMSIvPjwvc3ZnPg==')] opacity-30"></div>
        <div className="container mx-auto px-6 py-6 relative">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mr-4">
                <ChartBarIcon className="h-7 w-7 text-indigo-700" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight">
                Polymarket <span className="text-indigo-200">PnL Tracker</span>
              </h1>
            </div>
            <div className="hidden md:flex space-x-6">
              <a href="#" className="hover:text-indigo-200 transition font-medium flex items-center">
                <DocumentChartBarIcon className="h-5 w-5 mr-1" />
                Dashboard
              </a>
              <a href="#" className="hover:text-indigo-200 transition font-medium flex items-center">
                <CircleStackIcon className="h-5 w-5 mr-1" />
                Markets
              </a>
              <a href="#" className="hover:text-indigo-200 transition font-medium flex items-center">
                <ArrowPathIcon className="h-5 w-5 mr-1" />
                API
              </a>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-6 py-8">
        <div className="mb-12 max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-4 tracking-tight">Analyze Your Trading Performance</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Track your profit and loss across all Polymarket trades with advanced metrics and historical analysis.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-white p-5 rounded-xl shadow-md">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <div className="flex-grow relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <WalletIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input 
                  type="text" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter Ethereum wallet address (0x...)" 
                  className="w-full pl-10 pr-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm text-gray-700"
                />
              </div>
              <button 
                onClick={handleSearch}
                disabled={loading}
                className={`px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition duration-300 shadow-sm flex items-center justify-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Loading...
                  </>
                ) : (
                  <>
                    Analyze
                    <ChevronRightIcon className="ml-1 h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="max-w-4xl mx-auto mb-8 p-4 bg-red-100 text-red-700 rounded-lg flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}
        
        {loading && !userStats && (
          <div className="max-w-4xl mx-auto my-16 text-center">
            <div className="inline-block animate-spin rounded-full h-20 w-20 border-4 border-indigo-500 border-t-transparent"></div>
            <p className="mt-6 text-gray-600 text-lg">Analyzing wallet activities and calculating PnL metrics...</p>
          </div>
        )}
        
        {userStats && !loading && (
          <div>
            {/* Wallet overview section */}
            <div className="max-w-6xl mx-auto mb-12">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 px-6 py-4">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center text-white">
                    <div className="flex items-center">
                      <div className="bg-white/10 p-2 rounded-lg mr-3">
                        <WalletIcon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-indigo-200">Wallet Address</div>
                        <div 
                          className="flex items-center cursor-pointer group relative"
                          onMouseEnter={() => setShowAddressTooltip(true)}
                          onMouseLeave={() => setShowAddressTooltip(false)}
                          onClick={copyAddressToClipboard}
                        >
                          <span className="font-mono text-sm md:text-base truncate max-w-xs">
                            {userStats.address}
                          </span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 text-white/70 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                          {showAddressTooltip && (
                            <div className="absolute top-7 left-0 z-10 bg-black text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                              {copied ? 'Copied!' : 'Click to copy'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0 flex space-x-2">
                      <button 
                        onClick={() => setTimeRange('7days')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${timeRange === '7days' ? 'bg-white text-indigo-700' : 'bg-white/10 text-white hover:bg-white/20'}`}
                      >
                        7D
                      </button>
                      <button 
                        onClick={() => setTimeRange('30days')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${timeRange === '30days' ? 'bg-white text-indigo-700' : 'bg-white/10 text-white hover:bg-white/20'}`}
                      >
                        30D
                      </button>
                      <button 
                        onClick={() => setTimeRange('90days')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${timeRange === '90days' ? 'bg-white text-indigo-700' : 'bg-white/10 text-white hover:bg-white/20'}`}
                      >
                        90D
                      </button>
                      <button 
                        onClick={() => setTimeRange('all')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${timeRange === 'all' ? 'bg-white text-indigo-700' : 'bg-white/10 text-white hover:bg-white/20'}`}
                      >
                        All
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Stats cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-gray-200">
                  <div className="bg-white p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Total Trading Volume</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">${formatNumber(userStats.totalTradeVolume)}</p>
                      </div>
                      <div className="bg-indigo-100 rounded-lg p-3">
                        <CircleStackIcon className="h-6 w-6 text-indigo-600" />
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      Across {userStats.totalTrades} trades
                    </div>
                  </div>
                  
                  <div className="bg-white p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Total PnL</p>
                        <p className={`text-2xl font-bold mt-1 ${userStats.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {userStats.totalPnL >= 0 ? '+' : ''}{formatNumber(userStats.totalPnL)} USDC
                        </p>
                      </div>
                      <div className={`rounded-lg p-3 ${userStats.totalPnL >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                        {userStats.totalPnL >= 0 ? (
                          <ArrowTrendingUpIcon className="h-6 w-6 text-green-600" />
                        ) : (
                          <ArrowTrendingDownIcon className="h-6 w-6 text-red-600" />
                        )}
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      {userStats.totalPnL >= 0 ? 'Profit' : 'Loss'} from all markets
                    </div>
                  </div>
                  
                  <div className="bg-white p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Win Rate</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{userStats.winRate}%</p>
                      </div>
                      <div className="bg-purple-100 rounded-lg p-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      Success rate on predictions
                    </div>
                  </div>
                  
                  <div className="bg-white p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Total Markets</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{userStats.totalMarkets}</p>
                      </div>
                      <div className="bg-amber-100 rounded-lg p-3">
                        <ChartBarIcon className="h-6 w-6 text-amber-600" />
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      Markets participated in
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Tab navigation */}
            <div className="max-w-6xl mx-auto mb-8">
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px space-x-8">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'overview'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('markets')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'markets'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Markets
                  </button>
                  <button
                    onClick={() => setActiveTab('activity')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'activity'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Activity
                  </button>
                </nav>
              </div>
            </div>
            
            {/* Tab content */}
            <div className="max-w-6xl mx-auto space-y-8">
              {activeTab === 'overview' && (
                <>
                  {/* PnL Chart */}
                  <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-800">PnL Performance</h3>
                      <p className="text-gray-500 mb-6">Cumulative profit and loss over time</p>
                      
                      <div className="h-96">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={getFilteredData()}>
                            <defs>
                              <linearGradient id="colorPnL" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={getGradientColors().start} stopOpacity={0.8}/>
                                <stop offset="95%" stopColor={getGradientColors().end} stopOpacity={0.2}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis 
                              dataKey="date" 
                              tickLine={false}
                              axisLine={false}
                              tickMargin={10}
                              tick={{ fill: '#6b7280', fontSize: 12 }}
                            />
                            <YAxis 
                              tickLine={false}
                              axisLine={false}
                              tickMargin={10}
                              tick={{ fill: '#6b7280', fontSize: 12 }}
                              tickFormatter={(value) => `$${formatNumber(value)}`}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend 
                              verticalAlign="top" 
                              align="right"
                              iconType="circle"
                              wrapperStyle={{ paddingBottom: '20px' }}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="cumulativePnL" 
                              name="Cumulative PnL" 
                              stroke={getGradientColors().start}
                              fillOpacity={1}
                              fill="url(#colorPnL)"
                              strokeWidth={2}
                              activeDot={{ r: 6 }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="dailyPnL" 
                              name="Daily PnL" 
                              stroke="#8b5cf6"
                              strokeDasharray="4 4"
                              strokeWidth={2}
                              dot={false}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                        <div className="p-4 bg-indigo-50 rounded-lg">
                          <div className="text-sm text-indigo-600 font-medium">Best Day</div>
                          <div className="text-xl font-bold text-indigo-700">
                            +${formatNumber(Math.max(...getFilteredData().map(d => d.dailyPnL)))}
                          </div>
                        </div>
                        <div className="p-4 bg-red-50 rounded-lg">
                          <div className="text-sm text-red-600 font-medium">Worst Day</div>
                          <div className="text-xl font-bold text-red-700">
                            ${formatNumber(Math.min(...getFilteredData().map(d => d.dailyPnL)))}
                          </div>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg">
                          <div className="text-sm text-green-600 font-medium">Profitable Days</div>
                          <div className="text-xl font-bold text-green-700">
                            {getFilteredData().filter(d => d.dailyPnL > 0).length}
                          </div>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg">
                          <div className="text-sm text-purple-600 font-medium">Average Daily</div>
                          <div className="text-xl font-bold text-purple-700">
                            ${formatNumber(
                              getFilteredData().reduce((sum, d) => sum + d.dailyPnL, 0) / 
                              getFilteredData().length
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Trading History Table */}
                  <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-800">Trading History</h3>
                      <p className="text-gray-500 mb-6">Daily PnL for the selected time period</p>
                      
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Trades</th>
                              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Daily PnL</th>
                              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cumulative PnL</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {getFilteredData().slice().reverse().map((item, index) => (
                              <tr key={index} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.date}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right">{item.tradesCount}</td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${item.dailyPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {item.dailyPnL >= 0 ? '+' : ''}{formatNumber(item.dailyPnL)} USDC
                                </td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${item.cumulativePnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {item.cumulativePnL >= 0 ? '+' : ''}{formatNumber(item.cumulativePnL)} USDC
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </>
              )}
              
              {activeTab === 'markets' && (
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800">Market Performance</h3>
                    <p className="text-gray-500 mb-6">PnL breakdown by markets</p>
                    
                    <div className="h-80 mb-8">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={userStats.markets}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" tick={false} />
                          <YAxis 
                            tickFormatter={(value) => `$${formatNumber(value)}`} 
                            tickLine={false}
                          />
                          <Tooltip 
                            formatter={(value) => [`$${formatNumber(value)}`, '']} 
                            labelFormatter={(value) => userStats.markets[value].name}
                          />
                          <Legend />
                          <Bar 
                            dataKey="pnl" 
                            name="PnL" 
                            fill={userStats.totalPnL >= 0 ? "#10b981" : "#ef4444"}
                            radius={[4, 4, 0, 0]} 
                          />
                          <Bar 
                            dataKey="volume" 
                            name="Volume" 
                            fill="#6366f1" 
                            radius={[4, 4, 0, 0]} 
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Market</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Trading Volume</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">PnL</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {userStats.markets.map((market, index) => (
                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 text-sm font-medium text-gray-900">{market.name}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right">${formatNumber(market.volume)}</td>
                              <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${market.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {market.pnl >= 0 ? '+' : ''}{formatNumber(market.pnl)} USDC
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'activity' && (
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800">Recent Activity</h3>
                    <p className="text-gray-500 mb-6">Latest trades and redemptions</p>
                    
                    <div className="space-y-4">
                      {userStats.recentActivities.map((activity, index) => (
                        <div key={index} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                          <div className="flex items-start">
                            <div className={`mt-1 rounded-full p-2 mr-4 
                              ${activity.type === 'buy' ? 'bg-green-100' : 
                                activity.type === 'sell' ? 'bg-red-100' : 'bg-blue-100'}`}>
                              {activity.type === 'buy' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                              ) : activity.type === 'sell' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-900">
                                    {activity.type === 'buy' ? 'Bought ' : 
                                     activity.type === 'sell' ? 'Sold ' : 'Redeemed '}
                                    <span className="font-bold">{activity.outcome}</span>
                                  </h4>
                                  <p className="text-sm text-gray-500 mt-1">{activity.market}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium text-gray-900">${formatNumber(activity.amount)}</p>
                                  <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {!userStats && !loading && (
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            <div className="p-12 flex flex-col items-center justify-center space-y-8">
              <div className="w-28 h-28 rounded-full bg-indigo-100 flex items-center justify-center">
                <ChartBarIcon className="h-14 w-14 text-indigo-600" />
              </div>
              <div className="text-center max-w-md">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Track Your Polymarket Performance</h3>
                <p className="text-lg text-gray-600">
                  Enter your Ethereum wallet address above to view your PnL and trading metrics across all Polymarket activities.
                </p>
                <div className="mt-6 text-sm text-gray-500 space-y-2">
                  <p className="flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Real-time PnL calculation
                  </p>
                  <p className="flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Historical data and trends
                  </p>
                  <p className="flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Market-by-market breakdown
                  </p>
                </div>
              </div>
              <button 
                className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition duration-300 shadow-md flex items-center"
                onClick={() => document.querySelector('input').focus()}
              >
                Get Started
                <ChevronRightIcon className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </main>
      
      <footer className="bg-white border-t border-gray-200 py-12 mt-16">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-indigo-600 rounded-full flex items-center justify-center mr-3">
                  <ChartBarIcon className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-800">
                  Polymarket <span className="text-indigo-600">PnL Tracker</span>
                </span>
              </div>
              <p className="text-gray-500 mt-2 max-w-sm">
                Advanced analytics and profit tracking for Polymarket traders, powered by The Graph.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-x-16 gap-y-4 text-sm">
              <a href="#" className="text-gray-600 hover:text-indigo-600 transition">Documentation</a>
              <a href="#" className="text-gray-600 hover:text-indigo-600 transition">Privacy Policy</a>
              <a href="#" className="text-gray-600 hover:text-indigo-600 transition">API Access</a>
              <a href="#" className="text-gray-600 hover:text-indigo-600 transition">Terms of Use</a>
              <a href="#" className="text-gray-600 hover:text-indigo-600 transition">About</a>
              <a href="#" className="text-gray-600 hover:text-indigo-600 transition">Contact</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-100 text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} Polymarket PnL Tracker. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App