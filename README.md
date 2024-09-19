# W3Pay Backend

## Overview
W3Pay Backend is a Node.js application that serves as an intermediary layer between the blockchain and API consumers (Management Panel and Sale Widget). It refines on-chain data and provides aggregated endpoints for easier consumption.

## Key Features
- Fetches and stores on-chain data including Token Allocations (Tickets), Sale Stages, and Transactions
- Provides REST API endpoints for accessing refined and aggregated data
- Implements data synchronization with the blockchain
- Caches frequently accessed data for improved performance
- Handles webhook events for real-time updates

## Main Components
1. **Transaction Management**: Tracks and stores transaction details.
2. **Contributor Management**: Manages information about contributors.
3. **Sale Stage Management**: Handles different stages of token sales.
4. **Price Calculation Service**: Calculates token prices based on current sale stage and strategy.

## API Endpoints
- `/api/transactions`: Get transaction data
- `/api/contributors`: Access contributor information
- `/api/sale-stages`: Retrieve sale stage details
- `/api/webhook`: Handle incoming webhook events

## Technology Stack
- Node.js
- Solana Web3.js
- Anchor

## Setup and Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables in a `.env` file
4. Run the server: `npm start`


## Usage
To use the API, include the `X-API-Key` header in your requests with the value set in your environment variables.
