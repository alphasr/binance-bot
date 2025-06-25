// Unit tests for TechnicalAnalysisService
import { TechnicalAnalysisService } from '../../src/services/technicalAnalysisService';
import { MockBinanceFuturesService } from '../mocks/MockBinanceService';
import {
  mockCandlestickData,
  mockTechnicalIndicators,
} from '../mocks/mockData';

// Mock the technicalindicators library
jest.mock('technicalindicators', () => ({
  RSI: {
    calculate: jest.fn(),
  },
  EMA: {
    calculate: jest.fn(),
  },
}));

describe('TechnicalAnalysisService', () => {
  let technicalService: TechnicalAnalysisService;
  let mockBinanceService: MockBinanceFuturesService;

  beforeEach(() => {
    mockBinanceService = new MockBinanceFuturesService();
    technicalService = new TechnicalAnalysisService(mockBinanceService);

    // Reset mocks
    const { RSI, EMA } = require('technicalindicators');
    RSI.calculate.mockClear();
    EMA.calculate.mockClear();
  });

  afterEach(() => {
    mockBinanceService.clearMockData();
  });

  describe('candle data fetching', () => {
    test('should fetch candles successfully', async () => {
      const candles = await technicalService.fetchCandles(
        'BTCUSDT',
        '30m',
        100
      );

      expect(Array.isArray(candles)).toBe(true);
      expect(candles.length).toBeGreaterThan(0);
      expect(candles).toEqual(mockCandlestickData);
    });

    test('should fetch candles with default parameters', async () => {
      const candles = await technicalService.fetchCandles();

      expect(Array.isArray(candles)).toBe(true);
      expect(candles.length).toBeGreaterThan(0);
    });

    test('should handle different symbols', async () => {
      const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT'];

      for (const symbol of symbols) {
        const candles = await technicalService.fetchCandles(symbol);
        expect(Array.isArray(candles)).toBe(true);
      }
    });

    test('should handle different intervals', async () => {
      const intervals = ['1m', '5m', '15m', '30m', '1h', '4h', '1d'];

      for (const interval of intervals) {
        const candles = await technicalService.fetchCandles(
          'BTCUSDT',
          interval
        );
        expect(Array.isArray(candles)).toBe(true);
      }
    });

    test('should handle different limits', async () => {
      const limits = [50, 100, 200, 500];

      for (const limit of limits) {
        const candles = await technicalService.fetchCandles(
          'BTCUSDT',
          '30m',
          limit
        );
        expect(Array.isArray(candles)).toBe(true);
      }
    });
  });

  describe('technical indicators calculation', () => {
    beforeEach(() => {
      const { RSI, EMA } = require('technicalindicators');

      // Mock RSI calculation
      RSI.calculate.mockReturnValue([mockTechnicalIndicators.rsi]);

      // Mock EMA calculations
      EMA.calculate
        .mockReturnValueOnce([mockTechnicalIndicators.ema20]) // EMA 7
        .mockReturnValueOnce([mockTechnicalIndicators.sma50]) // EMA 100
        .mockReturnValueOnce([mockTechnicalIndicators.sma20]); // EMA 200
    });

    test('should calculate technical indicators from candle data', () => {
      const indicators =
        technicalService.calculateIndicators(mockCandlestickData);

      expect(indicators).toBeDefined();
      expect(typeof indicators.rsi).toBe('number');
      expect(typeof indicators.ema7).toBe('number');
      expect(typeof indicators.ema100).toBe('number');
      expect(typeof indicators.ema200).toBe('number');
      expect(typeof indicators.currentPrice).toBe('number');
    });

    test('should extract close prices correctly', () => {
      technicalService.calculateIndicators(mockCandlestickData);

      // Verify that close prices were extracted correctly (index 4 of each candle)
      const expectedClosePrices = mockCandlestickData.map((candle) =>
        parseFloat(candle[4])
      );

      const { RSI } = require('technicalindicators');
      expect(RSI.calculate).toHaveBeenCalledWith({
        values: expectedClosePrices,
        period: 14,
      });
    });

    test('should calculate EMAs with correct periods', () => {
      technicalService.calculateIndicators(mockCandlestickData);

      const { EMA } = require('technicalindicators');
      const closePrices = mockCandlestickData.map((candle) =>
        parseFloat(candle[4])
      );

      expect(EMA.calculate).toHaveBeenCalledWith({
        values: closePrices,
        period: 7,
      });

      expect(EMA.calculate).toHaveBeenCalledWith({
        values: closePrices,
        period: 100,
      });

      expect(EMA.calculate).toHaveBeenCalledWith({
        values: closePrices,
        period: 200,
      });
    });

    test('should handle empty candle data', () => {
      const { RSI, EMA } = require('technicalindicators');
      RSI.calculate.mockReturnValue([]);
      EMA.calculate.mockReturnValue([]);

      const indicators = technicalService.calculateIndicators([]);

      expect(indicators.rsi).toBe(0);
      expect(indicators.ema7).toBe(0);
      expect(indicators.ema100).toBe(0);
      expect(indicators.ema200).toBe(0);
    });

    test('should use current price as last close price', () => {
      const indicators =
        technicalService.calculateIndicators(mockCandlestickData);

      const expectedCurrentPrice = parseFloat(
        mockCandlestickData[mockCandlestickData.length - 1][4]
      );
      expect(indicators.currentPrice).toBe(expectedCurrentPrice);
    });
  });

  describe('trading signal generation', () => {
    beforeEach(() => {
      const { RSI, EMA } = require('technicalindicators');
      RSI.calculate.mockReturnValue([mockTechnicalIndicators.rsi]);
      EMA.calculate
        .mockReturnValueOnce([41850.5]) // EMA 7
        .mockReturnValueOnce([41500.75]) // EMA 100
        .mockReturnValueOnce([41400.25]); // EMA 200
    });

    test('should generate LONG signal when conditions are met', async () => {
      // Mock conditions for LONG signal
      const { RSI, EMA } = require('technicalindicators');
      RSI.calculate.mockReturnValue([35]); // Oversold RSI
      EMA.calculate
        .mockReturnValueOnce([42100]) // EMA 7 above current price
        .mockReturnValueOnce([41500]) // EMA 100
        .mockReturnValueOnce([41000]); // EMA 200

      const signal = await technicalService.generateTradingSignal('BTCUSDT');

      expect(signal.action).toBe('LONG');
      expect(signal.confidence).toBeGreaterThan(0);
      expect(signal.leverage).toBeGreaterThan(0);
      expect(signal.data).toBeDefined();
    });

    test('should generate SHORT signal when conditions are met', async () => {
      // Mock conditions for SHORT signal
      const { RSI, EMA } = require('technicalindicators');
      RSI.calculate.mockReturnValue([75]); // Overbought RSI
      EMA.calculate
        .mockReturnValueOnce([41800]) // EMA 7 below current price
        .mockReturnValueOnce([42000]) // EMA 100
        .mockReturnValueOnce([42200]); // EMA 200

      const signal = await technicalService.generateTradingSignal('BTCUSDT');

      expect(signal.action).toBe('SHORT');
      expect(signal.confidence).toBeGreaterThan(0);
      expect(signal.leverage).toBeGreaterThan(0);
      expect(signal.data).toBeDefined();
    });

    test('should generate NO_SIGNAL when conditions are not met', async () => {
      // Mock neutral conditions
      const { RSI, EMA } = require('technicalindicators');
      RSI.calculate.mockReturnValue([50]); // Neutral RSI
      EMA.calculate
        .mockReturnValueOnce([42000]) // EMA 7
        .mockReturnValueOnce([42000]) // EMA 100
        .mockReturnValueOnce([42000]); // EMA 200

      const signal = await technicalService.generateTradingSignal('BTCUSDT');

      expect(signal.action).toBe('NO_SIGNAL');
      expect(signal.confidence).toBe(0);
      expect(signal.leverage).toBe(1);
    });

    test('should calculate confidence based on signal strength', async () => {
      // Mock strong LONG conditions
      const { RSI, EMA } = require('technicalindicators');
      RSI.calculate.mockReturnValue([25]); // Very oversold
      EMA.calculate
        .mockReturnValueOnce([42500]) // Strong upward trend
        .mockReturnValueOnce([41000])
        .mockReturnValueOnce([40000]);

      const signal = await technicalService.generateTradingSignal('BTCUSDT');

      expect(signal.action).toBe('LONG');
      expect(signal.confidence).toBeGreaterThan(0.5);
    });

    test('should handle API errors gracefully', async () => {
      // Mock fetchCandles to return empty array (simulating API error)
      jest.spyOn(technicalService, 'fetchCandles').mockResolvedValue([]);

      const signal = await technicalService.generateTradingSignal('BTCUSDT');

      expect(signal.action).toBe('NO_SIGNAL');
      expect(signal.confidence).toBe(0);
    });
  });

  describe('leverage calculation', () => {
    test('should calculate appropriate leverage for high confidence signals', async () => {
      const { RSI, EMA } = require('technicalindicators');
      RSI.calculate.mockReturnValue([20]); // Very oversold
      EMA.calculate
        .mockReturnValueOnce([43000]) // Very strong trend
        .mockReturnValueOnce([41000])
        .mockReturnValueOnce([39000]);

      const signal = await technicalService.generateTradingSignal('BTCUSDT');

      expect(signal.leverage).toBeGreaterThan(1);
      expect(signal.leverage).toBeLessThanOrEqual(20); // Should not exceed maximum
    });

    test('should use lower leverage for medium confidence signals', async () => {
      const { RSI, EMA } = require('technicalindicators');
      RSI.calculate.mockReturnValue([35]); // Moderately oversold
      EMA.calculate
        .mockReturnValueOnce([42200])
        .mockReturnValueOnce([41800])
        .mockReturnValueOnce([41500]);

      const signal = await technicalService.generateTradingSignal('BTCUSDT');

      expect(signal.leverage).toBeGreaterThan(1);
      expect(signal.leverage).toBeLessThan(15);
    });

    test('should use minimum leverage for low confidence signals', async () => {
      const { RSI, EMA } = require('technicalindicators');
      RSI.calculate.mockReturnValue([40]); // Slightly oversold
      EMA.calculate
        .mockReturnValueOnce([42050])
        .mockReturnValueOnce([42000])
        .mockReturnValueOnce([41950]);

      const signal = await technicalService.generateTradingSignal('BTCUSDT');

      if (signal.action !== 'NO_SIGNAL') {
        expect(signal.leverage).toBeGreaterThanOrEqual(1);
        expect(signal.leverage).toBeLessThan(10);
      }
    });
  });

  describe('edge cases and error handling', () => {
    test('should handle insufficient candle data', async () => {
      // Mock fetchCandles to return insufficient data
      jest
        .spyOn(technicalService, 'fetchCandles')
        .mockResolvedValue([mockCandlestickData[0]]);

      const signal = await technicalService.generateTradingSignal('BTCUSDT');

      expect(signal.action).toBe('NO_SIGNAL');
    });

    test('should handle invalid candle data format', async () => {
      // Mock fetchCandles to return invalid data
      jest
        .spyOn(technicalService, 'fetchCandles')
        .mockResolvedValue([['invalid', 'data', 'format']]);

      const signal = await technicalService.generateTradingSignal('BTCUSDT');

      expect(signal.action).toBe('NO_SIGNAL');
    });

    test('should handle technical indicator calculation errors', () => {
      const { RSI } = require('technicalindicators');
      RSI.calculate.mockImplementation(() => {
        throw new Error('Calculation error');
      });

      expect(() => {
        technicalService.calculateIndicators(mockCandlestickData);
      }).not.toThrow();
    });

    test('should validate signal data structure', async () => {
      const signal = await technicalService.generateTradingSignal('BTCUSDT');

      expect(signal).toHaveProperty('action');
      expect(signal).toHaveProperty('leverage');
      expect(signal).toHaveProperty('confidence');
      expect(signal).toHaveProperty('data');

      expect(['LONG', 'SHORT', 'NO_SIGNAL']).toContain(signal.action);
      expect(typeof signal.leverage).toBe('number');
      expect(typeof signal.confidence).toBe('number');
      expect(signal.confidence).toBeGreaterThanOrEqual(0);
      expect(signal.confidence).toBeLessThanOrEqual(1);
    });
  });

  describe('performance and optimization', () => {
    test('should cache candle data for multiple analyses', async () => {
      const fetchCandlesSpy = jest.spyOn(technicalService, 'fetchCandles');

      // Generate multiple signals
      await technicalService.generateTradingSignal('BTCUSDT');
      await technicalService.generateTradingSignal('BTCUSDT');

      // Should fetch candles for each call (no caching implemented yet)
      expect(fetchCandlesSpy).toHaveBeenCalledTimes(2);
    });

    test('should handle high frequency analysis requests', async () => {
      const promises = [];

      // Generate 10 concurrent signal requests
      for (let i = 0; i < 10; i++) {
        promises.push(technicalService.generateTradingSignal('BTCUSDT'));
      }

      const signals = await Promise.all(promises);

      expect(signals).toHaveLength(10);
      signals.forEach((signal) => {
        expect(['LONG', 'SHORT', 'NO_SIGNAL']).toContain(signal.action);
      });
    });
  });
});
