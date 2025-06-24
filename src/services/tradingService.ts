import { BinanceFuturesService } from './binanceService';
import { config } from '../config/config';
import { TradeSignal } from '../types/trading';
import { Logger } from '../utils/logger';
import { telegramService } from './telegramService';

export class TradingService {
  private binanceService: BinanceFuturesService;

  constructor(binanceService: BinanceFuturesService) {
    this.binanceService = binanceService;
  }

  async executeTradeSignal(signal: TradeSignal): Promise<void> {
    try {
      Logger.info(`Executing trade signal:`, signal);

      // Close any existing positions first
      await this.binanceService.closeAllPositions(signal.symbol);

      // Cancel any existing orders
      await this.binanceService.cancelAllOrders(signal.symbol);

      // Wait a moment for orders to be cancelled
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Get current price
      const currentPrice = await this.binanceService.getCurrentPrice(
        signal.symbol
      );
      Logger.info(`Current price for ${signal.symbol}: ${currentPrice}`);

      // Calculate quantity based on trade amount and leverage
      const notionalValue = config.tradeAmount * config.leverage;
      const quantityNum = notionalValue / currentPrice;
      const quantity = quantityNum.toFixed(3);

      Logger.info(
        `Calculated quantity: ${quantity} (Notional: $${notionalValue})`
      );

      // Place market order
      const marketOrder = await this.binanceService.placeMarketOrder({
        symbol: signal.symbol,
        side: signal.action,
        type: 'MARKET',
        quantity: quantity,
      });

      Logger.info(`Market order executed:`, marketOrder);

      // Calculate stop loss and take profit prices
      const stopLossPrice = this.binanceService.calculateStopLossPrice(
        currentPrice,
        signal.action,
        config.stopLossPoints
      );

      const takeProfitPrice = this.binanceService.calculateTakeProfitPrice(
        currentPrice,
        signal.action,
        config.takeProfitPoints
      );

      Logger.info(`Stop Loss Price: ${stopLossPrice.toFixed(2)}`);
      Logger.info(`Take Profit Price: ${takeProfitPrice.toFixed(2)}`);

      // Place stop loss order (opposite side)
      const stopLossSide = signal.action === 'BUY' ? 'SELL' : 'BUY';
      await this.binanceService.placeStopLossOrder(
        signal.symbol,
        stopLossSide,
        quantity,
        stopLossPrice.toFixed(2)
      );

      // Place take profit order (opposite side)
      const takeProfitSide = signal.action === 'BUY' ? 'SELL' : 'BUY';
      await this.binanceService.placeTakeProfitOrder(
        signal.symbol,
        takeProfitSide,
        quantity,
        takeProfitPrice.toFixed(2)
      );

      Logger.info(
        `Trade executed successfully with stop loss and take profit orders`
      );

      // Send Telegram notification for successful trade
      await telegramService.sendTradeAlert(
        signal.action,
        signal.symbol,
        currentPrice,
        quantityNum
      );
    } catch (error) {
      Logger.error('Failed to execute trade signal:', error);

      // Send Telegram error alert
      await telegramService.sendErrorAlert(
        error instanceof Error ? error.message : 'Unknown error',
        'Trade execution failed'
      );

      throw error;
    }
  }

  async getAccountInfo(): Promise<void> {
    try {
      const positions = await this.binanceService.getPositions();
      if (positions.length > 0) {
        Logger.info('Current positions:', positions);
      } else {
        Logger.info('No open positions');
      }
    } catch (error) {
      Logger.error('Failed to get account info:', error);
    }
  }

  // Simple trading strategy - you can customize this
  generateTradeSignal(): TradeSignal {
    // For demonstration, this alternates between BUY and SELL
    // In a real scenario, you would implement your trading logic here
    const actions: ('BUY' | 'SELL')[] = ['BUY', 'SELL'];
    const randomAction = actions[Math.floor(Math.random() * actions.length)];

    return {
      action: randomAction,
      symbol: config.symbol,
      timestamp: new Date(),
    };
  }

  // Method to execute manual trade for testing
  async executeManualTrade(action: 'BUY' | 'SELL'): Promise<void> {
    const signal: TradeSignal = {
      action,
      symbol: config.symbol,
      timestamp: new Date(),
    };

    await this.executeTradeSignal(signal);
  }
}
