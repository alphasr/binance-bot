// Unit tests for BinanceFuturesService
import { MockBinanceFuturesService } from '../mocks/MockBinanceService';
import {
  mockPriceData,
  mockAccountInfo,
  mockPositionData,
} from '../mocks/mockData';

describe('BinanceFuturesService', () => {
  let binanceService: MockBinanceFuturesService;

  beforeEach(() => {
    binanceService = new MockBinanceFuturesService();
  });

  afterEach(() => {
    binanceService.clearMockData();
  });

  describe('initialization', () => {
    test('should initialize successfully', async () => {
      await expect(binanceService.initialize()).resolves.not.toThrow();
    });

    test('should set leverage successfully', async () => {
      await expect(
        binanceService.setLeverage('BTCUSDT', 10)
      ).resolves.not.toThrow();
    });

    test('should set margin type successfully', async () => {
      await expect(
        binanceService.setMarginType('BTCUSDT', 'ISOLATED')
      ).resolves.not.toThrow();
    });

    test('should test connectivity successfully', async () => {
      const result = await binanceService.testConnectivity();
      expect(result).toEqual({ code: 200, msg: 'success' });
    });
  });

  describe('price data', () => {
    test('should get current price for BTCUSDT', async () => {
      const price = await binanceService.getCurrentPrice('BTCUSDT');
      expect(price).toBe(mockPriceData.BTCUSDT);
      expect(typeof price).toBe('number');
      expect(price).toBeGreaterThan(0);
    });

    test('should get current price for ETHUSDT', async () => {
      const price = await binanceService.getCurrentPrice('ETHUSDT');
      expect(price).toBe(mockPriceData.ETHUSDT);
    });

    test('should return default price for unknown symbol', async () => {
      const price = await binanceService.getCurrentPrice('UNKNOWN');
      expect(price).toBe(42000.5);
    });
  });

  describe('account information', () => {
    test('should get account info', async () => {
      const accountInfo = await binanceService.getAccountInfo();
      expect(accountInfo).toEqual(mockAccountInfo);
      expect(accountInfo.canTrade).toBe(true);
      expect(accountInfo.totalWalletBalance).toBe('1000.00000000');
    });

    test('should get all positions', async () => {
      const positions = await binanceService.getPositions();
      expect(positions).toEqual(mockPositionData);
      expect(Array.isArray(positions)).toBe(true);
    });

    test('should get positions for specific symbol', async () => {
      const positions = await binanceService.getPositions('BTCUSDT');
      expect(positions).toHaveLength(1);
      expect(positions[0].symbol).toBe('BTCUSDT');
    });
  });

  describe('order management', () => {
    test('should place market buy order', async () => {
      const orderParams = {
        symbol: 'BTCUSDT',
        side: 'BUY' as const,
        type: 'MARKET' as const,
        quantity: '0.024',
      };

      const result = await binanceService.placeMarketOrder(orderParams);

      expect(result.symbol).toBe('BTCUSDT');
      expect(result.side).toBe('BUY');
      expect(result.type).toBe('MARKET');
      expect(result.quantity).toBe('0.024');
      expect(result.orderId).toBeDefined();
      expect(typeof result.orderId).toBe('number');
    });

    test('should place market sell order', async () => {
      const orderParams = {
        symbol: 'BTCUSDT',
        side: 'SELL' as const,
        type: 'MARKET' as const,
        quantity: '0.024',
      };

      const result = await binanceService.placeMarketOrder(orderParams);

      expect(result.symbol).toBe('BTCUSDT');
      expect(result.side).toBe('SELL');
      expect(result.type).toBe('MARKET');
    });

    test('should place limit order', async () => {
      const orderParams = {
        symbol: 'BTCUSDT',
        side: 'BUY' as const,
        type: 'LIMIT' as const,
        quantity: '0.024',
        price: '41000.00',
      };

      const result = await binanceService.placeLimitOrder(orderParams);

      expect(result.symbol).toBe('BTCUSDT');
      expect(result.type).toBe('LIMIT');
      expect(result.status).toBe('NEW');
    });

    test('should place stop order', async () => {
      const orderParams = {
        symbol: 'BTCUSDT',
        side: 'SELL' as const,
        type: 'STOP_MARKET' as const,
        quantity: '0.024',
        stopPrice: '43000.00',
      };

      const result = await binanceService.placeStopOrder(orderParams);

      expect(result.symbol).toBe('BTCUSDT');
      expect(result.type).toBe('STOP_MARKET');
      expect(result.status).toBe('NEW');
    });

    test('should cancel order', async () => {
      // First place an order
      const orderParams = {
        symbol: 'BTCUSDT',
        side: 'BUY' as const,
        type: 'LIMIT' as const,
        quantity: '0.024',
        price: '41000.00',
      };

      const order = await binanceService.placeLimitOrder(orderParams);

      // Then cancel it
      const cancelResult = await binanceService.cancelOrder(
        'BTCUSDT',
        order.orderId
      );
      expect(cancelResult.status).toBe('CANCELED');
    });

    test('should cancel all orders for symbol', async () => {
      // Place multiple orders
      const orderParams1 = {
        symbol: 'BTCUSDT',
        side: 'BUY' as const,
        type: 'LIMIT' as const,
        quantity: '0.024',
        price: '41000.00',
      };

      const orderParams2 = {
        symbol: 'BTCUSDT',
        side: 'SELL' as const,
        type: 'LIMIT' as const,
        quantity: '0.024',
        price: '43000.00',
      };

      await binanceService.placeLimitOrder(orderParams1);
      await binanceService.placeLimitOrder(orderParams2);

      // Cancel all orders
      const canceledOrders = await binanceService.cancelAllOrders('BTCUSDT');
      expect(canceledOrders).toHaveLength(2);
      canceledOrders.forEach((order) => {
        expect(order.status).toBe('CANCELED');
      });
    });
  });

  describe('position management', () => {
    test('should close all positions for symbol', async () => {
      const closedPositions = await binanceService.closeAllPositions('BTCUSDT');
      expect(Array.isArray(closedPositions)).toBe(true);

      // Check that position was reset
      const positions = await binanceService.getPositions('BTCUSDT');
      expect(positions[0].positionAmt).toBe('0');
    });
  });

  describe('market data', () => {
    test('should get klines data', async () => {
      const klines = await binanceService.getKlines('BTCUSDT', '1h', 100);
      expect(Array.isArray(klines)).toBe(true);
      expect(klines.length).toBeGreaterThan(0);

      // Check kline structure
      const kline = klines[0];
      expect(Array.isArray(kline)).toBe(true);
      expect(kline).toHaveLength(12);
      expect(typeof kline[0]).toBe('number'); // Open time
      expect(typeof kline[1]).toBe('string'); // Open price
    });
  });

  describe('mock data integrity', () => {
    test('should track orders correctly', async () => {
      const initialOrders = binanceService.getMockOrders().length;

      await binanceService.placeMarketOrder({
        symbol: 'BTCUSDT',
        side: 'BUY',
        type: 'MARKET',
        quantity: '0.024',
      });

      const orders = binanceService.getMockOrders();
      expect(orders).toHaveLength(initialOrders + 1);
    });

    test('should update positions after orders', async () => {
      const initialPosition = binanceService
        .getMockPositions()
        .find((p) => p.symbol === 'BTCUSDT');
      const initialQty = parseFloat(initialPosition?.positionAmt || '0');

      await binanceService.placeMarketOrder({
        symbol: 'BTCUSDT',
        side: 'BUY',
        type: 'MARKET',
        quantity: '0.050',
      });

      const updatedPosition = binanceService
        .getMockPositions()
        .find((p) => p.symbol === 'BTCUSDT');
      const updatedQty = parseFloat(updatedPosition?.positionAmt || '0');

      expect(updatedQty).toBe(initialQty + 0.05);
    });

    test('should clear mock data properly', () => {
      binanceService.clearMockData();
      expect(binanceService.getMockOrders()).toHaveLength(0);
      expect(binanceService.getMockPositions()).toEqual(mockPositionData);
    });
  });
});
