import { BinanceFuturesService } from './binanceService';
import {
  TechnicalAnalysisService,
  TradingSignal,
} from './technicalAnalysisService';
import { config } from '../config/config';
import { Logger } from '../utils/logger';

export interface PositionInfo {
  symbol: string;
  side: 'LONG' | 'SHORT';
  size: number;
  entryPrice: number;
  leverage: number;
  takeProfitPrice: number;
  stopLossPrice: number;
  unrealizedPnl: number;
}

export class AdvancedTradingService {
  private binanceService: BinanceFuturesService;
  private technicalService: TechnicalAnalysisService;
  private currentPosition: PositionInfo | null = null;
  private accountBalance: number = 0;

  constructor(binanceService: BinanceFuturesService) {
    this.binanceService = binanceService;
    this.technicalService = new TechnicalAnalysisService(
      binanceService['client']
    );
  }

  /**
   * Execute trading strategy based on technical analysis
   */
  async executeStrategy(): Promise<void> {
    try {
      Logger.info('🔍 Executing advanced trading strategy...');

      // Update account balance
      await this.updateAccountBalance();

      // Close any existing positions first
      await this.closeAllPositions();

      // Generate trading signal
      const signal = await this.technicalService.generateTradingSignal(
        config.symbol
      );

      if (signal.action === 'NO_SIGNAL') {
        Logger.info(
          '❌ No valid trading signal - waiting for next opportunity'
        );
        return;
      }

      Logger.info(
        `📊 Signal: ${signal.action} | Leverage: ${
          signal.leverage
        }x | Confidence: ${signal.confidence.toFixed(1)}%`
      );

      // Execute the trade
      await this.executeTrade(signal);
    } catch (error) {
      Logger.error('Error executing advanced strategy:', error);
    }
  }

  /**
   * Execute trade based on signal
   */
  private async executeTrade(signal: TradingSignal): Promise<void> {
    try {
      const { action, leverage, data } = signal;

      // Only proceed if we have a valid signal (not NO_SIGNAL)
      if (action === 'NO_SIGNAL') {
        Logger.warn('Cannot execute trade with NO_SIGNAL action');
        return;
      }

      // Set leverage
      await this.binanceService.setLeverage(config.symbol, leverage);

      // Calculate position size (use 95% of balance to leave margin)
      const availableBalance = this.accountBalance * 0.95;
      const notionalValue = availableBalance * leverage;
      const quantity = notionalValue / data.currentPrice;
      const roundedQuantity = this.roundQuantity(quantity);

      Logger.info(
        `💰 Position size: ${roundedQuantity} ${
          config.symbol
        } (Notional: $${notionalValue.toFixed(2)})`
      );

      // Place market order
      const side = action === 'LONG' ? 'BUY' : 'SELL';
      const orderResult = await this.binanceService.placeMarketOrder({
        symbol: config.symbol,
        side: side,
        type: 'MARKET',
        quantity: roundedQuantity.toString(),
      });

      Logger.info(
        `✅ Market order executed: ${action} ${roundedQuantity} at ~$${data.currentPrice}`
      );

      // Calculate TP and SL prices
      const takeProfitPrice =
        action === 'LONG'
          ? data.currentPrice + config.takeProfitPoints
          : data.currentPrice - config.takeProfitPoints;

      const stopLossPrice =
        action === 'LONG'
          ? data.currentPrice - config.stopLossPoints
          : data.currentPrice + config.stopLossPoints;

      // Set TP and SL orders
      await this.setTakeProfitStopLoss(
        action,
        roundedQuantity,
        takeProfitPrice,
        stopLossPrice
      );

      // Update position tracking
      this.currentPosition = {
        symbol: config.symbol,
        side: action,
        size: roundedQuantity,
        entryPrice: data.currentPrice,
        leverage: leverage,
        takeProfitPrice: takeProfitPrice,
        stopLossPrice: stopLossPrice,
        unrealizedPnl: 0,
      };

      Logger.info(
        `🎯 TP: $${takeProfitPrice.toFixed(2)} | SL: $${stopLossPrice.toFixed(
          2
        )}`
      );
    } catch (error) {
      Logger.error('Error executing trade:', error);
      throw error;
    }
  }

  /**
   * Set take profit and stop loss orders
   */
  private async setTakeProfitStopLoss(
    side: 'LONG' | 'SHORT',
    quantity: number,
    tpPrice: number,
    slPrice: number
  ): Promise<void> {
    try {
      const oppositeSide = side === 'LONG' ? 'SELL' : 'BUY';

      // Place Take Profit order
      await this.binanceService.placeTakeProfitOrder(
        config.symbol,
        oppositeSide,
        quantity.toString(),
        tpPrice.toFixed(2)
      );

      // Place Stop Loss order
      await this.binanceService.placeStopLossOrder(
        config.symbol,
        oppositeSide,
        quantity.toString(),
        slPrice.toFixed(2)
      );

      Logger.info('✅ Take Profit and Stop Loss orders placed successfully');
    } catch (error) {
      Logger.error('Error setting TP/SL orders:', error);
      throw error;
    }
  }

