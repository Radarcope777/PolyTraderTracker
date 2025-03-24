# Polymarket PnL Calculation Analysis (Dune SQL)

## Overview of Calculation Components

The Dune SQL query calculates PnL for Polymarket traders with two main components:

1. **Trading PnL**: Tracks position value changes through token transfers and current market prices
2. **Liquidity/Rewards PnL**: Tracks rewards from liquidity mining and referrals

## Key Steps in the Calculation

### Data Collection
1. Markets data from `TokenRegistered` events and metadata
2. Token transfers from ERC1155 and ERC20 (USDC) events 
3. Price data from order fills on CLOB (Central Limit Order Book)
4. Rewards data from airdrop and distributor events

### Trading PnL Calculation
1. Track all token movements (sends/receives) for each user
2. Get the latest price for outcome tokens
3. Calculate:
   - Net USDC position (direct USDC in/out)
   - Current value of outcome tokens (tokenAmount * currentPrice)
   - Total PnL (net USDC + token value)

### Rewards PnL Calculation
1. Track UMA token rewards (converted to USD)
2. Track USDC rewards
3. Sum all rewards as liquidity PnL

### Total PnL
- **Total PnL** = Trading PnL + Liquidity/Rewards PnL

## Key Entities We Need to Track in Subgraph

1. **Users**: Address and aggregate statistics
2. **Markets**: IDs, condition IDs, metadata
3. **Positions**: User positions in each market
4. **Trades**: Individual trade actions
5. **Transfers**: USDC movements
6. **Rewards**: Reward distributions
7. **Daily Snapshots**: Historical daily records for querying

## Implementation Considerations

1. We need to maintain a running sum of positions for each user
2. We need to track daily snapshots to enable historical querying
3. We should separate trading and rewards PnL as distinct metrics
4. For position value calculation, we need updated prices, which might require:
   - External price oracle integration, or
   - Calculating implied prices from on-chain trades

## Key Challenges

1. Accurately tracking position changes across multiple transaction types
2. Correctly handling price updates for accurate PnL calculation
3. Efficiently maintaining historical snapshots for querying
4. Matching the calculation methodology used by polymarketanalytics.com

This analysis will guide our subgraph implementation to ensure we properly track and calculate PnL consistent with the Dune approach.