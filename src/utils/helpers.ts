import { BigDecimal, BigInt } from '@graphprotocol/graph-ts'
// AssemblyScript types
declare type i32 = number;
import { User, Market, Outcome, Position, GlobalStat } from '../../generated/schema'
import { ZERO_BD, ZERO_BI } from './math'

export function createOrLoadUser(address: string): User {
  let user = User.load(address)
  
  if (!user) {
    user = new User(address)
    user.totalTradeVolumeUSDC = ZERO_BD
    user.totalPnLUSDC = ZERO_BD
    user.tradingPnLUSDC = ZERO_BD
    user.rewardsPnLUSDC = ZERO_BD
    user.firstTradeTimestamp = null
    user.lastTradeTimestamp = null
    user.save()
    
    // Update global stats
    const globalStat = createOrLoadGlobalStat()
    globalStat.totalUsers = globalStat.totalUsers.plus(BigInt.fromI32(1))
    globalStat.save()
  }
  
  return user as User
}

export function createOrLoadMarket(conditionId: string, fpmm: string): Market {
  // Use conditionId as the market ID
  let market = Market.load(conditionId)
  
  if (!market) {
    market = new Market(conditionId)
    market.conditionId = conditionId
    market.questionId = ''
    market.creator = ''
    market.createdTimestamp = ZERO_BI
    market.resolutionTimestamp = null
    market.resolved = false
    market.outcomeSlotCount = 0
    market.totalVolumeUSDC = ZERO_BD
    
    // Set FPMM if provided
    if (fpmm != '') {
      market.creator = fpmm
    }
    
    market.save()
  } else if (fpmm != '' && market.creator == '') {
    // Update FPMM if it wasn't set before
    market.creator = fpmm
    market.save()
  }
  
  return market as Market
}

export function createOrLoadOutcome(marketId: string, index: number): Outcome {
  const outcomeId = marketId + '-' + index.toString()
  let outcome = Outcome.load(outcomeId)
  
  if (!outcome) {
    outcome = new Outcome(outcomeId)
    outcome.market = marketId
    
    // Using direct number assignment for AssemblyScript
    // In the context of Polymarket, indices are small integers (0 or 1 typically)
    // So we can safely convert the index number to a fixed value
    const safeIndex = index < 1 ? 0 : 1;
    
    // Assign directly to outcome.index which is already of type i32
    outcome.index = safeIndex
    outcome.value = ''  // This could be filled with actual outcome names if available
    outcome.save()
  }
  
  return outcome as Outcome
}

export function createOrLoadPosition(
  marketId: string, 
  outcomeId: string, 
  conditionId: string, 
  indexSet: BigInt
): Position {
  // We construct position ID from its components
  // In reality, Polymarket uses a more complex algorithm to derive position IDs
  const positionId = conditionId + '-' + indexSet.toString()
  
  let position = Position.load(positionId)
  
  if (!position) {
    position = new Position(positionId)
    position.market = marketId
    position.outcome = outcomeId
    position.collateralToken = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'  // USDC on Polygon
    position.conditionId = conditionId
    position.indexSet = indexSet
    position.positionId = BigInt.fromString(positionId)
    position.save()
  }
  
  return position as Position
}

export function createOrLoadGlobalStat(): GlobalStat {
  let globalStat = GlobalStat.load('global')
  
  if (!globalStat) {
    globalStat = new GlobalStat('global')
    globalStat.totalUsers = ZERO_BI
    globalStat.totalMarkets = ZERO_BI
    globalStat.totalTradeVolumeUSDC = ZERO_BD
    globalStat.lastUpdateTimestamp = ZERO_BI
    globalStat.save()
  }
  
  return globalStat as GlobalStat
}
