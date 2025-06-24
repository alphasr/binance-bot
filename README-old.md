# Binance Futures Trading Bot

A TypeScript-based automated trading bot for Binance Futures that executes trades at 4:30 PM Prague time with configurable stop loss and take profit orders.

## Features

- **Scheduled Trading**: Automatically executes trades at 4:30 PM Prague time daily
- **Futures Trading**: Supports BTCUSDT perpetual contracts with customizable leverage (default: 30x)
- **Risk Management**: Automatic stop loss and take profit orders (500 points each by default)
- **Position Management**: Automatically closes existing positions before opening new ones
- **Order Management**: Cancels existing orders before placing new ones
- **Configurable**: All trading parameters can be configured via environment variables

## Configuration

1. Copy the `.env` file and add your Binance API credentials:

```env
# Binance API credentials (REQUIRED)
BINANCE_API_KEY=your_api_key_here
BINANCE_API_SECRET=your_api_secret_here

# Trading configuration
SYMBOL=BTCUSDT
LEVERAGE=30
TRADE_AMOUNT_USDT=100
STOP_LOSS_POINTS=500
TAKE_PROFIT_POINTS=500

# Timezone
TIMEZONE=Europe/Prague
```

## Binance API Setup

1. Log in to your Binance account
2. Go to API Management
3. Create a new API key with the following permissions:
   - Enable Futures
   - Enable Trading
4. Whitelist your IP address for security
5. Copy the API key and secret to your `.env` file

**Important Security Notes:**

- Never share your API credentials
- Use IP whitelisting
- Start with small amounts for testing
- Consider using a testnet for initial testing

## Installation

```bash
# Install dependencies
npm install

# Build the project
npm run build
```

## Usage

### Start the Scheduled Bot

```bash
# Run in development mode
npm run dev

# Or build and run in production
npm run build
npm start
```

### Manual Testing Commands

```bash
# Test a BUY order
npm run test-buy

# Test a SELL order
npm run test-sell

# Check account status and positions
npm run status
```

### Command Line Options

- `--test-buy`: Execute a manual BUY trade
- `--test-sell`: Execute a manual SELL trade
- `--status`: Display current account status and positions

## How It Works

1. **Initialization**: The bot connects to Binance Futures API and sets leverage
2. **Scheduling**: Uses node-cron to schedule trades at 4:30 PM Prague time
3. **Trade Execution**:
   - Closes any existing positions for the symbol
   - Cancels any pending orders
   - Places a market order based on the trade signal
   - Immediately places stop loss and take profit orders
4. **Risk Management**: Automatically calculates stop loss and take profit prices based on configured points

## Risk Calculation

- **Point Value**: 1 point = 0.01% of the entry price
- **Stop Loss**: Entry price ± (500 points × 0.01% × entry price)
- **Take Profit**: Entry price ± (500 points × 0.01% × entry price)

For example, if BTC is at $50,000:

- 1 point = $5 (0.01% of $50,000)
- 500 points = $2,500 (5% move)

## Trading Strategy

The current implementation includes a simple random signal generator for demonstration. In a real trading scenario, you should:

1. Replace the `generateTradeSignal()` method in `TradingService` with your actual trading logic
2. Implement technical analysis, market data processing, or external signal integration
3. Add additional risk management rules

## File Structure

```
src/
├── config/
│   └── config.ts          # Configuration management
├── services/
│   ├── binanceService.ts  # Binance API interaction
│   └── tradingService.ts  # Trading logic and execution
├── types/
│   └── trading.ts         # TypeScript type definitions
├── utils/
│   └── logger.ts          # Logging utilities
└── index.ts               # Main application entry point
```

## Safety Features

- **Position Closure**: Automatically closes existing positions before opening new ones
- **Order Cancellation**: Cancels pending orders to avoid conflicts
- **Error Handling**: Comprehensive error handling and logging
- **Graceful Shutdown**: Handles SIGINT and SIGTERM signals properly

## Monitoring

The bot includes detailed logging for:

- Connection status
- Trade executions
- Order placements
- Error conditions
- Account status

## Disclaimer

**WARNING**: This bot trades with real money on live markets. Cryptocurrency trading involves significant risk of loss.

- Start with small amounts
- Test thoroughly on paper/testnet first
- Understand the risks involved
- Never risk more than you can afford to lose
- This software is provided "as is" without warranty

## Support

For issues or questions:

1. Check the logs for error messages
2. Verify your API credentials and permissions
3. Ensure sufficient account balance
4. Check Binance API status

## License

ISC License
