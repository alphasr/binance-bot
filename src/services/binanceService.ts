import { USDMClient } from 'binance';
import { binanceConfig, config } from '../config/config';
import { OrderParams, PositionInfo } from '../types/trading';
import { Logger } from '../utils/logger';

export class BinanceFuturesService {
  private client: USDMClient;

  constructor() {
    this.client = new USDMClient({
      api_key: binanceConfig.apiKey,
      api_secret: binanceConfig.apiSecret,
    });
  }

  async initialize(): Promise<void> {
    try {
      // Test connectivity
      await this.client.testConnectivity();
      Logger.info('Connected to Binance Futures API');

      // Set leverage
      await this.setLeverage(config.symbol, config.leverage);
      Logger.info(`Leverage set to ${config.leverage}x for ${config.symbol}`);

      // Set margin type to isolated (optional - you can change to cross margin if preferred)
      try {
        await this.setMarginType(config.symbol, 'ISOLATED');
        Logger.info(`Margin type set to ISOLATED for ${config.symbol}`);
      } catch (error: any) {
        // Margin type might already be set, log but don't fail
        Logger.warn(
          'Could not set margin type (might already be set):',
          error.message
        );
      }
    } catch (error) {
      Logger.error('Failed to initialize Binance Futures Service:', error);
      throw error;
    }
  }

  async setLeverage(symbol: string, leverage: number): Promise<void> {
    try {
      const result = await this.client.setLeverage({ symbol, leverage });
      Logger.info(`Leverage changed for ${symbol}:`, result);
    } catch (error) {
      Logger.error(`Failed to set leverage for ${symbol}:`, error);
      throw error;
    }
  }

  async setMarginType(
    symbol: string,
    marginType: 'ISOLATED' | 'CROSSED'
  ): Promise<void> {
    try {
      const result = await this.client.setMarginType({ symbol, marginType });
      Logger.info(`Margin type changed for ${symbol}:`, result);
    } catch (error) {
      Logger.error(`Failed to set margin type for ${symbol}:`, error);
      throw error;
    }
  }

  async getCurrentPrice(symbol: string): Promise<number> {
    try {
      const ticker = await this.client.getSymbolPriceTicker({ symbol });
      return parseFloat(ticker.price.toString());
    } catch (error) {
      Logger.error(`Failed to get current price for ${symbol}:`, error);
      throw error;
    }
  }

  async getPositions(): Promise<PositionInfo[]> {
    try {
      const positions = await this.client.getPositions();
      return positions
        .filter((pos: any) => parseFloat(pos.positionAmt) !== 0)
        .map((pos: any) => ({
          symbol: pos.symbol,
          positionAmt: pos.positionAmt,
          entryPrice: pos.entryPrice,
          markPrice: pos.markPrice,
          unRealizedProfit: pos.unRealizedProfit,
          positionSide: pos.positionSide,
        }));
    } catch (error) {
      Logger.error('Failed to get positions:', error);
      throw error;
    }
  }

  async closeAllPositions(symbol: string): Promise<void> {
    try {
      const positions = await this.getPositions();
      const symbolPositions = positions.filter((pos) => pos.symbol === symbol);

      for (const position of symbolPositions) {
        if (parseFloat(position.positionAmt) !== 0) {
          const side = parseFloat(position.positionAmt) > 0 ? 'SELL' : 'BUY';

          await this.client.submitNewOrder({
            symbol: symbol,
            side: side,
            type: 'MARKET',
            quantity: Math.abs(parseFloat(position.positionAmt)),
            reduceOnly: 'true',
          });

          Logger.info(`Closed position for ${symbol}: ${position.positionAmt}`);
        }
      }
    } catch (error) {
      Logger.error(`Failed to close positions for ${symbol}:`, error);
      throw error;
    }
  }

  async placeMarketOrder(params: OrderParams): Promise<any> {
    try {
      const orderParams: any = {
        symbol: params.symbol,
        side: params.side,
        type: params.type,
      };

      if (params.quantity) {
        orderParams.quantity = parseFloat(params.quantity);
      } else if (params.quoteOrderQty) {
        orderParams.quoteOrderQty = params.quoteOrderQty;
      }

      if (params.reduceOnly !== undefined) {
        orderParams.reduceOnly = params.reduceOnly ? 'true' : 'false';
      }

      const result = await this.client.submitNewOrder(orderParams);
      Logger.info(`Market order placed:`, result);
      return result;
    } catch (error) {
      Logger.error('Failed to place market order:', error);
      throw error;
    }
  }

  async placeStopLossOrder(
    symbol: string,
    side: 'BUY' | 'SELL',
    quantity: string,
    stopPrice: string
  ): Promise<any> {
    try {
      const result = await this.client.submitNewOrder({
        symbol: symbol,
        side: side,
        type: 'STOP_MARKET',
        quantity: parseFloat(quantity),
        stopPrice: parseFloat(stopPrice),
        reduceOnly: 'true',
      });
      Logger.info(`Stop loss order placed:`, result);
      return result;
    } catch (error) {
      Logger.error('Failed to place stop loss order:', error);
      throw error;
    }
  }

  async placeTakeProfitOrder(
    symbol: string,
    side: 'BUY' | 'SELL',
    quantity: string,
    stopPrice: string
  ): Promise<any> {
    try {
      const result = await this.client.submitNewOrder({
        symbol: symbol,
        side: side,
        type: 'TAKE_PROFIT_MARKET',
        quantity: parseFloat(quantity),
        stopPrice: parseFloat(stopPrice),
        reduceOnly: 'true',
      });
      Logger.info(`Take profit order placed:`, result);
      return result;
    } catch (error) {
      Logger.error('Failed to place take profit order:', error);
      throw error;
    }
  }

  async cancelAllOrders(symbol: string): Promise<void> {
    try {
      // Get all open orders for the symbol
      const openOrders = await this.client.getAllOrders({ symbol });
      const activeOrders = openOrders.filter(
        (order: any) =>
          order.status === 'NEW' || order.status === 'PARTIALLY_FILLED'
      );

      // Cancel each order individually
      for (const order of activeOrders) {
        try {
          await this.client.cancelOrder({ symbol, orderId: order.orderId });
        } catch (error) {
          Logger.warn(`Failed to cancel order ${order.orderId}:`, error);
        }
      }

      Logger.info(`Cancelled ${activeOrders.length} orders for ${symbol}`);
    } catch (error) {
      Logger.error(`Failed to cancel orders for ${symbol}:`, error);
      throw error;
    }
  }

  async getKlines(
    symbol: string,
    interval: string,
    options: any = {}
  ): Promise<any[]> {
    try {
      const result = await this.client.getKlines({
        symbol,
        interval,
        ...options,
      });
      Logger.info(`Fetched ${result.length} klines for ${symbol}`);
      return result;
    } catch (error) {
      Logger.error(`Failed to get klines for ${symbol}:`, error);
      throw error;
    }
  }

  calculateStopLossPrice(
    entryPrice: number,
    side: 'BUY' | 'SELL',
    points: number
  ): number {
    const pointValue = entryPrice * 0.0001; // Assuming 1 point = 0.01% of price

    if (side === 'BUY') {
      return entryPrice - points * pointValue;
    } else {
      return entryPrice + points * pointValue;
    }
  }

  calculateTakeProfitPrice(
    entryPrice: number,
    side: 'BUY' | 'SELL',
    points: number
  ): number {
    const pointValue = entryPrice * 0.0001; // Assuming 1 point = 0.01% of price

    if (side === 'BUY') {
      return entryPrice + points * pointValue;
    } else {
      return entryPrice - points * pointValue;
    }
  }
}
