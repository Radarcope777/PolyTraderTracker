import { useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_USER_DATA } from '../utils/graphql';
import { getTimeRangeParams } from '../utils/graphql';
import { useTimeRange } from '../hooks/useTimeRange';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  
  const date = new Date(parseInt(timestamp) * 1000);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const StatItem = ({ label, value, isPositive = null, isCurrency = false, isPercentage = false }) => {
  let displayValue = value;
  
  if (isCurrency) {
    displayValue = formatCurrency(Number(value) || 0);
  }
  
  if (isPercentage) {
    displayValue = `${(Number(value) || 0).toFixed(2)}%`;
  }
  
  return (
    <div className="flex flex-col">
      <span className="text-sm text-gray-500">{label}</span>
      <span 
        className={`text-lg font-semibold ${
          isPositive === null 
            ? 'text-gray-800' 
            : isPositive 
              ? 'text-green-600' 
              : 'text-red-600'
        }`}
      >
        {displayValue}
      </span>
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="h-10 bg-gray-200 rounded"></div>
      <div className="h-10 bg-gray-200 rounded"></div>
    </div>
    <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
    <div className="grid grid-cols-2 gap-4">
      <div className="h-10 bg-gray-200 rounded"></div>
      <div className="h-10 bg-gray-200 rounded"></div>
    </div>
  </div>
);

const UserStats = ({ address, timeRange }) => {
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
  
  // Process user snapshots with the useTimeRange hook
  const user = data?.user;
  const { metrics } = useTimeRange(user?.dailySnapshots || []);
  
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
      <div className="text-red-600">
        <p>Error loading user data: {error.message}</p>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="text-gray-600">
        <p>No data found for this address. This user may not have any trading activity on Polymarket.</p>
      </div>
    );
  }
  
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">User Stats</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Overall Performance</h3>
          <div className="grid grid-cols-2 gap-4">
            <StatItem 
              label="Total PnL" 
              value={user.totalPnLUSDC} 
              isPositive={Number(user.totalPnLUSDC) >= 0}
              isCurrency={true} 
            />
            <StatItem 
              label="Trading Volume" 
              value={user.totalTradeVolumeUSDC} 
              isCurrency={true} 
            />
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Breakdown</h3>
          <div className="grid grid-cols-2 gap-4">
            <StatItem 
              label="Trading PnL" 
              value={user.tradingPnLUSDC} 
              isPositive={Number(user.tradingPnLUSDC) >= 0}
              isCurrency={true} 
            />
            <StatItem 
              label="Rewards PnL" 
              value={user.rewardsPnLUSDC} 
              isPositive={Number(user.rewardsPnLUSDC) >= 0}
              isCurrency={true} 
            />
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Selected Period ({timeRange})</h3>
          <div className="grid grid-cols-2 gap-4">
            <StatItem 
              label="Period PnL" 
              value={metrics.periodTotalPnL} 
              isPositive={metrics.periodTotalPnL >= 0}
              isCurrency={true} 
            />
            <StatItem 
              label="Period Volume" 
              value={metrics.periodTradeVolume} 
              isCurrency={true} 
            />
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Trading History</h3>
          <div className="grid grid-cols-2 gap-4">
            <StatItem 
              label="First Trade" 
              value={formatDate(user.firstTradeTimestamp)} 
            />
            <StatItem 
              label="Last Trade" 
              value={formatDate(user.lastTradeTimestamp)} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserStats;