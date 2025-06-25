// Unit tests for TelegramService
import { MockTelegramService } from '../mocks/MockTelegramService';

describe('TelegramService', () => {
  let telegramService: MockTelegramService;

  beforeEach(() => {
    telegramService = new MockTelegramService();
  });

  afterEach(() => {
    telegramService.clearMessages();
    telegramService.setShouldFail(false);
  });

  describe('basic messaging', () => {
    test('should send simple text message', async () => {
      const message = 'Test message';
      const result = await telegramService.sendMessage(message);

      expect(result).toBe(true);
      expect(telegramService.getMessageCount()).toBe(1);

      const lastMessage = telegramService.getLastMessage();
      expect(lastMessage.text).toBe(message);
    });

    test('should send structured message', async () => {
      const message = {
        text: 'Structured test message',
        parse_mode: 'Markdown' as const,
      };

      const result = await telegramService.sendMessage(message);

      expect(result).toBe(true);
      expect(telegramService.getMessageCount()).toBe(1);

      const lastMessage = telegramService.getLastMessage();
      expect(lastMessage.text).toBe(message.text);
    });

    test('should handle message sending failure', async () => {
      telegramService.setShouldFail(true);

      const result = await telegramService.sendMessage('Test message');

      expect(result).toBe(false);
      expect(telegramService.getMessageCount()).toBe(0);
    });
  });

  describe('trade alerts', () => {
    test('should send trade alert for buy order', async () => {
      const result = await telegramService.sendTradeAlert(
        'BUY',
        'BTCUSDT',
        42000.5,
        0.024,
        10
      );

      expect(result).toBe(true);
      expect(telegramService.getMessageCount()).toBe(1);

      const lastMessage = telegramService.getLastMessage();
      expect(lastMessage.text).toContain('Trade Alert');
      expect(lastMessage.text).toContain('BUY');
      expect(lastMessage.text).toContain('BTCUSDT');
      expect(lastMessage.text).toContain('42000.5');
      expect(lastMessage.text).toContain('0.024');
      expect(lastMessage.text).toContain('10x');
    });

    test('should send trade alert for sell order', async () => {
      const result = await telegramService.sendTradeAlert(
        'SELL',
        'ETHUSDT',
        3200.75,
        0.312,
        5
      );

      expect(result).toBe(true);

      const lastMessage = telegramService.getLastMessage();
      expect(lastMessage.text).toContain('SELL');
      expect(lastMessage.text).toContain('ETHUSDT');
      expect(lastMessage.text).toContain('3200.75');
      expect(lastMessage.text).toContain('0.312');
      expect(lastMessage.text).toContain('5x');
    });

    test('should handle trade alert failure', async () => {
      telegramService.setShouldFail(true);

      const result = await telegramService.sendTradeAlert(
        'BUY',
        'BTCUSDT',
        42000,
        0.024,
        10
      );

      expect(result).toBe(false);
      expect(telegramService.getMessageCount()).toBe(0);
    });
  });

  describe('error alerts', () => {
    test('should send error alert without context', async () => {
      const error = 'API connection failed';
      const result = await telegramService.sendErrorAlert(error);

      expect(result).toBe(true);
      expect(telegramService.getMessageCount()).toBe(1);

      const lastMessage = telegramService.getLastMessage();
      expect(lastMessage.text).toContain('Error Alert');
      expect(lastMessage.text).toContain(error);
    });

    test('should send error alert with context', async () => {
      const error = 'Order placement failed';
      const context = 'Placing buy order for BTCUSDT';
      const result = await telegramService.sendErrorAlert(error, context);

      expect(result).toBe(true);

      const lastMessage = telegramService.getLastMessage();
      expect(lastMessage.text).toContain('Error Alert');
      expect(lastMessage.text).toContain(error);
      expect(lastMessage.text).toContain('Context');
      expect(lastMessage.text).toContain(context);
    });

    test('should handle error alert failure', async () => {
      telegramService.setShouldFail(true);

      const result = await telegramService.sendErrorAlert('Test error');

      expect(result).toBe(false);
      expect(telegramService.getMessageCount()).toBe(0);
    });
  });

  describe('startup alerts', () => {
    test('should send startup alert', async () => {
      const result = await telegramService.sendStartupAlert();

      expect(result).toBe(true);
      expect(telegramService.getMessageCount()).toBe(1);

      const lastMessage = telegramService.getLastMessage();
      expect(lastMessage.text).toContain('Trading Bot Started');
      expect(lastMessage.text).toContain('running');
      expect(lastMessage.text).toContain('monitoring');
    });

    test('should handle startup alert failure', async () => {
      telegramService.setShouldFail(true);

      const result = await telegramService.sendStartupAlert();

      expect(result).toBe(false);
      expect(telegramService.getMessageCount()).toBe(0);
    });
  });

  describe('daily reports', () => {
    test('should send daily report with positive P&L', async () => {
      const report = {
        totalTrades: 15,
        successfulTrades: 12,
        totalPnL: 156.75,
        winRate: 80,
      };

      const result = await telegramService.sendDailyReport(report);

      expect(result).toBe(true);
      expect(telegramService.getMessageCount()).toBe(1);

      const lastMessage = telegramService.getLastMessage();
      expect(lastMessage.text).toContain('Daily Report');
      expect(lastMessage.text).toContain('15');
      expect(lastMessage.text).toContain('12');
      expect(lastMessage.text).toContain('156.75');
      expect(lastMessage.text).toContain('80%');
    });

    test('should send daily report with negative P&L', async () => {
      const report = {
        totalTrades: 8,
        successfulTrades: 3,
        totalPnL: -45.25,
        winRate: 37.5,
      };

      const result = await telegramService.sendDailyReport(report);

      expect(result).toBe(true);

      const lastMessage = telegramService.getLastMessage();
      expect(lastMessage.text).toContain('Daily Report');
      expect(lastMessage.text).toContain('8');
      expect(lastMessage.text).toContain('3');
      expect(lastMessage.text).toContain('-45.25');
      expect(lastMessage.text).toContain('37.5%');
    });

    test('should handle daily report failure', async () => {
      telegramService.setShouldFail(true);

      const report = {
        totalTrades: 5,
        successfulTrades: 4,
        totalPnL: 25.5,
        winRate: 80,
      };

      const result = await telegramService.sendDailyReport(report);

      expect(result).toBe(false);
      expect(telegramService.getMessageCount()).toBe(0);
    });
  });

  describe('connection testing', () => {
    test('should test connection successfully', async () => {
      const result = await telegramService.testConnection();

      expect(result).toBe(true);
      expect(telegramService.getMessageCount()).toBe(1);

      const lastMessage = telegramService.getLastMessage();
      expect(lastMessage.text).toContain('Test message');
      expect(lastMessage.text).toContain('trading bot');
    });

    test('should handle connection test failure', async () => {
      telegramService.setShouldFail(true);

      const result = await telegramService.testConnection();

      expect(result).toBe(false);
      expect(telegramService.getMessageCount()).toBe(0);
    });
  });

  describe('message management', () => {
    test('should track multiple messages', async () => {
      await telegramService.sendMessage('Message 1');
      await telegramService.sendMessage('Message 2');
      await telegramService.sendMessage('Message 3');

      expect(telegramService.getMessageCount()).toBe(3);

      const messages = telegramService.getSentMessages();
      expect(messages).toHaveLength(3);
      expect(messages[0].text).toBe('Message 1');
      expect(messages[1].text).toBe('Message 2');
      expect(messages[2].text).toBe('Message 3');
    });

    test('should get last message correctly', async () => {
      await telegramService.sendMessage('First message');
      await telegramService.sendMessage('Last message');

      const lastMessage = telegramService.getLastMessage();
      expect(lastMessage.text).toBe('Last message');
    });

    test('should clear messages', async () => {
      await telegramService.sendMessage('Test message');
      expect(telegramService.getMessageCount()).toBe(1);

      telegramService.clearMessages();
      expect(telegramService.getMessageCount()).toBe(0);
      expect(telegramService.getSentMessages()).toHaveLength(0);
    });

    test('should handle empty message list', () => {
      expect(telegramService.getMessageCount()).toBe(0);
      expect(telegramService.getSentMessages()).toHaveLength(0);
      expect(telegramService.getLastMessage()).toBeUndefined();
    });
  });

  describe('message timestamps', () => {
    test('should include timestamp in messages', async () => {
      const beforeTime = Date.now();
      await telegramService.sendMessage('Timestamped message');
      const afterTime = Date.now();

      const lastMessage = telegramService.getLastMessage();
      expect(lastMessage.timestamp).toBeDefined();
      expect(lastMessage.timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(lastMessage.timestamp).toBeLessThanOrEqual(afterTime);
    });
  });
});
