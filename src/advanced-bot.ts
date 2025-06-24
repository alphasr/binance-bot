import * as cron from 'node-cron';
import { BinanceFuturesService } from './services/binanceService';
import { AdvancedTradingService } from './services/advancedTradingService';
import { config } from './config/config';
import { Logger } from './utils/logger';

/**
 * ADVANCED BINANCE FUTURES TRADING BOT
 *
 * ALGORITHM:
 * 1. Fetch 30-minute candles daily at 4:00 PM Prague time
 * 2. Calculate EMA 7, 100, 200 and RSI(14) on closing prices
 * 3. Check entry conditions at 4:33 PM:
 *    - LONG: Price > EMA7 > EMA100 > EMA200, RSI 30-50, Price within 0.3% of EMA7
 *    - SHORT: Price < EMA7 < EMA100 < EMA200, RSI 50-70, Price within 0.3% of EMA7
 * 4. Determine leverage (5x normal, 10x if RSI extreme)
 * 5. Calculate position size based on account balance
 * 6. Place market order with TP +500, SL -500
 * 7. Monitor position until TP/SL hit
 * 8. Update balance and compound for next trade
 */

class AdvancedTradingBot {
  private binanceService: BinanceFuturesService;
  private tradingService: AdvancedTradingService;

  constructor() {
    this.binanceService = new BinanceFuturesService();
    this.tradingService = new AdvancedTradingService(this.binanceService);
  }

  async initialize(): Promise<void> {
    try {
      Logger.info('🚀 Initializing Advanced Trading Bot...');
      await this.binanceService.initialize();
      Logger.info('✅ Advanced Trading Bot initialized successfully');

      // Display current configuration
      Logger.info('📋 Trading Configuration:', {
        symbol: config.symbol,
        leverage: config.leverage,
        tradeAmount: config.tradeAmount,
        stopLossPoints: config.stopLossPoints,
        takeProfitPoints: config.takeProfitPoints,
        timezone: config.timezone,
      });

      Logger.info('📊 Algorithm: EMA 7/100/200 + RSI(14) Technical Analysis');
    } catch (error) {
      Logger.error('Failed to initialize Advanced Trading Bot:', error);
      throw error;
    }
  }

  async startScheduledTrading(): Promise<void> {
    Logger.info(
      '⏰ Starting scheduled trading with advanced technical analysis'
    );
    Logger.info('🕐 Data preparation: 4:00 PM Prague time');
    Logger.info('🎯 Strategy execution: 4:33 PM Prague time');

    // Prepare indicators at 4:00 PM Prague time
    cron.schedule(
      '0 16 * * *',
      async () => {
        try {
          Logger.info('📈 4:00 PM - Preparing technical indicators...');
          // Pre-fetch and cache data for faster execution at 4:33 PM
        } catch (error) {
          Logger.error('Error during indicator preparation:', error);
        }
      },
      {
        timezone: config.timezone,
      }
    );

    // Execute strategy at 4:33 PM Prague time (33 minutes past 4 PM)
    cron.schedule(
      '33 16 * * *',
      async () => {
        try {
          Logger.info('🎯 4:33 PM - Executing advanced trading strategy!');
          await this.tradingService.executeStrategy();
        } catch (error) {
          Logger.error('Error during scheduled strategy execution:', error);
        }
      },
      {
        timezone: config.timezone,
      }
    );

    // Monitor positions every minute
    cron.schedule('* * * * *', async () => {
      try {
        await this.tradingService.monitorPosition();
      } catch (error) {
        Logger.error('Error during position monitoring:', error);
      }
    });

    Logger.info('✅ Advanced scheduled trading started successfully');
    Logger.info('⏳ Waiting for next execution at 4:33 PM Prague time...');
  }

  async executeTestTrade(action: 'LONG' | 'SHORT'): Promise<void> {
    try {
      Logger.info(`🧪 Executing advanced test trade: ${action}`);
      await this.tradingService.executeTestTrade(action);
      Logger.info('✅ Advanced test trade completed successfully');
    } catch (error) {
      Logger.error('Advanced test trade failed:', error);
      throw error;
    }
  }

  async getAccountStatus(): Promise<void> {
    try {
      await this.tradingService.getAccountStatus();
    } catch (error) {
      Logger.error('Failed to get account status:', error);
    }
  }

  async stop(): Promise<void> {
    Logger.info('🛑 Stopping Advanced Trading Bot...');
    // Add any cleanup logic here
    Logger.info('✅ Advanced Trading Bot stopped');
  }
}

async function main() {
  const bot = new AdvancedTradingBot();

  try {
    await bot.initialize();

    // Check command line arguments
    const args = process.argv.slice(2);

    if (args.includes('--test-long')) {
      await bot.executeTestTrade('LONG');
      return;
    }

    if (args.includes('--test-short')) {
      await bot.executeTestTrade('SHORT');
      return;
    }

    if (args.includes('--status')) {
      await bot.getAccountStatus();
      return;
    }

    // Start scheduled trading
    await bot.startScheduledTrading();

    // Keep the process running
    process.on('SIGINT', async () => {
      Logger.info('Received SIGINT, shutting down gracefully...');
      await bot.stop();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      Logger.info('Received SIGTERM, shutting down gracefully...');
      await bot.stop();
      process.exit(0);
    });

    // Keep the process alive
    Logger.info('🤖 Advanced Trading bot is running. Press Ctrl+C to stop.');
  } catch (error) {
    Logger.error('Fatal error in main:', error);
    process.exit(1);
  }
}

// Only run main if this file is executed directly
if (require.main === module) {
  main().catch((error) => {
    Logger.error('Unhandled error in main:', error);
    process.exit(1);
  });
}

export default AdvancedTradingBot;
