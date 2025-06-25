# Test Suite Documentation

## Overview

This comprehensive test suite ensures the reliability and correctness of the Binance Trading Bot. All tests use mocks to avoid real API calls and prevent actual trading during testing.

## Test Structure

```
tests/
├── setup.ts                    # Global test configuration
├── mocks/                      # Mock services and data
│   ├── mockData.ts             # Sample data for testing
│   ├── MockBinanceService.ts   # Mock Binance API service
│   └── MockTelegramService.ts  # Mock Telegram API service
├── unit/                       # Unit tests for individual components
│   ├── binanceService.test.ts  # Binance service functionality
│   ├── telegramService.test.ts # Telegram messaging
│   ├── tradingService.test.ts  # Core trading logic
│   ├── config.test.ts          # Configuration management
│   ├── logger.test.ts          # Logging utility
│   ├── technicalAnalysisService.test.ts # Technical indicators
│   └── errorHandling.test.ts   # Error scenarios and edge cases
└── integration/                # Integration tests
    ├── tradingBot.integration.test.ts # End-to-end trading flows
    └── apiIntegration.test.ts  # API interaction testing
```

## Running Tests

### All Tests

```bash
npm test
```

### Specific Test Suites

```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# Watch mode (runs tests on file changes)
npm run test:watch

# Generate coverage report
npm run test:coverage

# Verbose output
npm run test:verbose
```

### Individual Test Files

```bash
npm test tests/unit/binanceService.test.ts
npm test tests/unit/telegramService.test.ts
npm test tests/integration/tradingBot.integration.test.ts
```

## Test Categories

### 🔧 Unit Tests

#### **Binance Service Tests** (`binanceService.test.ts`)

- **Initialization**: Service setup, leverage setting, margin configuration
- **Price Data**: Current price retrieval for different symbols
- **Account Info**: Balance and position information
- **Order Management**: Market orders, limit orders, stop orders, cancellations
- **Position Management**: Position closure and management
- **Market Data**: Candlestick data retrieval
- **Mock Integrity**: Verification of mock data consistency

#### **Telegram Service Tests** (`telegramService.test.ts`)

- **Basic Messaging**: Text and structured message sending
- **Trade Alerts**: Buy/sell order notifications with proper formatting
- **Error Alerts**: Error notification handling with context
- **Startup Alerts**: Bot initialization notifications
- **Daily Reports**: Trading performance summaries
- **Connection Testing**: Bot authentication and connectivity
- **Message Management**: Message tracking and history

#### **Trading Service Tests** (`tradingService.test.ts`)

- **Signal Execution**: Buy/sell signal processing
- **Risk Management**: Stop loss and take profit calculation
- **Position Sizing**: Quantity calculation based on account balance
- **Order Flow**: Market order → Stop loss → Take profit sequence
- **Telegram Integration**: Trade notification sending
- **Error Handling**: API failure recovery

#### **Configuration Tests** (`config.test.ts`)

- **Environment Variables**: Loading and parsing configuration
- **Default Values**: Fallback configuration when env vars missing
- **Type Safety**: Proper type conversion and validation
- **Edge Cases**: Invalid values and extreme configurations

#### **Logger Tests** (`logger.test.ts`)

- **Message Formatting**: Timestamp and log level formatting
- **Multiple Arguments**: Object serialization and complex data
- **Error Handling**: Error object logging with stack traces
- **Performance**: High-frequency logging capabilities
- **Special Characters**: Unicode and escape sequence handling

#### **Technical Analysis Tests** (`technicalAnalysisService.test.ts`)

- **Indicator Calculation**: RSI, EMA, and other technical indicators
- **Signal Generation**: LONG/SHORT/NO_SIGNAL decision making
- **Confidence Scoring**: Signal strength assessment
- **Leverage Calculation**: Dynamic leverage based on confidence
- **Data Validation**: Candle data processing and error handling

#### **Error Handling Tests** (`errorHandling.test.ts`)

- **API Errors**: Insufficient balance, invalid symbols, rate limiting
- **Data Validation**: Edge cases for confidence values and symbols
- **Extreme Conditions**: Very high/low prices, large data structures
- **Resource Management**: Memory constraints and cleanup
- **Configuration Issues**: Missing or malformed environment variables

