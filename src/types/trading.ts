export interface TradingConfig {
  symbol: string;
  leverage: number;
  tradeAmount: number;
  stopLossPoints: number;
  takeProfitPoints: number;
  timezone: string;
}

export interface OrderParams {
  symbol: string;
  side: 'BUY' | 'SELL';
  type: 'MARKET' | 'LIMIT' | 'STOP_MARKET' | 'TAKE_PROFIT_MARKET';
  quantity?: string;
  quoteOrderQty?: string;
  price?: string;
  stopPrice?: string;
  timeInForce?: 'GTC' | 'IOC' | 'FOK';
  closePosition?: boolean;
  workingType?: 'MARK_PRICE' | 'CONTRACT_PRICE';
  reduceOnly?: boolean;
}

export interface PositionInfo {
  symbol: string;
  positionAmt: string;
  entryPrice: string;
  markPrice: string;
  unRealizedProfit: string;
  positionSide: 'BOTH' | 'LONG' | 'SHORT';
}

export interface TradeSignal {
  action: 'BUY' | 'SELL';
  symbol: string;
  timestamp?: Date;
  reason?: string;
  confidence?: number;
}
