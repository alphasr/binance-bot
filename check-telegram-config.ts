import * as dotenv from 'dotenv';
dotenv.config();

import { Logger } from './src/utils/logger';

async function showCurrentConfig() {
  Logger.info('🤖 Current Telegram Configuration:');
  Logger.info('');

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  Logger.info(`Bot Token: ${botToken ? '✅ Configured' : '❌ Missing'}`);
  Logger.info(`Chat ID: ${chatId || 'Not set'}`);
  Logger.info('');

  if (chatId) {
    if (chatId.startsWith('-')) {
      Logger.info('📊 Current setup: GROUP CHAT (Chat ID starts with -)');
      Logger.info('✅ Already configured for group messaging!');
    } else {
      Logger.info(
        '👤 Current setup: PRIVATE CHAT (Chat ID is positive number)'
      );
      Logger.info(
        '💡 To switch to group, get a group chat ID (negative number)'
      );
    }
  } else {
    Logger.info('❌ No chat ID configured');
  }

  Logger.info('');
  Logger.info('📝 Group Chat ID format examples:');
  Logger.info('   • Group: -1234567890 (negative number)');
  Logger.info('   • Supergroup: -100123456789 (starts with -100)');
  Logger.info('   • Private: 123456789 (positive number)');
  Logger.info('');
  Logger.info('🛠️ To get group chat ID:');
  Logger.info('   1. Add your bot to a Telegram group');
  Logger.info('   2. Send a message in the group');
  Logger.info('   3. Run: npm run get-group-id');
}

showCurrentConfig();