### 🔗 Integration Tests

#### **Trading Bot Integration** (`tradingBot.integration.test.ts`)

- **End-to-End Flows**: Complete trading cycles from signal to execution
- **Multi-Trade Scenarios**: Sequential and concurrent trade handling
- **Error Recovery**: System resilience and fault tolerance
- **Performance Testing**: Execution time and throughput limits
- **State Consistency**: Data integrity across operations

#### **API Integration** (`apiIntegration.test.ts`)

- **Telegram API**: Real API call simulation and response handling
- **Rate Limiting**: API throttling and retry logic
- **Network Resilience**: Timeout and connection error handling
- **Message Validation**: Content formatting and special characters
- **Concurrent Requests**: Multiple simultaneous API calls

## Mock Services

### 📊 Mock Data

- **Price Data**: Realistic cryptocurrency prices for major pairs
- **Order Responses**: Complete order execution responses
- **Position Data**: Account positions and balance information
- **Candlestick Data**: Historical price data for technical analysis
- **Telegram Responses**: API response formats and message structures

### 🔄 Mock Binance Service

- **Order Tracking**: Maintains order history and state
- **Position Updates**: Simulates position changes after trades
- **Price Simulation**: Realistic price movements
- **Error Scenarios**: Configurable failure modes for testing
- **State Management**: Persistent state across test operations

### 📱 Mock Telegram Service

- **Message Tracking**: Records all sent messages for verification
- **Failure Simulation**: Configurable error modes
- **Response Formats**: Proper API response structure
- **Content Validation**: Message format and content checking

## Test Data

### Environment Configuration

Tests use isolated environment variables in `.env.test`:

```bash
# Mock credentials (never use real keys in tests)
BINANCE_API_KEY=test_api_key
BINANCE_API_SECRET=test_api_secret
TELEGRAM_BOT_TOKEN=test_bot_token
TELEGRAM_CHAT_ID=-1001234567890

# Test trading parameters
SYMBOL=BTCUSDT
LEVERAGE=10
TRADE_AMOUNT_USDT=100
STOP_LOSS_POINTS=500
TAKE_PROFIT_POINTS=500
```

## Coverage Goals

- **Statements**: >90%
- **Branches**: >85%
- **Functions**: >95%
- **Lines**: >90%

## Best Practices

### ✅ Test Guidelines

1. **No Real API Calls**: All external dependencies are mocked
2. **No Real Trading**: Mock services prevent actual order placement
3. **Isolated Tests**: Each test can run independently
4. **Clear Naming**: Descriptive test names explain what is being tested
5. **Edge Cases**: Tests include boundary conditions and error scenarios
6. **Performance**: Tests complete quickly for fast feedback

### 🔒 Safety Measures

- **Mock Environment**: Tests use `.env.test` to prevent accidental real API usage
- **Data Isolation**: Each test starts with clean mock data
- **Error Simulation**: Controlled error injection for resilience testing
- **Resource Cleanup**: Proper cleanup after each test run

## Continuous Integration

Tests are designed to run in CI/CD environments:

- No external dependencies except Node.js
- Consistent results across different systems
- Fast execution for quick feedback
- Comprehensive coverage reporting

## Adding New Tests

When adding new features:

1. **Create Unit Tests**: Test individual components in isolation
2. **Add Integration Tests**: Test feature interaction with existing system
3. **Update Mocks**: Extend mock services for new functionality
4. **Document Edge Cases**: Include boundary conditions and error scenarios
5. **Verify Coverage**: Ensure new code is adequately tested

## Troubleshooting

### Common Issues

- **Import Errors**: Check TypeScript path resolution
- **Mock Failures**: Verify mock data structure matches real API
- **Timeout Issues**: Increase Jest timeout for slow operations
- **Coverage Gaps**: Add tests for uncovered code paths

### Debug Commands

```bash
# Run specific test with debug output
npm test -- --testNamePattern="specific test name" --verbose

# Run tests in watch mode for development
npm run test:watch

# Generate detailed coverage report
npm run test:coverage
```

This comprehensive test suite ensures the trading bot operates safely and reliably in all scenarios while preventing any risk of accidental real trading during development and testing.
