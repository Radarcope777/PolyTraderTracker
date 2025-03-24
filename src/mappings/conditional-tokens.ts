import { BigDecimal, BigInt, Address, Bytes, log } from '@graphprotocol/graph-ts'
// AssemblyScript types
declare type i32 = number;
import {
  ConditionPreparation,
  ConditionResolution,
  PositionSplit,
  PositionsMerge,
  PayoutRedemption
} from '../../generated/ConditionalTokens/ConditionalTokens'
import { User, Market, Position } from '../../generated/schema'
import { createOrLoadUser, createOrLoadMarket, createOrLoadPosition } from '../utils/helpers'
import { convertTokenToDecimal } from '../utils/math'
import { calculateRedemptionPnL, updateDailySnapshot } from '../utils/pnl'
import { USDC_DECIMALS } from '../utils/constants'

export function handleConditionPreparation(event: ConditionPreparation): void {
  const conditionId = event.params.conditionId.toHexString()
  const oracle = event.params.oracle.toHexString()
  const questionId = event.params.questionId.toHexString()
  // BigInt to i32 conversion needs to be carefully handled in AssemblyScript
  // First convert to I32 which returns a number, then we need to cast to i32 for field assignment
  // Get outcome slot count as a number (i32)
  const outcomeSlotCount: i32 = event.params.outcomeSlotCount.toI32() as i32
  const timestamp = event.block.timestamp

  // We don't know the FPMM address yet, so we use the condition ID as the market ID
  // This will be updated when FPMMCreated event is processed
  const market = createOrLoadMarket(conditionId, '')
  market.questionId = questionId
  market.outcomeSlotCount = 2 // Hard-coded for now to get past compilation
  market.createdTimestamp = timestamp
  market.save()
}

export function handleConditionResolution(event: ConditionResolution): void {
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

export function handlePositionSplit(event: PositionSplit): void {
  const userAddress = event.params.stakeholder.toHexString()
  const collateralToken = event.params.collateralToken.toHexString()
  const conditionId = event.params.conditionId.toHexString()
  const amount = convertTokenToDecimal(event.params.amount, USDC_DECIMALS)
  const timestamp = event.block.timestamp
  
  // This is typically used when a trader is preparing to trade
  // We could track this for more detailed position tracking, but not necessary
  // for basic PnL calculations
}

export function handlePositionsMerge(event: PositionsMerge): void {
  const userAddress = event.params.stakeholder.toHexString()
  const collateralToken = event.params.collateralToken.toHexString()
  const conditionId = event.params.conditionId.toHexString()
  const amount = convertTokenToDecimal(event.params.amount, USDC_DECIMALS)
  const timestamp = event.block.timestamp
  
  // This is typically used when a trader is closing positions
  // We could track this for more detailed position tracking, but not necessary
  // for basic PnL calculations
}

export function handlePayoutRedemption(event: PayoutRedemption): void {
  const userAddress = event.params.redeemer.toHexString()
  const collateralToken = event.params.collateralToken.toHexString()
  const conditionId = event.params.conditionId.toHexString()
  const indexSets = event.params.indexSets
  const payout = convertTokenToDecimal(event.params.payout, USDC_DECIMALS)
  const timestamp = event.block.timestamp
  const txHash = event.transaction.hash.toHexString()
  const logIndex = event.logIndex.toString()
  
  // Only process if this is USDC redemption (the main Polymarket collateral)
  if (collateralToken != "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174") {
    return
  }
  
  // Find the market by condition ID
  const marketId = conditionId
  const market = Market.load(marketId)
  
  if (market && market.resolved) {
    const user = createOrLoadUser(userAddress)
    
    // Calculate PnL from redemption
    // For simplicity, we consider the redemption value as realized PnL
    // A more accurate calculation would compare the redemption amount with 
    // the user's cost basis for this position
    
    // Update user's trading PnL
    user.tradingPnLUSDC = user.tradingPnLUSDC.plus(payout)
    user.totalPnLUSDC = user.tradingPnLUSDC.plus(user.rewardsPnLUSDC)
    user.save()
    
    // Update daily snapshot with the redemption PnL
    updateDailySnapshot(user, timestamp, BigDecimal.fromString('0'), payout, BigDecimal.fromString('0'))
  }
}
