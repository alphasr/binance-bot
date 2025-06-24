import * as dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';
import { Logger } from './src/utils/logger';

async function getGroupChatId() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    Logger.error('TELEGRAM_BOT_TOKEN not found in environment variables');
    return;
  }

  Logger.info('🔍 Getting recent updates to find group chat ID...');
  Logger.info('📝 Make sure you have:');
  Logger.info('   1. Created a Telegram group');
  Logger.info('   2. Added your bot to the group');
  Logger.info('   3. Sent at least one message in the group');
  Logger.info('');

  try {
    const response = await axios.get(
      `https://api.telegram.org/bot${botToken}/getUpdates`
    );

    if (response.data.ok && response.data.result.length > 0) {
      Logger.info('📱 Found recent chats:');
      Logger.info('');

      const chats = new Map();

      response.data.result.forEach((update: any, index: number) => {
        const chat = update.message?.chat;
        if (chat) {
          const key = `${chat.id}_${chat.type}`;
          if (!chats.has(key)) {
            chats.set(key, chat);

            const chatType =
              chat.type === 'private'
                ? '👤 Private'
                : chat.type === 'group'
                ? '👥 Group'
                : chat.type === 'supergroup'
                ? '👥 Supergroup'
                : chat.type === 'channel'
                ? '📢 Channel'
                : chat.type;

            Logger.info(
              `${index + 1}. ${chatType}: ${
                chat.title || chat.first_name || 'Unknown'
              }`
            );
            Logger.info(`   Chat ID: ${chat.id}`);
            Logger.info(`   Type: ${chat.type}`);

            if (chat.type === 'group' || chat.type === 'supergroup') {
              Logger.info(
                `   ✅ Use this Chat ID for group messaging: ${chat.id}`
              );
            }
            Logger.info('');
          }
        }
      });

      Logger.info('💡 To use a group:');
      Logger.info(
        '   1. Copy the Chat ID of your desired group (should be a negative number)'
      );
      Logger.info('   2. Update TELEGRAM_CHAT_ID in your .env file');
      Logger.info('   3. Redeploy to Google Cloud Run');
    } else {
      Logger.warn('❌ No recent messages found.');
      Logger.info('💡 To get group chat ID:');
      Logger.info('   1. Create a Telegram group');
      Logger.info(
        '   2. Add your bot to the group (search for your bot username)'
      );
      Logger.info('   3. Send a message in the group (like "Hello bot!")');
      Logger.info('   4. Run this script again');
    }
  } catch (error) {
    Logger.error('❌ Error getting chat updates:', error);
  }
}

getGroupChatId();
