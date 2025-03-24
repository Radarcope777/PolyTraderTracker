import { useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_USER_DATA, getTimeRangeParams } from '../utils/graphql';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const formatDate = (timestamp) => {
  if (!timestamp) return '';
  
  const date = new Date(parseInt(timestamp) * 1000);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
        <p className="text-sm font-medium text-gray-900 mb-1">{formatDate(label)}</p>
        <div className="space-y-1">
          <p className="text-xs flex items-center">
            <span className="w-3 h-3 inline-block mr-1 bg-primary-600 rounded-full"></span>
            <span className="mr-2">Total PnL:</span>
            <span className="font-medium">{formatCurrency(payload[0].value)}</span>
          </p>
          <p className="text-xs flex items-center">
            <span className="w-3 h-3 inline-block mr-1 bg-green-500 rounded-full"></span>
            <span className="mr-2">Trading PnL:</span>
            <span className="font-medium">{formatCurrency(payload[1].value)}</span>
          </p>
          <p className="text-xs flex items-center">
            <span className="w-3 h-3 inline-block mr-1 bg-blue-500 rounded-full"></span>
            <span className="mr-2">Rewards PnL:</span>
            <span className="font-medium">{formatCurrency(payload[2].value)}</span>
          </p>
        </div>
      </div>
    );
  }

  return null;
};

const LoadingSkeleton = () => (
  <div className="flex items-center justify-center h-80">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
  </div>
);

const NoDataView = () => (
  <div className="flex flex-col items-center justify-center h-80 text-gray-500">
    <svg 
      xmlns="http://www.w3.org/2000/svg"
      className="h-12 w-12 mb-3"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
    <p className="text-center">No PnL data available for this time period.</p>
  </div>
);

const PnLChart = ({ address, timeRange }) => {
  // Calculate time range for the query
  const { startTime, endTime } = getTimeRangeParams(timeRange);
  
  // Fetch user data from the subgraph
  const { loading, error, data, refetch } = useQuery(GET_USER_DATA, {
    variables: { 
      address: address.toLowerCase(),
      startTime: startTime.toString(),
      endTime: endTime.toString(),
    },
    fetchPolicy: 'network-only',
  });
  
  // Refetch when time range changes
  useEffect(() => {
    refetch({
      address: address.toLowerCase(),
      startTime: startTime.toString(),
      endTime: endTime.toString(),
    });
  }, [address, timeRange, refetch, startTime, endTime]);
  
  if (loading) {
    return <LoadingSkeleton />;
  }
  
  if (error) {
    return (
      <div className="text-red-600 h-80 flex items-center justify-center">
        <p>Error loading chart data: {error.message}</p>
      </div>
    );
  }
  
  const user = data?.user;
  if (!user || !user.dailySnapshots || user.dailySnapshots.length === 0) {
    return <NoDataView />;
  }
  
  // Prepare chart data
  const chartData = user.dailySnapshots.map(snapshot => ({
    timestamp: snapshot.timestamp,
    totalPnL: parseFloat(snapshot.cumulativeTotalPnLUSDC),
    tradingPnL: parseFloat(snapshot.cumulativeTradingPnLUSDC),
    rewardsPnL: parseFloat(snapshot.cumulativeRewardsPnLUSDC),
  }));
  
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="timestamp" 
            tickFormatter={formatDate}
            minTickGap={50}
            stroke="#9ca3af"
          />
          <YAxis 
            tickFormatter={(value) => formatCurrency(value)}
            stroke="#9ca3af"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="totalPnL"
            name="Total PnL"
            stroke="#8b5cf6"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 8 }}
          />
          <Line
            type="monotone"
            dataKey="tradingPnL"
            name="Trading PnL"
            stroke="#10b981"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="rewardsPnL"
            name="Rewards PnL"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PnLChart;