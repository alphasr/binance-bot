import * as dotenv from 'dotenv';
dotenv.config();

import { telegramService } from './src/services/telegramService';
import { Logger } from './src/utils/logger';

async function sendGroupTestNotification() {
  Logger.info('🔄 Sending group test notification...');

  try {
    const success = await telegramService.sendMessage({
      text: `🎉 *GROUP MESSAGING ACTIVATED!*

✅ Your Binance Trading Bot is now sending alerts to this group!

📱 *Group Details:*
• Chat ID: ${process.env.TELEGRAM_CHAT_ID}
• Type: Telegram Group
• Status: Active and configured

🚀 *Deployment Update:*
• Cloud Run service updated successfully
• New revision: binance-trading-bot-00007-7ft
• All trading notifications will now appear here

🕐 *Next Trading Session:*
• Today at 4:30 PM Prague time
• Bot will analyze BTCUSDT market
• Trade alerts will be sent to this group

🔔 *You'll receive notifications for:*
• 📈 Buy/Sell order executions
• ❌ Error alerts and warnings  
• 📊 Daily P&L reports
• 🚀 Bot startup confirmations

Happy group trading! 🚀💰`,
      parse_mode: 'Markdown',
    });

    if (success) {
      Logger.info('✅ Group test notification sent successfully!');
    } else {
      Logger.error('❌ Failed to send group test notification');
    }
  } catch (error) {
    Logger.error('Error sending group test notification:', error);
  }
}

sendGroupTestNotification();
