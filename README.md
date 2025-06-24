# 🚀 Advanced Binance Futures Trading Bot

## ✨ **Features**

### **🎯 Two Trading Strategies**

#### **1. Basic Bot (`npm run dev`)**

- Simple trading logic with manual signals
- Fixed 10x leverage
- Scheduled execution at 4:30 PM Prague time
- Basic stop loss and take profit

#### **2. Advanced Bot (`npm run advanced`)** ⭐

- **Technical Analysis**: EMA 7/100/200 + RSI(14)
- **Smart Entry Conditions**: Precise market timing
- **Dynamic Leverage**: 5x-10x based on signal strength
- **Execution**: 4:33 PM Prague time with pre-analysis
- **Risk Management**: Advanced position sizing

## 🧠 **Advanced Algorithm**

### **Technical Indicators**

- **EMA 7, 100, 200**: Multi-timeframe trend analysis
- **RSI(14)**: Momentum and overbought/oversold conditions
- **30-minute candles**: Optimal timeframe for swing trading

### **Entry Conditions**

#### **🟢 LONG Position**

- Price > EMA7 > EMA100 > EMA200 (bullish trend)
- RSI between 30-50 (oversold recovery)
- Price within 0.3% of EMA7 (precision entry)

#### **🔴 SHORT Position**

- Price < EMA7 < EMA100 < EMA200 (bearish trend)
- RSI between 50-70 (overbought reversal)
- Price within 0.3% of EMA7 (precision entry)

### **🎚️ Dynamic Leverage**

- **5x leverage**: Normal market conditions
- **10x leverage**: Extreme RSI conditions (RSI < 35 for LONG, RSI > 65 for SHORT)

## ⚡ **Quick Start**

### **1. Installation**

```bash
npm install
```

### **2. Configuration**

```bash
cp .env.example .env
# Edit .env with your Binance API credentials
```

### **3. API Setup**

1. Create Binance Futures account
2. Generate API key with futures trading permissions
3. Add IP whitelist for security
4. Update `.env` file:

```env
BINANCE_API_KEY=your_actual_api_key
BINANCE_API_SECRET=your_actual_secret_key
LEVERAGE=10
TRADE_AMOUNT_USDT=100
```

### **4. Test Connection**

```bash
npm run test-connection
```

### **5. Choose Your Bot**

#### **Advanced Bot (Recommended)**

```bash
# Start advanced technical analysis bot
npm run advanced

# Test advanced strategies
npm run test-long      # Test LONG position
npm run test-short     # Test SHORT position
npm run advanced-status # Check status
```

#### **Basic Bot**

```bash
# Start basic bot
npm run dev

# Test basic trades
npm run test-buy       # Test buy order
npm run test-sell      # Test sell order
npm run status         # Check status
```

## 📊 **Configuration Options**

### **Trading Parameters**

```env
SYMBOL=BTCUSDT                    # Trading pair
LEVERAGE=10                       # Base leverage (5-10 recommended)
TRADE_AMOUNT_USDT=100            # Trade size in USDT
STOP_LOSS_POINTS=500             # Stop loss in points (~$500)
TAKE_PROFIT_POINTS=500           # Take profit in points (~$500)
TIMEZONE=Europe/Prague           # Execution timezone
```

### **Risk Management**

- **Position Sizing**: Based on account balance percentage
- **Stop Loss**: Automatic at -500 points
- **Take Profit**: Automatic at +500 points
- **Account Compounding**: Reinvests profits for next trades

## 🕐 **Execution Schedule**

### **Advanced Bot Timeline**

- **4:00 PM Prague**: Data collection and indicator calculation
- **4:33 PM Prague**: Strategy execution and trade placement
- **Continuous**: Position monitoring and automatic exits

### **Basic Bot Timeline**

- **4:30 PM Prague**: Simple trade execution

## 📈 **Technical Analysis Details**

### **EMA Trend Analysis**

- **Short-term**: EMA 7 (price action)
- **Medium-term**: EMA 100 (trend direction)
- **Long-term**: EMA 200 (major trend)

### **RSI Momentum**

- **< 30**: Oversold (potential LONG)
- **30-50**: LONG entry zone
- **50-70**: SHORT entry zone
- **> 70**: Overbought (potential SHORT)

### **Entry Precision**

- Price must be within 0.3% of EMA7
- Ensures optimal risk/reward ratio
- Reduces false signals and slippage

## 🛡️ **Safety Features**

### **Built-in Protection**

- ✅ Automatic position closure on TP/SL
- ✅ Order cancellation before new trades
- ✅ Error handling and recovery
- ✅ Detailed logging and monitoring
- ✅ Account balance tracking

### **Risk Controls**

- ✅ Maximum leverage limits
- ✅ Position size validation
- ✅ API error handling
- ✅ Network disconnection recovery

## 📱 **Monitoring & Logging**

The bot provides comprehensive logging:

- 📊 Technical indicator values
- 🎯 Signal generation with confidence scores
- 💰 Position entry/exit details
- 📈 Real-time PnL tracking
- ⏰ Scheduled execution confirmations
- 🔄 Automatic position management

## ⚠️ **Important Warnings**

### **Before Going Live**

1. **Test Thoroughly**: Use small amounts initially
2. **Understand Risks**: Never invest more than you can afford to lose
3. **Market Conditions**: Bot works best in trending markets
4. **API Security**: Use IP whitelisting and proper API permissions
5. **Monitoring**: Watch the first few trades closely

### **Recommended Setup**

1. Start with $50-100 trade amounts
2. Use 5x leverage initially
3. Monitor bot performance for 1-2 weeks
4. Gradually increase position sizes if profitable
5. Always have stop losses enabled

## 🔧 **Troubleshooting**

### **Common Issues**

- **API Key Error**: Check credentials in `.env` file
- **Insufficient Balance**: Ensure enough USDT in futures account
- **Leverage Error**: Some symbols have maximum leverage limits
- **Permission Error**: Enable futures trading on API key

### **Support**

- Check logs for detailed error messages
- Verify API key permissions
- Ensure sufficient account balance
- Test with smaller amounts first

## 🎯 **Performance Tips**

1. **Optimal Conditions**: Works best in trending markets
2. **Time Zones**: Prague time execution aligns with European session
3. **Position Sizing**: Use percentage of account balance
4. **Leverage**: Start conservative, increase with experience
5. **Monitoring**: Review performance weekly

---

**Ready to start? Run `npm run advanced` for the sophisticated technical analysis bot, or `npm run dev` for the basic version!**

**Remember: Always start with small amounts and understand the risks involved in futures trading.**
