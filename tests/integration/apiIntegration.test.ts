// Integration tests for API interactions
import axios from 'axios';
import { TelegramService } from '../../src/services/telegramService';
import { MockTelegramService } from '../mocks/MockTelegramService';
import { mockTelegramResponse } from '../mocks/mockData';

// Mock axios for API testing
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('API Integration Tests', () => {
  describe('Telegram API Integration', () => {
    let telegramService: TelegramService;

    beforeEach(() => {
      // Set test environment variables
      process.env.TELEGRAM_BOT_TOKEN = 'test_bot_token';
      process.env.TELEGRAM_CHAT_ID = '-1001234567890';

      telegramService = new TelegramService();
      mockedAxios.post.mockClear();
      mockedAxios.get.mockClear();
    });

    afterEach(() => {
      delete process.env.TELEGRAM_BOT_TOKEN;
      delete process.env.TELEGRAM_CHAT_ID;
    });

    describe('message sending', () => {
      test('should send simple text message via API', async () => {
        mockedAxios.post.mockResolvedValue({
          data: mockTelegramResponse,
        });

        const result = await telegramService.sendMessage('Test message');

        expect(result).toBe(true);
        expect(mockedAxios.post).toHaveBeenCalledWith(
          'https://api.telegram.org/bottest_bot_token/sendMessage',
          {
            chat_id: '-1001234567890',
            text: 'Test message',
          }
        );
      });

      test('should send structured message with parse mode', async () => {
        mockedAxios.post.mockResolvedValue({
          data: mockTelegramResponse,
        });

        const message = {
          text: '*Bold* and _italic_ text',
          parse_mode: 'Markdown' as const,
          disable_web_page_preview: true,
        };

        const result = await telegramService.sendMessage(message);

        expect(result).toBe(true);
        expect(mockedAxios.post).toHaveBeenCalledWith(
          'https://api.telegram.org/bottest_bot_token/sendMessage',
          {
            chat_id: '-1001234567890',
            text: '*Bold* and _italic_ text',
            parse_mode: 'Markdown',
            disable_web_page_preview: true,
          }
        );
      });

      test('should handle API error responses', async () => {
        mockedAxios.post.mockResolvedValue({
          data: {
            ok: false,
            error_code: 400,
            description: 'Bad Request: message is too long',
          },
        });

        const result = await telegramService.sendMessage('Test message');

        expect(result).toBe(false);
      });

      test('should handle network errors', async () => {
        mockedAxios.post.mockRejectedValue(new Error('Network error'));

        const result = await telegramService.sendMessage('Test message');

        expect(result).toBe(false);
      });

      test('should handle timeout errors', async () => {
        mockedAxios.post.mockRejectedValue({ code: 'ECONNABORTED' });

        const result = await telegramService.sendMessage('Test message');

        expect(result).toBe(false);
      });
    });

    describe('connection testing', () => {
      test('should test bot connection successfully', async () => {
        // Mock getMe API call
        mockedAxios.get.mockResolvedValue({
          data: {
            ok: true,
            result: {
              id: 123456789,
              is_bot: true,
              first_name: 'Trading Bot',
              username: 'test_trading_bot',
            },
          },
        });

        // Mock sendMessage for test message
        mockedAxios.post.mockResolvedValue({
          data: mockTelegramResponse,
        });

        const result = await telegramService.testConnection();

        expect(result).toBe(true);
        expect(mockedAxios.get).toHaveBeenCalledWith(
          'https://api.telegram.org/bottest_bot_token/getMe'
        );
        expect(mockedAxios.post).toHaveBeenCalledWith(
          'https://api.telegram.org/bottest_bot_token/sendMessage',
          expect.objectContaining({
            chat_id: '-1001234567890',
            text: expect.stringContaining('Test message'),
          })
        );
      });

      test('should handle bot authentication failure', async () => {
        mockedAxios.get.mockResolvedValue({
          data: {
            ok: false,
            error_code: 401,
            description: 'Unauthorized',
          },
        });

        const result = await telegramService.testConnection();

        expect(result).toBe(false);
      });

      test('should handle missing credentials', async () => {
        delete process.env.TELEGRAM_BOT_TOKEN;
        delete process.env.TELEGRAM_CHAT_ID;

        const telegramServiceWithoutCreds = new TelegramService();
        const result = await telegramServiceWithoutCreds.testConnection();

        expect(result).toBe(false);
        expect(mockedAxios.get).not.toHaveBeenCalled();
      });
    });

    describe('specialized message types', () => {
      beforeEach(() => {
        mockedAxios.post.mockResolvedValue({
          data: mockTelegramResponse,
        });
      });

      test('should send trade alert with proper formatting', async () => {
        const result = await telegramService.sendTradeAlert(
          'BUY',
          'BTCUSDT',
          42000.5,
          0.024,
          10
        );

        expect(result).toBe(true);
        expect(mockedAxios.post).toHaveBeenCalledWith(
          expect.stringContaining('sendMessage'),
          expect.objectContaining({
            text: expect.stringContaining('🚀 Trade Alert'),
            parse_mode: 'Markdown',
          })
        );

        const callArgs = mockedAxios.post.mock.calls[0][1];
        expect(callArgs.text).toContain('BUY');
        expect(callArgs.text).toContain('BTCUSDT');
        expect(callArgs.text).toContain('42000.5');
        expect(callArgs.text).toContain('0.024');
        expect(callArgs.text).toContain('10x');
      });

      test('should send error alert with context', async () => {
        const result = await telegramService.sendErrorAlert(
          'API connection failed',
          'During order placement'
        );

        expect(result).toBe(true);

        const callArgs = mockedAxios.post.mock.calls[0][1];
        expect(callArgs.text).toContain('❌ Error Alert');
        expect(callArgs.text).toContain('API connection failed');
        expect(callArgs.text).toContain('During order placement');
      });

      test('should send startup alert', async () => {
        const result = await telegramService.sendStartupAlert();

        expect(result).toBe(true);

        const callArgs = mockedAxios.post.mock.calls[0][1];
        expect(callArgs.text).toContain('🚀 Trading Bot Started');
        expect(callArgs.text).toContain('monitoring');
      });

      test('should send daily report with statistics', async () => {
        const report = {
          totalTrades: 15,
          successfulTrades: 12,
          totalPnL: 245.75,
          winRate: 80,
        };

        const result = await telegramService.sendDailyReport(report);

        expect(result).toBe(true);

        const callArgs = mockedAxios.post.mock.calls[0][1];
        expect(callArgs.text).toContain('📊 Daily Trading Report');
        expect(callArgs.text).toContain('15');
        expect(callArgs.text).toContain('12');
        expect(callArgs.text).toContain('245.75');
        expect(callArgs.text).toContain('80%');
      });
    });

    describe('rate limiting and retry logic', () => {
      test('should handle rate limiting gracefully', async () => {
        mockedAxios.post.mockRejectedValueOnce({
          response: {
            status: 429,
            data: {
              ok: false,
              error_code: 429,
              description: 'Too Many Requests: retry after 10',
            },
          },
        });

        const result = await telegramService.sendMessage('Test message');

        expect(result).toBe(false);
        expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      });

      test('should handle server errors', async () => {
        mockedAxios.post.mockRejectedValue({
          response: {
            status: 500,
            data: {
              ok: false,
              error_code: 500,
              description: 'Internal Server Error',
            },
          },
        });

        const result = await telegramService.sendMessage('Test message');

        expect(result).toBe(false);
      });
    });

    describe('message content validation', () => {
      test('should handle very long messages', async () => {
        mockedAxios.post.mockResolvedValue({
          data: mockTelegramResponse,
        });

        const longMessage = 'x'.repeat(5000); // Telegram limit is ~4096 chars
        const result = await telegramService.sendMessage(longMessage);

        expect(result).toBe(true);
        expect(mockedAxios.post).toHaveBeenCalled();
      });

      test('should handle special characters in messages', async () => {
        mockedAxios.post.mockResolvedValue({
          data: mockTelegramResponse,
        });

        const specialMessage =
          'Special chars: äöü 中文 🚀 *bold* _italic_ `code`';
        const result = await telegramService.sendMessage(specialMessage);

        expect(result).toBe(true);

        const callArgs = mockedAxios.post.mock.calls[0][1];
        expect(callArgs.text).toBe(specialMessage);
      });

      test('should handle HTML entities correctly', async () => {
        mockedAxios.post.mockResolvedValue({
          data: mockTelegramResponse,
        });

        const message = {
          text: '<b>Bold</b> & <i>Italic</i> text with "quotes"',
          parse_mode: 'HTML' as const,
        };

        const result = await telegramService.sendMessage(message);

        expect(result).toBe(true);

        const callArgs = mockedAxios.post.mock.calls[0][1];
        expect(callArgs.text).toContain('<b>Bold</b>');
        expect(callArgs.parse_mode).toBe('HTML');
      });
    });
  });

  describe('External API Resilience', () => {
    test('should handle intermittent network issues', async () => {
      let callCount = 0;
      mockedAxios.post.mockImplementation(() => {
        callCount++;
        if (callCount <= 2) {
          return Promise.reject(new Error('Network timeout'));
        }
        return Promise.resolve({ data: mockTelegramResponse });
      });

      const telegramService = new TelegramService();

      // First two calls should fail, but we don't implement retry in the service
      let result = await telegramService.sendMessage('Test 1');
      expect(result).toBe(false);

      result = await telegramService.sendMessage('Test 2');
      expect(result).toBe(false);

      // Third call should succeed
      result = await telegramService.sendMessage('Test 3');
      expect(result).toBe(true);
    });

    test('should handle concurrent API calls', async () => {
      mockedAxios.post.mockResolvedValue({
        data: mockTelegramResponse,
      });

      const telegramService = new TelegramService();

      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(telegramService.sendMessage(`Message ${i}`));
      }

      const results = await Promise.all(promises);

      expect(results.every((result) => result === true)).toBe(true);
      expect(mockedAxios.post).toHaveBeenCalledTimes(10);
    });

    test('should handle API response variations', async () => {
      const responses = [
        { data: { ok: true, result: { message_id: 1 } } },
        { data: { ok: true, result: { message_id: 2 } } },
        { data: { ok: false, error_code: 400, description: 'Bad Request' } },
        { data: { ok: true, result: { message_id: 3 } } },
      ];

      mockedAxios.post
        .mockResolvedValueOnce(responses[0])
        .mockResolvedValueOnce(responses[1])
        .mockResolvedValueOnce(responses[2])
        .mockResolvedValueOnce(responses[3]);

      const telegramService = new TelegramService();

      const results = await Promise.all([
        telegramService.sendMessage('Message 1'),
        telegramService.sendMessage('Message 2'),
        telegramService.sendMessage('Message 3'),
        telegramService.sendMessage('Message 4'),
      ]);

      expect(results).toEqual([true, true, false, true]);
    });
  });
});
