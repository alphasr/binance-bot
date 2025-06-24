import { config } from './config/config';
import { BinanceFuturesService } from './services/binanceService';
import { Logger } from './utils/logger';

async function testConnection() {
  try {
    Logger.info('Testing Binance API connection...');

    if (!process.env.BINANCE_API_KEY || !process.env.BINANCE_API_SECRET) {
      Logger.error('API credentials not found. Please check your .env file.');
      return;
    }

    const binanceService = new BinanceFuturesService();

    // Test basic connectivity
    await binanceService.initialize();

    // Get current BTC price
    const price = await binanceService.getCurrentPrice(config.symbol);
    Logger.info(`Current ${config.symbol} price: $${price}`);

    // Get account positions
    const positions = await binanceService.getPositions();
    Logger.info(`Current positions count: ${positions.length}`);

    if (positions.length > 0) {
      Logger.info('Open positions:', positions);
    }

    Logger.info('✅ API connection test successful!');
  } catch (error) {
    Logger.error('❌ API connection test failed:', error);
  }
}

if (require.main === module) {
  testConnection();
}
