import { gql } from '@apollo/client';

// Query to get user data with PnL information
export const GET_USER_DATA = gql`
  query GetUserData($address: String!, $startTime: BigInt!, $endTime: BigInt!) {
    user(id: $address) {
      id
      totalTradeVolumeUSDC
      totalPnLUSDC
      tradingPnLUSDC
      rewardsPnLUSDC
      firstTradeTimestamp
      lastTradeTimestamp
      dailySnapshots(where: {timestamp_gte: $startTime, timestamp_lte: $endTime}, orderBy: timestamp) {
        id
        timestamp
        dailyTradeVolumeUSDC
        dailyTradingPnLUSDC
        dailyRewardsPnLUSDC
        dailyTotalPnLUSDC
        cumulativeTradeVolumeUSDC
        cumulativeTradingPnLUSDC
        cumulativeRewardsPnLUSDC
        cumulativeTotalPnLUSDC
      }
    }
  }
`;

// Query to get user's trades
export const GET_USER_TRADES = gql`
  query GetUserTrades($address: String!, $limit: Int!) {
    trades(
      where: { user: $address }
      orderBy: timestamp
      orderDirection: desc
      first: $limit
    ) {
      id
      timestamp
      market {
        id
        questionId
      }
      position {
        id
        outcome {
          id
          value
        }
      }
      type
      amountUSDC
      outcomeTokensAmount
      price
      realizedPnL
    }
  }
`;

// Query to get global stats
export const GET_GLOBAL_STATS = gql`
  query GetGlobalStats {
    globalStats(first: 1) {
      id
      totalUsers
      totalMarkets
      totalTradeVolumeUSDC
      lastUpdateTimestamp
    }
  }
`;

// Query to get top traders by PnL
export const GET_TOP_TRADERS = gql`
  query GetTopTraders($limit: Int!) {
    users(
      orderBy: totalPnLUSDC
      orderDirection: desc
      first: $limit
    ) {
      id
      totalTradeVolumeUSDC
      totalPnLUSDC
      tradingPnLUSDC
      rewardsPnLUSDC
      firstTradeTimestamp
      lastTradeTimestamp
    }
  }
`;

// Helper function to format timestamps for GraphQL queries
export const getTimeRangeParams = (timeRange) => {
  const endTime = Math.floor(Date.now() / 1000);
  let startTime;
  
  switch (timeRange) {
    case '7days':
      startTime = endTime - (7 * 24 * 60 * 60);
      break;
    case '30days':
      startTime = endTime - (30 * 24 * 60 * 60);
      break;
    case '90days':
      startTime = endTime - (90 * 24 * 60 * 60);
      break;
    case 'all':
      startTime = 0; // Fetch all data
      break;
    default:
      startTime = endTime - (30 * 24 * 60 * 60);
  }
  
  return { startTime, endTime };
};