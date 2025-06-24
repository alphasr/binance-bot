# Advanced Binance Futures Trading Bot

## 🧠 **Algorithm Overview**

This bot implements a sophisticated technical analysis strategy using:

### **Technical Indicators:**

- **EMA 7, 100, 200**: Exponential Moving Averages for trend analysis
- **RSI(14)**: Relative Strength Index for momentum analysis

### **Entry Conditions:**

#### **LONG Position:**

- Price > EMA7 > EMA100 > EMA200 (bullish alignment)
- RSI between 30-50 (oversold recovery)
- Price within 0.3% of EMA7 (precise entry)

#### **SHORT Position:**

- Price < EMA7 < EMA100 < EMA200 (bearish alignment)
- RSI between 50-70 (overbought reversal)
- Price within 0.3% of EMA7 (precise entry)

### **Risk Management:**

- **Base Leverage**: 5x for normal conditions
- **High Leverage**: 10x for extreme RSI conditions (RSI < 35 for LONG, RSI > 65 for SHORT)
- **Take Profit**: +500 points
- **Stop Loss**: -500 points

### **Execution Schedule:**

- **4:00 PM Prague**: Prepare and fetch market data
- **4:33 PM Prague**: Execute trading strategy
- **Continuous**: Monitor positions and manage exits

## 🚀 **Quick Start**

### **1. Setup** (if not already done)

```bash
npm install
cp .env.example .env
# Edit .env with your Binance API credentials
```

### **2. Test Connection**

```bash
npm run test-connection
```

### **3. Run Advanced Bot**

```bash
# Start advanced bot with technical analysis
npm run advanced
```

### **4. Test Trading**

```bash
# Test LONG position
npm run test-long

# Test SHORT position
npm run test-short

# Check account status
npm run advanced-status
```

## 📊 **Bot Comparison**

| Feature         | Basic Bot     | Advanced Bot                    |
| --------------- | ------------- | ------------------------------- |
| Strategy        | Random/Manual | EMA + RSI Technical Analysis    |
| Execution       | 4:30 PM       | 4:33 PM (after data prep)       |
| Leverage        | Fixed 10x     | Dynamic 5x-10x based on RSI     |
| Entry Logic     | Simple        | Multi-condition technical setup |
| Position Sizing | Fixed amount  | Based on account balance        |
| Monitoring      | Basic         | Advanced with PnL tracking      |

## 🎯 **Strategy Details**

### **Data Collection (4:00 PM)**

- Fetches last 200 x 30-minute candles
- Calculates EMA 7, 100, 200 periods
- Calculates RSI 14 periods

### **Signal Generation (4:33 PM)**

- Analyzes current market conditions
- Checks EMA alignment and trend direction
- Validates RSI momentum conditions
- Ensures price proximity to EMA7 for optimal entry

### **Position Management**

- Calculates position size as percentage of account balance
- Sets leverage based on signal strength (RSI extremes)
- Places market order with immediate TP/SL setup
- Monitors position until automatic closure

### **Risk Controls**

- Maximum 0.3% distance from EMA7 for entry
- Automatic position closure on TP/SL hit
- Account balance compounding for next trades
- Error handling and position monitoring

## ⚡ **Advanced Features**

### **Dynamic Leverage**

```
RSI < 35 (LONG): 10x leverage (extreme oversold)
RSI 35-50 (LONG): 5x leverage (normal oversold)
RSI 50-65 (SHORT): 5x leverage (normal overbought)
RSI > 65 (SHORT): 10x leverage (extreme overbought)
```

### **Precision Entry**

- Only enters when price is within 0.3% of EMA7
- Ensures optimal risk/reward ratio
- Reduces false signals and slippage

### **Confidence Scoring**

- Calculates signal confidence based on:
  - EMA spread strength
  - RSI positioning
  - Price proximity to EMA7
- Higher confidence = better trade quality

## 🔧 **Configuration**

Edit `.env` to customize:

```env
# Use lower leverage for conservative trading
LEVERAGE=5

# Adjust trade amount based on account size
TRADE_AMOUNT_USDT=100

# Modify TP/SL points (current: ±$500)
TAKE_PROFIT_POINTS=500
STOP_LOSS_POINTS=500
```

## 📈 **Monitoring**

The bot provides detailed logging:

- 📊 Technical indicator values
- 🎯 Signal generation with confidence
- 💰 Position details and PnL tracking
- ⏰ Scheduled execution confirmations
- 🔄 Automatic position management

## ⚠️ **Important Notes**

1. **Backtest First**: This strategy should be backtested before live use
2. **Start Small**: Use small position sizes initially
3. **Market Conditions**: Works best in trending markets
4. **Risk Management**: Never risk more than you can afford to lose
5. **API Limits**: Ensure your API key has futures trading permissions

## 🎛️ **Available Commands**

```bash
# Advanced bot commands
npm run advanced           # Start advanced bot
npm run test-long         # Test LONG position
npm run test-short        # Test SHORT position
npm run advanced-status   # Check advanced bot status

# Basic bot commands (still available)
npm run dev               # Start basic bot
npm run test-buy          # Test basic buy
npm run test-sell         # Test basic sell
npm run status            # Check basic bot status
```

Choose the advanced bot for sophisticated technical analysis or the basic bot for simpler trading logic.
