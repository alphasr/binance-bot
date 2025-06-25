// Integration tests for Trading Bot
import { TradingService } from '../../src/services/tradingService';
import { MockBinanceFuturesService } from '../mocks/MockBinanceService';
import { MockTelegramService } from '../mocks/MockTelegramService';
import { TradeSignal } from '../../src/types/trading';

// Mock the telegram service import for integration testing
jest.mock('../../src/services/telegramService', () => ({
  telegramService:
    new (require('../mocks/MockTelegramService').MockTelegramService)(),
}));

describe('Trading Bot Integration Tests', () => {
  let tradingService: TradingService;
  let mockBinanceService: MockBinanceFuturesService;
  let mockTelegramService: MockTelegramService;

  beforeEach(() => {
    mockBinanceService = new MockBinanceFuturesService();
    tradingService = new TradingService(mockBinanceService as any);
    mockTelegramService = new MockTelegramService();

    // Replace the mocked telegram service with our test instance
    const { telegramService } = require('../../src/services/telegramService');
    Object.assign(telegramService, mockTelegramService);
  });

  afterEach(() => {
    mockBinanceService.clearMockData();
    mockTelegramService.clearMessages();
    mockTelegramService.setShouldFail(false);
  });

  describe('End-to-End Trading Flow', () => {
    test('should execute complete buy trade flow with notifications', async () => {
      const signal: TradeSignal = {
        symbol: 'BTCUSDT',
        action: 'BUY',
        reason: 'Integration test buy signal',
        confidence: 0.85,
      };

      // Execute the complete trading flow
      await tradingService.executeTradeSignal(signal);

      // Verify all orders were placed
      const orders = mockBinanceService.getMockOrders();
      expect(orders.length).toBe(3); // Market order + Stop loss + Take profit

      // Verify market order
      const marketOrder = orders.find((order) => order.type === 'MARKET');
      expect(marketOrder).toBeDefined();
      expect(marketOrder.symbol).toBe('BTCUSDT');
      expect(marketOrder.side).toBe('BUY');

      // Verify stop loss order
      const stopLossOrder = orders.find(
        (order) => order.type === 'STOP_MARKET'
      );
      expect(stopLossOrder).toBeDefined();
      expect(stopLossOrder.side).toBe('SELL');

      // Verify take profit order
      const takeProfitOrder = orders.find(
        (order) => order.type === 'TAKE_PROFIT_MARKET'
      );
      expect(takeProfitOrder).toBeDefined();
      expect(takeProfitOrder.side).toBe('SELL');

      // Verify Telegram notifications were sent
      expect(mockTelegramService.getMessageCount()).toBeGreaterThan(0);
      const messages = mockTelegramService.getSentMessages();
      const tradeAlert = messages.find((msg) =>
        msg.text.includes('Trade Alert')
      );
      expect(tradeAlert).toBeDefined();
      expect(tradeAlert.text).toContain('BUY');
      expect(tradeAlert.text).toContain('BTCUSDT');
    });

    test('should execute complete sell trade flow with notifications', async () => {
      const signal: TradeSignal = {
        symbol: 'ETHUSDT',
        action: 'SELL',
        reason: 'Integration test sell signal',
        confidence: 0.75,
      };

      await tradingService.executeTradeSignal(signal);

      // Verify all orders were placed correctly for sell position
      const orders = mockBinanceService.getMockOrders();
      expect(orders.length).toBe(3);

      const marketOrder = orders.find((order) => order.type === 'MARKET');
      expect(marketOrder.side).toBe('SELL');

      const stopLossOrder = orders.find(
        (order) => order.type === 'STOP_MARKET'
      );
      expect(stopLossOrder.side).toBe('BUY'); // Stop loss for sell position

      const takeProfitOrder = orders.find(
        (order) => order.type === 'TAKE_PROFIT_MARKET'
      );
      expect(takeProfitOrder.side).toBe('BUY'); // Take profit for sell position

      // Verify notifications
      const messages = mockTelegramService.getSentMessages();
      const tradeAlert = messages.find((msg) =>
        msg.text.includes('Trade Alert')
      );
      expect(tradeAlert.text).toContain('SELL');
      expect(tradeAlert.text).toContain('ETHUSDT');
    });

    test('should handle multiple consecutive trades', async () => {
      const signals: TradeSignal[] = [
        {
          symbol: 'BTCUSDT',
          action: 'BUY',
          reason: 'First trade',
          confidence: 0.8,
        },
        {
          symbol: 'BTCUSDT',
          action: 'SELL',
          reason: 'Second trade',
          confidence: 0.7,
        },
        {
          symbol: 'ETHUSDT',
          action: 'BUY',
          reason: 'Third trade',
          confidence: 0.9,
        },
      ];

      for (const signal of signals) {
        mockBinanceService.clearMockData(); // Clear between trades
        mockTelegramService.clearMessages();

        await tradingService.executeTradeSignal(signal);

        // Verify each trade was executed
        const orders = mockBinanceService.getMockOrders();
        expect(orders.length).toBe(3);

        const marketOrder = orders.find((order) => order.type === 'MARKET');
        expect(marketOrder.symbol).toBe(signal.symbol);
        expect(marketOrder.side).toBe(signal.action);

        // Verify notification for each trade
        expect(mockTelegramService.getMessageCount()).toBeGreaterThan(0);
      }
    });
  });

  describe('Error Recovery and Resilience', () => {
    test('should handle Binance API errors gracefully', async () => {
      // Mock Binance service to fail on first order placement
      const originalPlaceMarketOrder = mockBinanceService.placeMarketOrder;
      let callCount = 0;
      mockBinanceService.placeMarketOrder = jest
        .fn()
        .mockImplementation((...args) => {
          callCount++;
          if (callCount === 1) {
            throw new Error('Temporary API error');
          }
          return originalPlaceMarketOrder.apply(mockBinanceService, args);
        });

      const signal: TradeSignal = {
        symbol: 'BTCUSDT',
        action: 'BUY',
        reason: 'Error recovery test',
        confidence: 0.8,
      };

      // First attempt should fail
      await expect(tradingService.executeTradeSignal(signal)).rejects.toThrow(
        'Temporary API error'
      );

      // Verify error notification was sent
      const messages = mockTelegramService.getSentMessages();
      const errorAlert = messages.find((msg) => msg.text.includes('Error'));
      expect(errorAlert).toBeDefined();

      // Reset for retry
      mockBinanceService.clearMockData();
      mockTelegramService.clearMessages();

      // Second attempt should succeed
      await expect(
        tradingService.executeTradeSignal(signal)
      ).resolves.not.toThrow();

      const orders = mockBinanceService.getMockOrders();
      expect(orders.length).toBe(3);

      // Restore original method
      mockBinanceService.placeMarketOrder = originalPlaceMarketOrder;
    });

    test('should continue trading even if Telegram notifications fail', async () => {
      mockTelegramService.setShouldFail(true);

      const signal: TradeSignal = {
        symbol: 'BTCUSDT',
        action: 'BUY',
        reason: 'Telegram failure test',
        confidence: 0.8,
      };

      // Trade should still execute successfully
      await expect(
        tradingService.executeTradeSignal(signal)
      ).resolves.not.toThrow();

      // Verify orders were placed despite Telegram failure
      const orders = mockBinanceService.getMockOrders();
      expect(orders.length).toBe(3);

      // Verify no Telegram messages were sent
      expect(mockTelegramService.getMessageCount()).toBe(0);
    });

    test('should handle position closure errors gracefully', async () => {
      // Mock closeAllPositions to fail
      const originalCloseAllPositions = mockBinanceService.closeAllPositions;
      mockBinanceService.closeAllPositions = jest
        .fn()
        .mockRejectedValue(new Error('Position closure failed'));

      const signal: TradeSignal = {
        symbol: 'BTCUSDT',
        action: 'BUY',
        reason: 'Position closure error test',
        confidence: 0.8,
      };

      // Should handle the error and still attempt to place new orders
      await expect(tradingService.executeTradeSignal(signal)).rejects.toThrow();

      // Restore original method
      mockBinanceService.closeAllPositions = originalCloseAllPositions;
    });
  });

  describe('Risk Management Integration', () => {
    test('should calculate appropriate position sizes based on account balance', async () => {
      const signal: TradeSignal = {
        symbol: 'BTCUSDT',
        action: 'BUY',
        reason: 'Position sizing test',
        confidence: 0.8,
      };

      await tradingService.executeTradeSignal(signal);

      const orders = mockBinanceService.getMockOrders();
      const marketOrder = orders.find((order) => order.type === 'MARKET');

      // Verify quantity is reasonable (not too large for account)
      const quantity = parseFloat(marketOrder.quantity);
      expect(quantity).toBeGreaterThan(0);
      expect(quantity).toBeLessThan(1); // Should be reasonable for test account
    });

    test('should set appropriate stop loss and take profit levels', async () => {
      const signal: TradeSignal = {
        symbol: 'BTCUSDT',
        action: 'BUY',
        reason: 'Risk management test',
        confidence: 0.8,
      };

      const currentPrice = await mockBinanceService.getCurrentPrice('BTCUSDT');

      await tradingService.executeTradeSignal(signal);

      const orders = mockBinanceService.getMockOrders();
      const stopLossOrder = orders.find(
        (order) => order.type === 'STOP_MARKET'
      );
      const takeProfitOrder = orders.find(
        (order) => order.type === 'TAKE_PROFIT_MARKET'
      );

      // Verify stop loss is below entry price for BUY order
      const stopPrice = parseFloat(stopLossOrder.stopPrice);
      expect(stopPrice).toBeLessThan(currentPrice);
      expect(stopPrice).toBe(currentPrice - 500); // STOP_LOSS_POINTS = 500

      // Verify take profit is above entry price for BUY order
      const takeProfitPrice = parseFloat(takeProfitOrder.stopPrice);
      expect(takeProfitPrice).toBeGreaterThan(currentPrice);
      expect(takeProfitPrice).toBe(currentPrice + 500); // TAKE_PROFIT_POINTS = 500
    });
  });

  describe('Performance and Timing', () => {
    test('should execute trades within reasonable time limits', async () => {
      const signal: TradeSignal = {
        symbol: 'BTCUSDT',
        action: 'BUY',
        reason: 'Performance test',
        confidence: 0.8,
      };

      const startTime = Date.now();
      await tradingService.executeTradeSignal(signal);
      const endTime = Date.now();

      const executionTime = endTime - startTime;
      expect(executionTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    test('should handle concurrent trade signals appropriately', async () => {
      const signals: TradeSignal[] = [
        {
          symbol: 'BTCUSDT',
          action: 'BUY',
          reason: 'Concurrent test 1',
          confidence: 0.8,
        },
        {
          symbol: 'ETHUSDT',
          action: 'SELL',
          reason: 'Concurrent test 2',
          confidence: 0.7,
        },
      ];

      // Execute signals concurrently
      const promises = signals.map((signal) =>
        tradingService.executeTradeSignal(signal)
      );

      await expect(Promise.all(promises)).resolves.not.toThrow();

      // Both trades should have been executed
      const orders = mockBinanceService.getMockOrders();
      expect(orders.length).toBe(6); // 3 orders per signal * 2 signals

      const btcOrders = orders.filter((order) => order.symbol === 'BTCUSDT');
      const ethOrders = orders.filter((order) => order.symbol === 'ETHUSDT');

      expect(btcOrders).toHaveLength(3);
      expect(ethOrders).toHaveLength(3);
    });
  });

  describe('Data Consistency and State Management', () => {
    test('should maintain consistent position state across operations', async () => {
      // Get initial positions
      const initialPositions = await mockBinanceService.getPositions('BTCUSDT');
      const initialBtcPosition = initialPositions.find(
        (p) => p.symbol === 'BTCUSDT'
      );
      const initialQuantity = parseFloat(
        initialBtcPosition?.positionAmt || '0'
      );

      const signal: TradeSignal = {
        symbol: 'BTCUSDT',
        action: 'BUY',
        reason: 'State consistency test',
        confidence: 0.8,
      };

      await tradingService.executeTradeSignal(signal);

      // Check final positions
      const finalPositions = await mockBinanceService.getPositions('BTCUSDT');
      const finalBtcPosition = finalPositions.find(
        (p) => p.symbol === 'BTCUSDT'
      );
      const finalQuantity = parseFloat(finalBtcPosition?.positionAmt || '0');

      // Position should have been updated correctly
      expect(finalQuantity).not.toBe(initialQuantity);
    });

    test('should track all order placements correctly', async () => {
      const signal: TradeSignal = {
        symbol: 'BTCUSDT',
        action: 'BUY',
        reason: 'Order tracking test',
        confidence: 0.8,
      };

      const initialOrderCount = mockBinanceService.getMockOrders().length;

      await tradingService.executeTradeSignal(signal);

      const finalOrderCount = mockBinanceService.getMockOrders().length;
      expect(finalOrderCount).toBe(initialOrderCount + 3);

      // Verify order types
      const orders = mockBinanceService.getMockOrders();
      const orderTypes = orders.map((order) => order.type);
      expect(orderTypes).toContain('MARKET');
      expect(orderTypes).toContain('STOP_MARKET');
      expect(orderTypes).toContain('TAKE_PROFIT_MARKET');
    });
  });
});
