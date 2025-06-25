// Unit tests for Configuration
import { config, binanceConfig } from '../../src/config/config';

describe('Configuration', () => {
  // Store original env vars to restore later
  const originalEnv = process.env;

  beforeEach(() => {
    // Clear environment variables
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('trading configuration', () => {
    test('should use default values when environment variables are not set', () => {
      // Clear all relevant env vars
      delete process.env.SYMBOL;
      delete process.env.LEVERAGE;
      delete process.env.TRADE_AMOUNT_USDT;
      delete process.env.STOP_LOSS_POINTS;
      delete process.env.TAKE_PROFIT_POINTS;
      delete process.env.TIMEZONE;

      // Re-import config to get fresh values
      jest.resetModules();
      const { config: freshConfig } = require('../../src/config/config');

      expect(freshConfig.symbol).toBe('BTCUSDT');
      expect(freshConfig.leverage).toBe(10);
      expect(freshConfig.tradeAmount).toBe(100);
      expect(freshConfig.stopLossPoints).toBe(500);
      expect(freshConfig.takeProfitPoints).toBe(500);
      expect(freshConfig.timezone).toBe('Europe/Prague');
    });

    test('should use environment variables when provided', () => {
      process.env.SYMBOL = 'ETHUSDT';
      process.env.LEVERAGE = '20';
      process.env.TRADE_AMOUNT_USDT = '200';
      process.env.STOP_LOSS_POINTS = '1000';
      process.env.TAKE_PROFIT_POINTS = '1500';
      process.env.TIMEZONE = 'America/New_York';

      jest.resetModules();
      const { config: freshConfig } = require('../../src/config/config');

      expect(freshConfig.symbol).toBe('ETHUSDT');
      expect(freshConfig.leverage).toBe(20);
      expect(freshConfig.tradeAmount).toBe(200);
      expect(freshConfig.stopLossPoints).toBe(1000);
      expect(freshConfig.takeProfitPoints).toBe(1500);
      expect(freshConfig.timezone).toBe('America/New_York');
    });

    test('should handle invalid numeric environment variables', () => {
      process.env.LEVERAGE = 'invalid';
      process.env.TRADE_AMOUNT_USDT = 'not_a_number';
      process.env.STOP_LOSS_POINTS = '';

      jest.resetModules();
      const { config: freshConfig } = require('../../src/config/config');

      expect(freshConfig.leverage).toBe(10); // Default fallback
      expect(freshConfig.tradeAmount).toBe(100); // Default fallback
      expect(freshConfig.stopLossPoints).toBe(500); // Default fallback
    });

    test('should handle edge case numeric values', () => {
      process.env.LEVERAGE = '0';
      process.env.TRADE_AMOUNT_USDT = '-100';
      process.env.STOP_LOSS_POINTS = '99999';

      jest.resetModules();
      const { config: freshConfig } = require('../../src/config/config');

      expect(freshConfig.leverage).toBe(0);
      expect(freshConfig.tradeAmount).toBe(-100);
      expect(freshConfig.stopLossPoints).toBe(99999);
    });
  });

  describe('binance configuration', () => {
    test('should use empty strings when API credentials are not provided', () => {
      delete process.env.BINANCE_API_KEY;
      delete process.env.BINANCE_API_SECRET;

      jest.resetModules();
      const {
        binanceConfig: freshBinanceConfig,
      } = require('../../src/config/config');

      expect(freshBinanceConfig.apiKey).toBe('');
      expect(freshBinanceConfig.apiSecret).toBe('');
      expect(freshBinanceConfig.baseURL).toBe('https://fapi.binance.com');
    });

    test('should use provided API credentials', () => {
      process.env.BINANCE_API_KEY = 'test_api_key_123';
      process.env.BINANCE_API_SECRET = 'test_api_secret_456';

      jest.resetModules();
      const {
        binanceConfig: freshBinanceConfig,
      } = require('../../src/config/config');

      expect(freshBinanceConfig.apiKey).toBe('test_api_key_123');
      expect(freshBinanceConfig.apiSecret).toBe('test_api_secret_456');
      expect(freshBinanceConfig.baseURL).toBe('https://fapi.binance.com');
    });

    test('should always use correct Binance Futures base URL', () => {
      jest.resetModules();
      const {
        binanceConfig: freshBinanceConfig,
      } = require('../../src/config/config');

      expect(freshBinanceConfig.baseURL).toBe('https://fapi.binance.com');
    });
  });

  describe('configuration validation', () => {
    test('should have valid symbol format', () => {
      expect(config.symbol).toMatch(/^[A-Z]+USDT$/);
    });

    test('should have reasonable leverage limits', () => {
      expect(config.leverage).toBeGreaterThan(0);
      expect(config.leverage).toBeLessThanOrEqual(125); // Binance max leverage
    });

    test('should have positive trade amount', () => {
      expect(config.tradeAmount).toBeGreaterThan(0);
    });

    test('should have positive stop loss and take profit points', () => {
      expect(config.stopLossPoints).toBeGreaterThan(0);
      expect(config.takeProfitPoints).toBeGreaterThan(0);
    });

    test('should have valid timezone format', () => {
      // Check if timezone is a valid IANA timezone
      expect(() => {
        new Date().toLocaleString('en-US', { timeZone: config.timezone });
      }).not.toThrow();
    });
  });

  describe('type safety', () => {
    test('should have correct types for all config properties', () => {
      expect(typeof config.symbol).toBe('string');
      expect(typeof config.leverage).toBe('number');
      expect(typeof config.tradeAmount).toBe('number');
      expect(typeof config.stopLossPoints).toBe('number');
      expect(typeof config.takeProfitPoints).toBe('number');
      expect(typeof config.timezone).toBe('string');
    });

    test('should have correct types for binance config properties', () => {
      expect(typeof binanceConfig.apiKey).toBe('string');
      expect(typeof binanceConfig.apiSecret).toBe('string');
      expect(typeof binanceConfig.baseURL).toBe('string');
    });
  });

  describe('environment variable parsing', () => {
    test('should correctly parse integer values', () => {
      process.env.LEVERAGE = '15';
      process.env.STOP_LOSS_POINTS = '750';

      jest.resetModules();
      const { config: freshConfig } = require('../../src/config/config');

      expect(freshConfig.leverage).toBe(15);
      expect(freshConfig.stopLossPoints).toBe(750);
      expect(Number.isInteger(freshConfig.leverage)).toBe(true);
      expect(Number.isInteger(freshConfig.stopLossPoints)).toBe(true);
    });

    test('should correctly parse float values', () => {
      process.env.TRADE_AMOUNT_USDT = '150.50';

      jest.resetModules();
      const { config: freshConfig } = require('../../src/config/config');

      expect(freshConfig.tradeAmount).toBe(150.5);
      expect(typeof freshConfig.tradeAmount).toBe('number');
    });

    test('should handle string trimming', () => {
      process.env.SYMBOL = '  ETHUSDT  ';
      process.env.TIMEZONE = '  Europe/London  ';

      jest.resetModules();
      const { config: freshConfig } = require('../../src/config/config');

      expect(freshConfig.symbol).toBe('ETHUSDT');
      expect(freshConfig.timezone).toBe('Europe/London');
    });
  });
});
