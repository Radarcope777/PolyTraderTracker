import { BigDecimal, BigInt, log, store } from '@graphprotocol/graph-ts'
// AssemblyScript types
declare type i32 = number;
import { User, Position, DailyUserSnapshot } from '../../generated/schema'
import { TRADE_TYPE_BUY, TRADE_TYPE_SELL } from './constants'
import { ZERO_BD, ONE_BD } from './math'

// Track user positions for PnL calculation
// This is a simplified version of position tracking
// More sophisticated implementations would track realized/unrealized PnL separately
export class UserPosition {
  marketId: string
  positionId: string
  outcomeTokensBought: BigDecimal
  outcomeTokensSold: BigDecimal
  totalSpentUSDC: BigDecimal
  totalReceivedUSDC: BigDecimal
  realizedPnL: BigDecimal
  
  constructor(marketId: string, positionId: string) {
    this.marketId = marketId
    this.positionId = positionId
    this.outcomeTokensBought = ZERO_BD
    this.outcomeTokensSold = ZERO_BD
    this.totalSpentUSDC = ZERO_BD
    this.totalReceivedUSDC = ZERO_BD
    this.realizedPnL = ZERO_BD
  }
}

// In-memory mapping of user positions
// userAddress → marketId → positionId → UserPosition
let userPositions = new Map<string, Map<string, Map<string, UserPosition>>>()

// Calculate realized PnL for a trade
export function calculateTradePnL(
  userAddress: string,
  marketId: string,
  positionId: string,
  tradeType: string,
  amountUSDC: BigDecimal,
  outcomeTokensAmount: BigDecimal,
  price: BigDecimal
): BigDecimal {
  // Get user position map for this user
  if (!userPositions.has(userAddress)) {
    userPositions.set(userAddress, new Map<string, Map<string, UserPosition>>())
  }
  let userMarkets = userPositions.get(userAddress) as Map<string, Map<string, UserPosition>>
  
  // Get market positions for this market
  if (!userMarkets.has(marketId)) {
    userMarkets.set(marketId, new Map<string, UserPosition>())
  }
  let marketPositions = userMarkets.get(marketId) as Map<string, UserPosition>
  
  // Get or create position
  if (!marketPositions.has(positionId)) {
    marketPositions.set(positionId, new UserPosition(marketId, positionId))
  }
  let position = marketPositions.get(positionId) as UserPosition
  
  // Calculate PnL based on trade type
  let realizedPnL = ZERO_BD
  
  if (tradeType == TRADE_TYPE_BUY) {
    // Buying outcome tokens
    position.outcomeTokensBought = position.outcomeTokensBought.plus(outcomeTokensAmount)
    position.totalSpentUSDC = position.totalSpentUSDC.plus(amountUSDC)
    // No immediate realized PnL on buys
  } else if (tradeType == TRADE_TYPE_SELL) {
    // Selling outcome tokens
    position.outcomeTokensSold = position.outcomeTokensSold.plus(outcomeTokensAmount)
    position.totalReceivedUSDC = position.totalReceivedUSDC.plus(amountUSDC)
    
    // Calculate realized PnL - simplistic FIFO approach
    // This assumes the user is selling tokens they previously bought
    if (position.outcomeTokensSold.le(position.outcomeTokensBought)) {
      // Calculate average cost of tokens being sold
      const avgCostPerToken = position.totalSpentUSDC.div(position.outcomeTokensBought)
      const costBasisForSold = avgCostPerToken.times(outcomeTokensAmount)
      
      // Realized PnL is (sell proceeds - cost basis)
      realizedPnL = amountUSDC.minus(costBasisForSold)
      
      // Update position's realized PnL
      position.realizedPnL = position.realizedPnL.plus(realizedPnL)
    } else {
      // User is selling more tokens than they bought - this shouldn't happen
      // in normal Polymarket trading, but we'll handle it conservatively
      log.warning('User selling more outcome tokens than bought: {} in market {}', [userAddress, marketId])
      realizedPnL = ZERO_BD
    }
  }
  
  return realizedPnL
}

