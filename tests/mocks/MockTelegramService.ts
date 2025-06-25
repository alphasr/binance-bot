// Mock Telegram Service for testing
import { TelegramMessage } from '../../src/services/telegramService';
import { mockTelegramResponse } from './mockData';

export class MockTelegramService {
  private sentMessages: any[] = [];
  private shouldFail = false;

  async sendMessage(message: string | TelegramMessage): Promise<boolean> {
    if (this.shouldFail) {
      return false;
    }

    const messageData = {
      ...mockTelegramResponse.result,
      text: typeof message === 'string' ? message : message.text,
      timestamp: Date.now(),
    };

    this.sentMessages.push(messageData);
    return true;
  }

  async sendTradeAlert(
    action: string,
    symbol: string,
    price: number,
    quantity: number,
    leverage: number
  ): Promise<boolean> {
    const message = `🚀 Trade Alert!\n${action} ${symbol}\nPrice: $${price}\nQuantity: ${quantity}\nLeverage: ${leverage}x`;
    return this.sendMessage(message);
  }

  async sendErrorAlert(error: string, context?: string): Promise<boolean> {
    const message = `❌ Error Alert!\n${error}${
      context ? `\nContext: ${context}` : ''
    }`;
    return this.sendMessage(message);
  }

  async sendStartupAlert(): Promise<boolean> {
    const message =
      '🚀 Trading Bot Started!\nBot is now running and monitoring markets.';
    return this.sendMessage(message);
  }

  async sendDailyReport(report: {
    totalTrades: number;
    successfulTrades: number;
    totalPnL: number;
    winRate: number;
  }): Promise<boolean> {
    const message = `📊 Daily Report\nTrades: ${report.totalTrades}\nSuccessful: ${report.successfulTrades}\nP&L: $${report.totalPnL}\nWin Rate: ${report.winRate}%`;
    return this.sendMessage(message);
  }

  async testConnection(): Promise<boolean> {
    if (this.shouldFail) {
      return false;
    }
    await this.sendMessage('🧪 Test message from trading bot!');
    return true;
  }

  // Helper methods for testing
  getSentMessages(): any[] {
    return this.sentMessages;
  }

  getLastMessage(): any {
    return this.sentMessages[this.sentMessages.length - 1];
  }

  clearMessages(): void {
    this.sentMessages = [];
  }

  setShouldFail(shouldFail: boolean): void {
    this.shouldFail = shouldFail;
  }

  getMessageCount(): number {
    return this.sentMessages.length;
  }
}
