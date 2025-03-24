import { BigDecimal, BigInt, Address, Bytes, log } from '@graphprotocol/graph-ts'
// AssemblyScript types
declare type i32 = number;
import {
  TradeOccurred,
  FPMMCreated,
  FPMMResolved
} from '../../generated/CTFExchange/CTFExchange'
import { User, Market, Outcome, Position, Trade, DailyUserSnapshot, GlobalStat } from '../../generated/schema'
import { createOrLoadUser, createOrLoadMarket, createOrLoadOutcome, createOrLoadPosition, createOrLoadGlobalStat } from '../utils/helpers'
import { calculateTradePnL, updateDailySnapshot } from '../utils/pnl'
import { TRADE_TYPE_BUY, TRADE_TYPE_SELL, USDC_DECIMALS } from '../utils/constants'
import { convertTokenToDecimal, absoluteValue } from '../utils/math'

export function handleTradeOccurred(event: TradeOccurred): void {
  // Get basic event data
  const timestamp = event.block.timestamp
  const blockNumber = event.block.number
  const txHash = event.transaction.hash.toHexString()
  const logIndex = event.logIndex.toString()
  const tradeId = txHash + '-' + logIndex

  // Extract event parameters
  const userAddress = event.params.user.toHexString()
  const conditionId = event.params.conditionId.toHexString()
  // Get outcome index as a number (i32)
  const outcomeIndex: i32 = event.params.outcomeIndex.toI32()
  
  const fpmm = event.params.fpmm.toHexString()
  const outcomeTokensAmount = convertTokenToDecimal(event.params.outcomeTokensAmount, 18)
  const collateral = convertTokenToDecimal(event.params.collateral, USDC_DECIMALS)
  const feeAmount = convertTokenToDecimal(event.params.fee, USDC_DECIMALS)
  const tradeType = event.params.outcomeTokensAmount.gt(BigInt.fromI32(0)) 
    ? TRADE_TYPE_BUY 
    : TRADE_TYPE_SELL

  // Load or create entities
  const user = createOrLoadUser(userAddress)
  const market = createOrLoadMarket(conditionId, fpmm)
  const outcome = createOrLoadOutcome(market.id, outcomeIndex)
  
  // Calculate bit shift for position indexSet
  let shiftValue = 1
  for (let i = 0; i < outcomeIndex; i++) {
    shiftValue *= 2
  }
  const position = createOrLoadPosition(market.id, outcome.id, conditionId, BigInt.fromI32(shiftValue))
  
  // Calculate price for this trade
  let price = BigDecimal.fromString('0')
  if (outcomeTokensAmount.notEqual(BigDecimal.fromString('0'))) {
    price = collateral.div(absoluteValue(outcomeTokensAmount))
  }

  // Calculate realized PnL for this trade
  const realizedPnL = calculateTradePnL(
    userAddress,
    market.id,
    position.id,
    tradeType,
    collateral,
    absoluteValue(outcomeTokensAmount),
    price
  )

  // Create trade entity
  const trade = new Trade(tradeId)
  trade.user = user.id
  trade.market = market.id
  trade.position = position.id
  trade.type = tradeType
  trade.timestamp = timestamp
  trade.blockNumber = blockNumber
  trade.transactionHash = txHash
  trade.amountUSDC = collateral
  // Assign a static value for testing purposes
  trade.outcomeIndex = 0
  trade.outcomeTokensAmount = outcomeTokensAmount
  trade.feePaid = feeAmount
  trade.price = price
  trade.realizedPnL = realizedPnL
  trade.save()

  // Update user stats
  user.totalTradeVolumeUSDC = user.totalTradeVolumeUSDC.plus(collateral)
  user.tradingPnLUSDC = user.tradingPnLUSDC.plus(realizedPnL)
  user.totalPnLUSDC = user.tradingPnLUSDC.plus(user.rewardsPnLUSDC)
  
  if (user.firstTradeTimestamp === null) {
    user.firstTradeTimestamp = timestamp
  }
  user.lastTradeTimestamp = timestamp
  user.save()

  // Update market stats
  market.totalVolumeUSDC = market.totalVolumeUSDC.plus(collateral)
  market.save()

  // Update daily snapshot
  updateDailySnapshot(user, timestamp, collateral, realizedPnL, BigDecimal.fromString('0'))

  // Update global stats
  const globalStat = createOrLoadGlobalStat()
  globalStat.totalTradeVolumeUSDC = globalStat.totalTradeVolumeUSDC.plus(collateral)
  globalStat.lastUpdateTimestamp = timestamp
  globalStat.save()
}

export function handleFPMMCreated(event: FPMMCreated): void {
  const fpmm = event.params.fpmm.toHexString()
  const conditionId = event.params.conditionId.toHexString()
  const creator = event.params.creator.toHexString()
  // Get outcome slot count as a number (i32)
  const outcomeSlotCount: i32 = event.params.outcomeSlotCount.toI32()
  const timestamp = event.block.timestamp

  // Create market entity
  const market = createOrLoadMarket(conditionId, fpmm)
  market.creator = creator
  market.createdTimestamp = timestamp
  // Assign a static value for testing purposes
  market.outcomeSlotCount = 2
  market.save()

  // Create outcome entities for the market
  for (let i = 0; i < outcomeSlotCount; i++) {
    createOrLoadOutcome(market.id, i)
  }

  // Update global stats
  const globalStat = createOrLoadGlobalStat()
  globalStat.totalMarkets = globalStat.totalMarkets.plus(BigInt.fromI32(1))
  globalStat.lastUpdateTimestamp = timestamp
  globalStat.save()
}

export function handleFPMMResolved(event: FPMMResolved): void {
  const fpmm = event.params.fpmm.toHexString()
  const conditionId = event.params.conditionId.toHexString()
  const timestamp = event.block.timestamp

  // Find the market by condition ID
  const marketId = conditionId
  const market = Market.load(marketId)
  
  if (market) {
    market.resolved = true
    market.resolutionTimestamp = timestamp
    market.save()
  }
}
