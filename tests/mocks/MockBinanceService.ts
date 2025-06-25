// Mock Binance Service for testing
import { OrderParams, PositionInfo } from '../../src/types/trading';
import {
  mockOrderResponse,
  mockPositionData,
  mockAccountInfo,
  mockPriceData,
  mockCandlestickData,
} from './mockData';

export class MockBinanceFuturesService {
  private mockOrders: any[] = [];
  private mockPositions: any[] = [...mockPositionData];
  private mockBalance = 1000;

  async initialize(): Promise<void> {
    // Mock initialization - no real API calls
    return Promise.resolve();
  }

  async setLeverage(symbol: string, leverage: number): Promise<void> {
    // Mock leverage setting
    return Promise.resolve();
  }

  async setMarginType(symbol: string, marginType: string): Promise<void> {
    // Mock margin type setting
    return Promise.resolve();
  }

  async getCurrentPrice(symbol: string): Promise<number> {
    return mockPriceData[symbol as keyof typeof mockPriceData] || 42000.5;
  }

  async getAccountInfo(): Promise<any> {
    return mockAccountInfo;
  }

  async getPositions(symbol?: string): Promise<PositionInfo[]> {
    if (symbol) {
      return this.mockPositions.filter((pos) => pos.symbol === symbol);
    }
    return this.mockPositions;
  }

  async placeMarketOrder(orderParams: OrderParams): Promise<any> {
    const order = {
      ...mockOrderResponse,
      symbol: orderParams.symbol,
      side: orderParams.side,
      type: orderParams.type,
      quantity: orderParams.quantity,
      orderId: Date.now() + Math.random() * 1000,
    };

    this.mockOrders.push(order);

    // Update mock position
    const existingPosition = this.mockPositions.find(
      (pos) => pos.symbol === orderParams.symbol
    );
    if (existingPosition) {
      const qty = parseFloat(orderParams.quantity || '0');
      const currentQty = parseFloat(existingPosition.positionAmt);
      existingPosition.positionAmt = (
        orderParams.side === 'BUY' ? currentQty + qty : currentQty - qty
      ).toString();
    }

    return order;
  }

  async placeLimitOrder(orderParams: OrderParams): Promise<any> {
    const order = {
      ...mockOrderResponse,
      ...orderParams,
      type: 'LIMIT',
      status: 'NEW',
      orderId: Date.now() + Math.random() * 1000,
    };

    this.mockOrders.push(order);
    return order;
  }

  async placeStopOrder(orderParams: OrderParams): Promise<any> {
    const order = {
      ...mockOrderResponse,
      ...orderParams,
      type: 'STOP_MARKET',
      status: 'NEW',
      orderId: Date.now() + Math.random() * 1000,
    };

    this.mockOrders.push(order);
    return order;
  }

  async placeStopLossOrder(
    symbol: string,
    side: 'BUY' | 'SELL',
    quantity: string,
    stopPrice: string
  ): Promise<any> {
    const order = {
      ...mockOrderResponse,
      symbol,
      side,
      type: 'STOP_MARKET',
      quantity,
      stopPrice,
      status: 'NEW',
      orderId: Date.now() + Math.random() * 1000,
    };

    this.mockOrders.push(order);
    return order;
  }

  async placeTakeProfitOrder(
    symbol: string,
    side: 'BUY' | 'SELL',
    quantity: string,
    stopPrice: string
  ): Promise<any> {
    const order = {
      ...mockOrderResponse,
      symbol,
      side,
      type: 'TAKE_PROFIT_MARKET',
      quantity,
      stopPrice,
      status: 'NEW',
      orderId: Date.now() + Math.random() * 1000,
    };

    this.mockOrders.push(order);
    return order;
  }

  async cancelOrder(symbol: string, orderId: number): Promise<any> {
    const orderIndex = this.mockOrders.findIndex(
      (order) => order.orderId === orderId
    );
    if (orderIndex !== -1) {
      this.mockOrders[orderIndex].status = 'CANCELED';
      return this.mockOrders[orderIndex];
    }
    throw new Error('Order not found');
  }

  async cancelAllOrders(symbol: string): Promise<any[]> {
    const canceledOrders = this.mockOrders
      .filter((order) => order.symbol === symbol && order.status === 'NEW')
      .map((order) => ({ ...order, status: 'CANCELED' }));

    this.mockOrders = this.mockOrders.map((order) =>
      order.symbol === symbol && order.status === 'NEW'
        ? { ...order, status: 'CANCELED' }
        : order
    );

    return canceledOrders;
  }

  async closeAllPositions(symbol: string): Promise<any[]> {
    const closedPositions = this.mockPositions
      .filter(
        (pos) => pos.symbol === symbol && parseFloat(pos.positionAmt) !== 0
      )
      .map((pos) => {
        const closeOrder = {
          ...mockOrderResponse,
          symbol: pos.symbol,
          side: parseFloat(pos.positionAmt) > 0 ? 'SELL' : 'BUY',
          quantity: Math.abs(parseFloat(pos.positionAmt)).toString(),
          orderId: Date.now() + Math.random() * 1000,
        };

        return closeOrder;
      });

    // Actually reset positions after mapping
    this.mockPositions.forEach((pos) => {
      if (pos.symbol === symbol && parseFloat(pos.positionAmt) !== 0) {
        pos.positionAmt = '0';
        pos.unRealizedProfit = '0';
      }
    });

    return closedPositions;
  }

  async getKlines(
    symbol: string,
    interval: string,
    limit?: number
  ): Promise<any[]> {
    return mockCandlestickData;
  }

  async testConnectivity(): Promise<any> {
    return { code: 200, msg: 'success' };
  }

  // Helper methods for testing
  getMockOrders(): any[] {
    return this.mockOrders;
  }

  getMockPositions(): any[] {
    return this.mockPositions;
  }

  clearMockData(): void {
    this.mockOrders = [];
    this.mockPositions = [...mockPositionData];
    this.mockBalance = 1000;
  }

  // Price calculation methods
  calculateStopLossPrice(
    entryPrice: number,
    side: 'BUY' | 'SELL',
    points: number
  ): number {
    const pointValue = entryPrice * 0.0001; // Assuming 1 point = 0.01% of price

    if (side === 'BUY') {
      return entryPrice - points * pointValue;
    } else {
      return entryPrice + points * pointValue;
    }
  }

  calculateTakeProfitPrice(
    entryPrice: number,
    side: 'BUY' | 'SELL',
    points: number
  ): number {
    const pointValue = entryPrice * 0.0001; // Assuming 1 point = 0.01% of price

    if (side === 'BUY') {
      return entryPrice + points * pointValue;
    } else {
      return entryPrice - points * pointValue;
    }
  }
}
