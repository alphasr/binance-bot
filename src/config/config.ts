import * as dotenv from 'dotenv';
import { TradingConfig } from '../types/trading';

dotenv.config();

export const config: TradingConfig = {
  symbol: process.env.SYMBOL || 'BTCUSDT',
  leverage: parseInt(process.env.LEVERAGE || '10'),
  tradeAmount: parseFloat(process.env.TRADE_AMOUNT_USDT || '100'),
  stopLossPoints: parseInt(process.env.STOP_LOSS_POINTS || '500'),
  takeProfitPoints: parseInt(process.env.TAKE_PROFIT_POINTS || '500'),
  timezone: process.env.TIMEZONE || 'Europe/Prague',
};

export const binanceConfig = {
  apiKey: process.env.BINANCE_API_KEY || '',
  apiSecret: process.env.BINANCE_API_SECRET || '',
  baseURL: 'https://fapi.binance.com',
};
