// Mock data for testing
export const mockPriceData = {
  BTCUSDT: 42000.5,
  ETHUSDT: 3200.75,
  BNBUSDT: 450.25,
};

export const mockOrderResponse = {
  orderId: 123456789,
  symbol: 'BTCUSDT',
  status: 'FILLED',
  executedQty: '0.024',
  cummulativeQuoteQty: '1000.00',
  type: 'MARKET',
  side: 'BUY',
  fills: [
    {
      price: '42000.50',
      qty: '0.024',
      commission: '0.00001',
      commissionAsset: 'BNB',
    },
  ],
  workingTime: Date.now(),
  selfTradePreventionMode: 'NONE',
};

export const mockPositionData = [
  {
    symbol: 'BTCUSDT',
    positionAmt: '0.024',
    entryPrice: '42000.50',
    breakEvenPrice: '42005.00',
    markPrice: '42010.25',
    unRealizedProfit: '0.234',
    liquidationPrice: '38000.00',
    leverage: '10',
    maxNotionalValue: '1000000',
    marginType: 'isolated',
    isolatedMargin: '100.50',
    isAutoAddMargin: 'false',
    positionSide: 'BOTH',
    notional: '1008.246',
    isolatedWallet: '100.50',
    updateTime: Date.now(),
  },
];

export const mockAccountInfo = {
  feeTier: 0,
  canTrade: true,
  canDeposit: true,
  canWithdraw: true,
  updateTime: Date.now(),
  totalInitialMargin: '0.00000000',
  totalMaintMargin: '0.00000000',
  totalWalletBalance: '1000.00000000',
  totalUnrealizedProfit: '0.00000000',
  totalMarginBalance: '1000.00000000',
  totalPositionInitialMargin: '0.00000000',
  totalOpenOrderInitialMargin: '0.00000000',
  totalCrossWalletBalance: '1000.00000000',
  totalCrossUnrealizedProfit: '0.00000000',
  availableBalance: '1000.00000000',
  maxWithdrawAmount: '1000.00000000',
  assets: [
    {
      asset: 'USDT',
      walletBalance: '1000.00000000',
      unrealizedProfit: '0.00000000',
      marginBalance: '1000.00000000',
      maintMargin: '0.00000000',
      initialMargin: '0.00000000',
      positionInitialMargin: '0.00000000',
      openOrderInitialMargin: '0.00000000',
      crossWalletBalance: '1000.00000000',
      crossUnrealizedProfit: '0.00000000',
      availableBalance: '1000.00000000',
      maxWithdrawAmount: '1000.00000000',
      marginAvailable: true,
      updateTime: Date.now(),
    },
  ],
  positions: mockPositionData,
};

export const mockCandlestickData = [
  [
    1640995200000, // Open time
    '41000.00', // Open
    '42500.00', // High
    '40800.00', // Low
    '42000.50', // Close
    '150.25', // Volume
    1640998799999, // Close time
    '6300000.00', // Quote volume
    1250, // Number of trades
    '75.12', // Taker buy base volume
    '3150000.00', // Taker buy quote volume
    '0', // Ignore
  ],
  [
    1640998800000,
    '42000.50',
    '42800.00',
    '41900.00',
    '42400.25',
    '165.50',
    1641002399999,
    '7020000.00',
    1350,
    '82.75',
    '3510000.00',
    '0',
  ],
];

export const mockTelegramResponse = {
  ok: true,
  result: {
    message_id: 123,
    from: {
      id: 7402692584,
      is_bot: true,
      first_name: 'Trading Bot',
      username: 'binance_trading_bot',
    },
    chat: {
      id: -1002813873290,
      title: 'Trading Group',
      type: 'supergroup',
    },
    date: Math.floor(Date.now() / 1000),
    text: 'Test message',
  },
};

export const mockTechnicalIndicators = {
  rsi: 65.5,
  macd: {
    MACD: 25.5,
    signal: 20.2,
    histogram: 5.3,
  },
  sma20: 41800.25,
  sma50: 41500.75,
  ema20: 41850.5,
  bollinger: {
    upper: 42500.0,
    middle: 42000.0,
    lower: 41500.0,
  },
};
