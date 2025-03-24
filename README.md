# Polymarket PnL Tracker

A sophisticated blockchain data analysis tool for tracking Polymarket trading performance, providing advanced Profit and Loss (PnL) calculations and insights.

## Project Overview

This project consists of two main components:

1. **Subgraph**: Indexes Polymarket blockchain data from Polygon to track trades, positions, and calculate PnL
2. **Frontend**: React application to visualize PnL data and trading performance

## Subgraph Features

- Tracks token transfers, trades, and rewards
- Calculates daily PnL for both trading and liquidity/rewards
- Stores historical data for querying a user's PnL across any timeframe
- Matches the historical PnL graph from polymarketanalytics.com

## Frontend Features

- User search by Ethereum wallet address
- PnL visualization with interactive time-range filtering
- Breakdown of trading vs. rewards PnL
- Responsive design using Tailwind CSS

## Technology Stack

- TheGraph Subgraph
- TypeScript/AssemblyScript
- GraphQL
- React
- Tailwind CSS
- Recharts for data visualization

## Getting Started

### Subgraph Development

```bash
# Generate types from subgraph schema
npm run codegen

# Build the subgraph
npm run build

# Deploy the subgraph (replace with your deployment details)
npm run deploy
```

### Frontend Development

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Project Structure

```
├── src/                  # Subgraph source code
│   ├── mappings/         # Event handlers for blockchain events
│   └── utils/            # Utility functions for PnL calculations
├── schema.graphql        # Subgraph schema definition
├── subgraph.yaml         # Subgraph configuration
├── frontend/             # React frontend application
│   ├── src/              # Frontend source code
│   │   ├── components/   # React components
│   │   ├── hooks/        # Custom React hooks
│   │   └── utils/        # Utility functions
│   └── public/           # Static assets
```

## License

MIT