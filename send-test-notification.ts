import * as dotenv from 'dotenv';
dotenv.config();

import { telegramService } from './src/services/telegramService';
import { Logger } from './src/utils/logger';

async function sendTestNotification() {
  Logger.info('Sending test notification to verify production setup...');

  try {
    const success = await telegramService.sendMessage(`
🧪 *Production Test Notification*

✅ Your Binance Trading Bot is successfully deployed and running on Google Cloud Run!

📍 *Service Details:*
• URL: https://binance-trading-bot-373824821506.us-central1.run.app
• Status: Active and monitoring
• Next trade: Today at 4:30 PM Prague time

🔔 *Telegram Integration:* Working perfectly!
📊 *Trading Schedule:* Daily at 16:30 Europe/Prague
💰 *Trade Amount:* $100 USDT
⚖️ *Leverage:* 10x
🎯 *Symbol:* BTCUSDT

The bot will send you notifications for:
• Trade executions (buy/sell)
• Errors and alerts
• Daily P&L reports

Happy trading! 🚀
    `);

    if (success) {
      Logger.info('✅ Test notification sent successfully!');
    } else {
      Logger.error('❌ Failed to send test notification');
    }
  } catch (error) {
    Logger.error('Error sending test notification:', error);
  }
}

sendTestNotification();
