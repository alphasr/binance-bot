# Quick Setup Guide

## 1. Prerequisites

- Node.js 16+ installed
- Binance account with Futures trading enabled
- API key with Futures trading permissions

## 2. Installation

```bash
npm install
```

## 3. Configuration

1. Copy the environment file:

```bash
cp .env.example .env
```

2. Edit `.env` with your Binance API credentials:

```env
BINANCE_API_KEY=your_actual_api_key
BINANCE_API_SECRET=your_actual_secret_key
```

## 4. Test Connection

```bash
npm run test-connection
```

## 5. Test Trading (Small Amount First!)

```bash
# Test buy order
npm run test-buy

# Test sell order
npm run test-sell

# Check positions
npm run status
```

## 6. Start Scheduled Bot

```bash
npm run dev
```

## Important Safety Notes

⚠️ **START WITH SMALL AMOUNTS** ⚠️

1. **Test Environment**: Use Binance Testnet first if available
2. **Small Amounts**: Start with $10-50 trade amounts
3. **Monitor Closely**: Watch the first few trades carefully
4. **API Permissions**: Only enable necessary permissions
5. **IP Whitelist**: Restrict API access to your IP

## Customization

### Change Trading Strategy

Edit `src/services/tradingService.ts` → `generateTradeSignal()` method

### Adjust Risk Parameters

- Modify `STOP_LOSS_POINTS` and `TAKE_PROFIT_POINTS` in `.env`
- 500 points = ~5% price movement (for BTC)

### Change Schedule

Edit `src/index.ts` → `cronExpression` variable

- Current: `'0 30 16 * * *'` (4:30 PM daily)
- Format: second minute hour day month weekday

## Troubleshooting

### Common Issues

1. **API Permission Error**: Enable Futures trading on your API key
2. **Insufficient Balance**: Ensure account has enough USDT
3. **Leverage Error**: Some symbols have maximum leverage limits
4. **Timezone Issues**: Verify timezone setting in `.env`

### Debug Mode

Use VS Code debugger or add more logging in the code.

### Logs

All activity is logged with timestamps. Monitor console output.
