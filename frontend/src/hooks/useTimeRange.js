import { useState, useMemo } from 'react';
import { getTimeRangeParams } from '../utils/graphql';

/**
 * Custom hook to manage time range filtering for PnL data
 */
export const useTimeRange = (dailySnapshots = []) => {
  const [timeRange, setTimeRange] = useState('30days'); // '7days', '30days', '90days', 'all'
  
  // Get filtered snapshots based on selected time range
  const filteredSnapshots = useMemo(() => {
    if (!dailySnapshots || dailySnapshots.length === 0) {
      return [];
    }
    
    const { startTime } = getTimeRangeParams(timeRange);
    
    return dailySnapshots.filter(snapshot => {
      const snapshotTimestamp = parseInt(snapshot.timestamp);
      return snapshotTimestamp >= startTime;
    });
  }, [dailySnapshots, timeRange]);
  
  // Calculate performance metrics based on the filtered snapshots
  const metrics = useMemo(() => {
    if (filteredSnapshots.length === 0) {
      return {
        periodTradingPnL: 0,
        periodRewardsPnL: 0,
        periodTotalPnL: 0,
        periodTradeVolume: 0,
      };
    }
    
    const first = filteredSnapshots[0];
    const last = filteredSnapshots[filteredSnapshots.length - 1];
    
    // Calculate the difference between latest and earliest values
    const periodTradingPnL = 
      parseFloat(last.cumulativeTradingPnLUSDC) - parseFloat(first.cumulativeTradingPnLUSDC);
    const periodRewardsPnL = 
      parseFloat(last.cumulativeRewardsPnLUSDC) - parseFloat(first.cumulativeRewardsPnLUSDC);
    const periodTotalPnL = 
      parseFloat(last.cumulativeTotalPnLUSDC) - parseFloat(first.cumulativeTotalPnLUSDC);
    const periodTradeVolume = 
      parseFloat(last.cumulativeTradeVolumeUSDC) - parseFloat(first.cumulativeTradeVolumeUSDC);
    
    return {
      periodTradingPnL,
      periodRewardsPnL,
      periodTotalPnL,
      periodTradeVolume,
    };
  }, [filteredSnapshots]);
  
  return {
    timeRange,
    setTimeRange,
    filteredSnapshots,
    metrics,
  };
};