  /**
   * Monitor open position
   */
  async monitorPosition(): Promise<void> {
    if (!this.currentPosition) {
      return;
    }

    try {
      const positions = await this.binanceService.getPositions();
      const activePosition = positions.find(
        (pos) =>
          pos.symbol === this.currentPosition!.symbol &&
          parseFloat(pos.positionAmt) !== 0
      );

      if (!activePosition) {
        // Position has been closed
        const newBalance = await this.getCurrentBalance();
        const pnl = newBalance - this.accountBalance;

        Logger.info(`🔄 Position closed automatically`);
        Logger.info(`💵 PnL: $${pnl > 0 ? '+' : ''}${pnl.toFixed(2)}`);
        Logger.info(`💰 New balance: $${newBalance.toFixed(2)}`);

        this.currentPosition = null;
        this.accountBalance = newBalance;

        // Cancel any remaining orders
        await this.binanceService.cancelAllOrders(config.symbol);
      } else {
        // Update unrealized PnL
        this.currentPosition.unrealizedPnl = parseFloat(
          activePosition.unRealizedProfit
        );

        if (Math.abs(this.currentPosition.unrealizedPnl) > 10) {
          // Log significant PnL changes
          Logger.info(
            `📈 Unrealized PnL: $${
              this.currentPosition.unrealizedPnl > 0 ? '+' : ''
            }${this.currentPosition.unrealizedPnl.toFixed(2)}`
          );
        }
      }
    } catch (error) {
      Logger.error('Error monitoring position:', error);
    }
  }

  /**
   * Close all positions
   */
  private async closeAllPositions(): Promise<void> {
    try {
      await this.binanceService.closeAllPositions(config.symbol);
      await this.binanceService.cancelAllOrders(config.symbol);
      this.currentPosition = null;

      // Wait for orders to be processed
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      Logger.error('Error closing positions:', error);
    }
  }

  /**
   * Update account balance
   */
  private async updateAccountBalance(): Promise<void> {
    try {
      this.accountBalance = await this.getCurrentBalance();
      Logger.info(`💰 Current balance: $${this.accountBalance.toFixed(2)}`);
    } catch (error) {
      Logger.error('Error updating account balance:', error);
    }
  }

  /**
   * Get current USDT balance
   */
  private async getCurrentBalance(): Promise<number> {
    try {
      // This is a simplified balance fetch - you might need to adjust based on actual API response
      const positions = await this.binanceService.getPositions();
      // For now, return a default balance - you should implement actual balance fetching
      return this.accountBalance || config.tradeAmount;
    } catch (error) {
      Logger.error('Error fetching balance:', error);
      return this.accountBalance || config.tradeAmount;
    }
  }

  /**
   * Round quantity to appropriate decimal places for BTCUSDT
   */
  private roundQuantity(quantity: number): number {
    // BTCUSDT futures typically use 3 decimal places
    return Math.floor(quantity * 1000) / 1000;
  }

  /**
   * Get current position info
   */
  getCurrentPosition(): PositionInfo | null {
    return this.currentPosition;
  }

  /**
   * Get account status
   */
  async getAccountStatus(): Promise<void> {
    try {
      await this.updateAccountBalance();

      if (this.currentPosition) {
        Logger.info('📊 Current Position:', {
          symbol: this.currentPosition.symbol,
          side: this.currentPosition.side,
          size: this.currentPosition.size,
          entryPrice: this.currentPosition.entryPrice,
          leverage: this.currentPosition.leverage,
          unrealizedPnl: this.currentPosition.unrealizedPnl,
        });
      } else {
        Logger.info('📊 No open positions');
      }

      const positions = await this.binanceService.getPositions();
      if (positions.length > 0) {
        Logger.info('🔍 All positions:', positions);
      }
    } catch (error) {
      Logger.error('Error getting account status:', error);
    }
  }

  /**
   * Manual test trade for development
   */
  async executeTestTrade(action: 'LONG' | 'SHORT'): Promise<void> {
    try {
      Logger.info(`🧪 Executing test ${action} trade`);

      // Generate current market data
      const signal = await this.technicalService.generateTradingSignal(
        config.symbol
      );

      // Override action for testing
      const testSignal: TradingSignal = {
        ...signal,
        action: action,
        leverage: 5, // Use conservative leverage for testing
      };

      await this.executeTrade(testSignal);
    } catch (error) {
      Logger.error('Test trade failed:', error);
      throw error;
    }
  }
}
