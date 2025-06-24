import * as cron from 'node-cron';
import express from 'express';
import { BinanceFuturesService } from './services/binanceService';
import { TradingService } from './services/tradingService';
import { config } from './config/config';
import { Logger } from './utils/logger';
import { telegramService } from './services/telegramService';

class TradingBot {
  private binanceService: BinanceFuturesService;
  private tradingService: TradingService;
  private app: express.Application;
  private server: any;
  private isServerRunning: boolean = false;

  constructor() {
    this.binanceService = new BinanceFuturesService();
    this.tradingService = new TradingService(this.binanceService);
    this.app = express();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // Health check endpoint for Cloud Run
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        message: 'Trading bot is running',
      });
    });

    // Status endpoint
    this.app.get('/status', async (req, res) => {
      try {
        await this.getAccountStatus();
        res.status(200).json({
          status: 'active',
          message: 'Bot is running and account is accessible',
        });
      } catch (error) {
        res.status(500).json({
          status: 'error',
          message: 'Failed to get account status',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    // Manual trade endpoints
    this.app.post('/trade/buy', async (req, res) => {
      try {
        await this.executeTestTrade('BUY');
        res.status(200).json({
          status: 'success',
          message: 'Buy trade executed successfully',
        });
      } catch (error) {
        res.status(500).json({
          status: 'error',
          message: 'Failed to execute buy trade',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    this.app.post('/trade/sell', async (req, res) => {
      try {
        await this.executeTestTrade('SELL');
        res.status(200).json({
          status: 'success',
          message: 'Sell trade executed successfully',
        });
      } catch (error) {
        res.status(500).json({
          status: 'error',
          message: 'Failed to execute sell trade',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.status(200).json({
        name: 'Binance Futures Trading Bot',
        status: 'running',
        endpoints: {
          health: '/health',
          status: '/status',
          trade_buy: 'POST /trade/buy',
          trade_sell: 'POST /trade/sell',
        },
      });
    });
  }

  startHttpServer(): void {
    if (this.isServerRunning) {
      Logger.info('HTTP server is already running');
      return;
    }

    const port = process.env.PORT || 8080;
    this.server = this.app.listen(port, () => {
      Logger.info(`HTTP server listening on port ${port}`);
      this.isServerRunning = true;
    });
  }

  isHttpServerRunning(): boolean {
    return this.isServerRunning;
  }

  async initialize(): Promise<void> {
    try {
      Logger.info('Initializing Trading Bot...');

      // Check if we have API credentials
      const { binanceConfig } = await import('./config/config');
      if (
        !binanceConfig.apiKey ||
        !binanceConfig.apiSecret ||
        binanceConfig.apiKey === 'your_api_key_here' ||
        binanceConfig.apiSecret === 'your_api_secret_here'
      ) {
        Logger.warn(
          'No valid Binance API credentials found. Bot will run in demo mode.'
        );
        Logger.warn(
          'Trading functions will be disabled until proper credentials are provided.'
        );
        return;
      }

      await this.binanceService.initialize();
      Logger.info('Trading Bot initialized successfully');

      // Send Telegram startup notification
      try {
        await telegramService.sendStartupAlert();
      } catch (error) {
        Logger.warn('Failed to send Telegram startup notification:', error);
      }

      // Display current configuration
      Logger.info('Trading Configuration:', {
        symbol: config.symbol,
        leverage: config.leverage,
        tradeAmount: config.tradeAmount,
        stopLossPoints: config.stopLossPoints,
        takeProfitPoints: config.takeProfitPoints,
        timezone: config.timezone,
      });
    } catch (error) {
      Logger.error('Failed to initialize Trading Bot:', error);
      Logger.warn(
        'Bot will continue running with limited functionality (HTTP server only)'
      );
      // Don't throw the error - let the bot continue running for Cloud Run health checks
    }
  }

  async startScheduledTrading(): Promise<void> {
    Logger.info(
      'Starting scheduled trading at 4:30 PM Prague time (16:30 Europe/Prague)'
    );

    // Schedule for 4:30 PM Prague time (16:30)
    // Cron format: second minute hour day month weekday
    const cronExpression = '0 30 16 * * *'; // Every day at 16:30

    cron.schedule(
      cronExpression,
      async () => {
        try {
          Logger.info(
            'Scheduled trade execution triggered at 4:30 PM Prague time'
          );

          // Generate trade signal (you can customize this logic)
          const signal = this.tradingService.generateTradeSignal();

          // Execute the trade
          await this.tradingService.executeTradeSignal(signal);

          Logger.info('Scheduled trade execution completed');
        } catch (error) {
          Logger.error('Error during scheduled trade execution:', error);
        }
      },
      {
        timezone: config.timezone,
      }
    );

    Logger.info(
      'Scheduled trading started. Bot will execute trades at 4:30 PM Prague time daily.'
    );
  }

  async executeTestTrade(action: 'BUY' | 'SELL'): Promise<void> {
    try {
      Logger.info(`Executing test trade: ${action}`);
      await this.tradingService.executeManualTrade(action);
      Logger.info('Test trade completed successfully');
    } catch (error) {
      Logger.error('Test trade failed:', error);
      throw error;
    }
  }

  async getAccountStatus(): Promise<void> {
    try {
      await this.tradingService.getAccountInfo();
    } catch (error) {
      Logger.error('Failed to get account status:', error);
    }
  }

  async stop(): Promise<void> {
    Logger.info('Stopping Trading Bot...');
    // Add any cleanup logic here
    Logger.info('Trading Bot stopped');
  }
}

async function main() {
  const bot = new TradingBot();

  try {
    // Start HTTP server first for Cloud Run health checks
    bot.startHttpServer();

    await bot.initialize();

    // Check command line arguments
    const args = process.argv.slice(2);

    if (args.includes('--test-buy')) {
      await bot.executeTestTrade('BUY');
      Logger.info('Test trade completed, but keeping server running...');
    } else if (args.includes('--test-sell')) {
      await bot.executeTestTrade('SELL');
      Logger.info('Test trade completed, but keeping server running...');
    } else if (args.includes('--status')) {
      await bot.getAccountStatus();
      Logger.info('Status check completed, but keeping server running...');
    } else {
      // Start scheduled trading only if no test commands
      await bot.startScheduledTrading();
    }

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
    Logger.info('Trading bot is running. Press Ctrl+C to stop.');
  } catch (error) {
    Logger.error('Fatal error in main:', error);
    // Still try to start the HTTP server for Cloud Run health checks
    if (!bot.isHttpServerRunning()) {
      try {
        bot.startHttpServer();
        Logger.info('HTTP server started despite initialization errors');
      } catch (serverError) {
        Logger.error('Failed to start HTTP server:', serverError);
      }
    }
    // Don't exit immediately - keep the server running for debugging
    Logger.info('Bot will continue running with limited functionality');
  }
}

// Only run main if this file is executed directly
if (require.main === module) {
  main().catch((error) => {
    Logger.error('Unhandled error in main:', error);
    process.exit(1);
  });
}

export default TradingBot;
