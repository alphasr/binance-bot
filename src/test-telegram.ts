import * as dotenv from 'dotenv';
dotenv.config();

import { config } from './config/config'; // Load environment variables first
import { telegramService } from './services/telegramService';
import { Logger } from './utils/logger';

async function testTelegramIntegration() {
  Logger.info('Testing Telegram integration...');

  // Debug: Log environment variables
  Logger.info(
    `TELEGRAM_BOT_TOKEN: ${process.env.TELEGRAM_BOT_TOKEN ? 'SET' : 'NOT SET'}`
  );
  Logger.info(
    `TELEGRAM_CHAT_ID: ${process.env.TELEGRAM_CHAT_ID ? 'SET' : 'NOT SET'}`
  );

  try {
    // Test connection
    const connectionTest = await telegramService.testConnection();
    if (!connectionTest) {
      Logger.error('Telegram connection test failed');
      return;
    }

    // Test trade alert
    await telegramService.sendTradeAlert('BUY', 'BTCUSDT', 42000, 0.1, 50);

    // Test error alert
    await telegramService.sendErrorAlert(
      'This is a test error',
      'Testing error notifications'
    );

    // Test startup alert
    await telegramService.sendStartupAlert();

    // Test daily report
    await telegramService.sendDailyReport({
      totalTrades: 5,
      successfulTrades: 4,
      totalPnL: 125.5,
      winRate: 80,
    });

    Logger.info('All Telegram tests completed successfully!');
  } catch (error) {
    Logger.error('Telegram test failed:', error);
  }
}

testTelegramIntegration();
