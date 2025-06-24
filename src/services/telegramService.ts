import axios from 'axios';
import { Logger } from '../utils/logger';

export interface TelegramMessage {
  text: string;
  parse_mode?: 'HTML' | 'Markdown';
  disable_web_page_preview?: boolean;
}

export class TelegramService {
  private botToken: string;
  private chatId: string;
  private baseUrl: string;

  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN || '';
    this.chatId = process.env.TELEGRAM_CHAT_ID || '';
    this.baseUrl = `https://api.telegram.org/bot${this.botToken}`;

    if (!this.botToken || !this.chatId) {
      Logger.warn(
        'Telegram credentials not configured. Notifications will be disabled.'
      );
    }
  }

  async sendMessage(message: string | TelegramMessage): Promise<boolean> {
    if (!this.botToken || !this.chatId) {
      Logger.warn('Telegram not configured. Skipping notification.');
      return false;
    }

    try {
      const payload = typeof message === 'string' ? { text: message } : message;

      const response = await axios.post(`${this.baseUrl}/sendMessage`, {
        chat_id: this.chatId,
        ...payload,
      });

      if (response.data.ok) {
        Logger.info('Telegram notification sent successfully');
        return true;
      } else {
        Logger.error('Failed to send Telegram notification:', response.data);
        return false;
      }
    } catch (error) {
      Logger.error('Error sending Telegram notification:', error);
      return false;
    }
  }

  async sendTradeAlert(
    type: 'BUY' | 'SELL',
    symbol: string,
    price: number,
    quantity: number,
    pnl?: number
  ) {
    const emoji = type === 'BUY' ? '🟢' : '🔴';
    const pnlText =
      pnl !== undefined
        ? `\n💰 PnL: ${pnl > 0 ? '+' : ''}${pnl.toFixed(2)} USDT`
        : '';

    const message = {
      text: `${emoji} <b>${type} ORDER EXECUTED</b>

📊 Symbol: <code>${symbol}</code>
💵 Price: <code>$${price.toFixed(2)}</code>
📈 Quantity: <code>${quantity}</code>
⏰ Time: ${new Date().toLocaleString('en-US', {
        timeZone: 'Europe/Prague',
      })} (Prague)${pnlText}

🤖 Automated by Binance Trading Bot`,
      parse_mode: 'HTML' as const,
    };

    return this.sendMessage(message);
  }

  async sendErrorAlert(error: string, context?: string) {
    const message = {
      text: `🚨 <b>TRADING BOT ERROR</b>

❌ Error: <code>${error}</code>
${context ? `📍 Context: ${context}` : ''}
⏰ Time: ${new Date().toLocaleString('en-US', {
        timeZone: 'Europe/Prague',
      })} (Prague)

🔧 Please check your bot status.`,
      parse_mode: 'HTML' as const,
    };

    return this.sendMessage(message);
  }

  async sendStartupAlert() {
    const message = {
      text: `🟢 <b>TRADING BOT STARTED</b>

🤖 Bot successfully deployed to Google Cloud Run
📅 Next trade: 4:30 PM Prague time
💱 Symbol: ${process.env.SYMBOL || 'BTCUSDT'}
💰 Trade Amount: ${process.env.TRADE_AMOUNT_USDT || '100'} USDT
⚖️ Leverage: ${process.env.LEVERAGE || '10'}x

✅ All systems operational`,
      parse_mode: 'HTML' as const,
    };

    return this.sendMessage(message);
  }

  async sendDailyReport(stats: {
    totalTrades: number;
    successfulTrades: number;
    totalPnL: number;
    winRate: number;
  }) {
    const { totalTrades, successfulTrades, totalPnL, winRate } = stats;
    const profitEmoji = totalPnL > 0 ? '📈' : totalPnL < 0 ? '📉' : '➡️';

    const message = {
      text: `📊 <b>DAILY TRADING REPORT</b>

📈 Total Trades: <code>${totalTrades}</code>
✅ Successful: <code>${successfulTrades}</code>
📊 Win Rate: <code>${winRate.toFixed(1)}%</code>
${profitEmoji} Total PnL: <code>${totalPnL > 0 ? '+' : ''}${totalPnL.toFixed(
        2
      )} USDT</code>

📅 Date: ${new Date().toLocaleDateString('en-US', {
        timeZone: 'Europe/Prague',
      })}
⏰ Generated: ${new Date().toLocaleTimeString('en-US', {
        timeZone: 'Europe/Prague',
      })} (Prague)

🤖 Binance Trading Bot Report`,
      parse_mode: 'HTML' as const,
    };

    return this.sendMessage(message);
  }

  async testConnection(): Promise<boolean> {
    if (!this.botToken || !this.chatId) {
      Logger.error('Telegram credentials not configured');
      return false;
    }

    try {
      const response = await axios.get(`${this.baseUrl}/getMe`);
      if (response.data.ok) {
        Logger.info('Telegram bot connection test successful');
        await this.sendMessage(
          '🧪 Test message from your Binance Trading Bot!'
        );
        return true;
      }
      return false;
    } catch (error) {
      Logger.error('Telegram connection test failed:', error);
      return false;
    }
  }
}

export const telegramService = new TelegramService();