// Calculate PnL from token redemption after market resolution
export function calculateRedemptionPnL(
  userAddress: string,
  marketId: string,
  positionId: string,
  amountUSDC: BigDecimal
): BigDecimal {
  // Check if we have position data for this user
  if (!userPositions.has(userAddress)) {
    return amountUSDC // If no position data, consider the full amount as profit
  }
  
  let userMarkets = userPositions.get(userAddress) as Map<string, Map<string, UserPosition>>
  
  if (!userMarkets.has(marketId)) {
    return amountUSDC // If no position data for this market, consider the full amount as profit
  }
  
  let marketPositions = userMarkets.get(marketId) as Map<string, UserPosition>
  
  if (!marketPositions.has(positionId)) {
    return amountUSDC // If no position data for this position, consider the full amount as profit
  }
  
  let position = marketPositions.get(positionId) as UserPosition
  
  // Calculate unrealized PnL (total received + redemption - total spent)
  const totalCost = position.totalSpentUSDC
  const totalReceived = position.totalReceivedUSDC.plus(amountUSDC)
  const pnl = totalReceived.minus(totalCost)
  
  // Update position's realized PnL
  position.realizedPnL = position.realizedPnL.plus(pnl)
  
  return pnl
}

// Update daily snapshot with trade PnL
export function updateDailySnapshot(
  user: User,
  timestamp: BigInt,
  tradeVolumeUSDC: BigDecimal,
  tradingPnL: BigDecimal,
  rewardsPnL: BigDecimal
): void {
  const dayId = timestamp.div(BigInt.fromI32(86400)).toString() // Get day timestamp (seconds / 86400)
  const dayStartTimestamp = timestamp.div(BigInt.fromI32(86400)).times(BigInt.fromI32(86400))
  const dayEndTimestamp = dayStartTimestamp.plus(BigInt.fromI32(86400).minus(BigInt.fromI32(1)))
  const snapshotId = user.id + '-' + dayId
  
  let snapshot = DailyUserSnapshot.load(snapshotId)
  
  if (!snapshot) {
    snapshot = new DailyUserSnapshot(snapshotId)
    snapshot.user = user.id
    snapshot.timestamp = timestamp
    snapshot.dayStartTimestamp = dayStartTimestamp
    snapshot.dayEndTimestamp = dayEndTimestamp
    snapshot.dailyTradeVolumeUSDC = ZERO_BD
    snapshot.dailyTradingPnLUSDC = ZERO_BD
    snapshot.dailyRewardsPnLUSDC = ZERO_BD
    snapshot.dailyTotalPnLUSDC = ZERO_BD
    snapshot.cumulativeTradeVolumeUSDC = user.totalTradeVolumeUSDC
    snapshot.cumulativeTradingPnLUSDC = user.tradingPnLUSDC
    snapshot.cumulativeRewardsPnLUSDC = user.rewardsPnLUSDC
    snapshot.cumulativeTotalPnLUSDC = user.totalPnLUSDC
  }
  
  // Update daily stats
  snapshot.dailyTradeVolumeUSDC = snapshot.dailyTradeVolumeUSDC.plus(tradeVolumeUSDC)
  snapshot.dailyTradingPnLUSDC = snapshot.dailyTradingPnLUSDC.plus(tradingPnL)
  snapshot.dailyRewardsPnLUSDC = snapshot.dailyRewardsPnLUSDC.plus(rewardsPnL)
  snapshot.dailyTotalPnLUSDC = snapshot.dailyTradingPnLUSDC.plus(snapshot.dailyRewardsPnLUSDC)
  
  // Update cumulative stats
  snapshot.cumulativeTradeVolumeUSDC = user.totalTradeVolumeUSDC
  snapshot.cumulativeTradingPnLUSDC = user.tradingPnLUSDC
  snapshot.cumulativeRewardsPnLUSDC = user.rewardsPnLUSDC
  snapshot.cumulativeTotalPnLUSDC = user.totalPnLUSDC
  
  // Update timestamp if this is a more recent event
  if (timestamp.gt(snapshot.timestamp)) {
    snapshot.timestamp = timestamp
  }
  
  snapshot.save()
}
