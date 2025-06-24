import { USDMClient } from 'binance';
import { RSI, EMA } from 'technicalindicators';
import { Logger } from '../utils/logger';

export interface TechnicalData {
  ema7: number;
  ema100: number;
  ema200: number;
  rsi: number;
  currentPrice: number;
}

export interface TradingSignal {
  action: 'LONG' | 'SHORT' | 'NO_SIGNAL';
  leverage: number;
  confidence: number;
  data: TechnicalData;
}

export class TechnicalAnalysisService {
  private client: any;

  constructor(client: any) {
    this.client = client;
  }

  /**
   * Fetch historical candles for analysis
   */
  async fetchCandles(
    symbol: string = 'BTCUSDT',
    interval: string = '30m',
    limit: number = 200
  ): Promise<any[]> {
    try {
      const response = await this.client.getKlines(symbol, interval, { limit });
      Logger.info(`Fetched ${response.length} candles for ${symbol}`);
      return response;
    } catch (error) {
      Logger.error('Error fetching candles:', error);
      return [];
    }
  }

  /**
   * Calculate technical indicators from candle data
   */
  calculateIndicators(candles: any[]): TechnicalData {
    const closePrices = candles.map((candle) => parseFloat(candle[4])); // Close price is index 4

    // Calculate EMAs
    const ema7Values = EMA.calculate({ period: 7, values: closePrices });
    const ema100Values = EMA.calculate({ period: 100, values: closePrices });
    const ema200Values = EMA.calculate({ period: 200, values: closePrices });

    // Calculate RSI
    const rsiValues = RSI.calculate({ period: 14, values: closePrices });

    const data: TechnicalData = {
      ema7: ema7Values[ema7Values.length - 1] || 0,
      ema100: ema100Values[ema100Values.length - 1] || 0,
      ema200: ema200Values[ema200Values.length - 1] || 0,
      rsi: rsiValues[rsiValues.length - 1] || 50,
      currentPrice: closePrices[closePrices.length - 1] || 0,
    };

    Logger.info('Technical indicators calculated:', data);
    return data;
  }

  /**
   * Check if conditions are met for a LONG position
   */
  isLongSignal(data: TechnicalData): boolean {
    const { currentPrice, ema7, ema100, ema200, rsi } = data;

    // Check EMA alignment: Price > EMA7 > EMA100 > EMA200
    const emaAlignment =
      currentPrice > ema7 && ema7 > ema100 && ema100 > ema200;
    if (!emaAlignment) {
      Logger.debug('LONG signal failed: EMA alignment not met');
      return false;
    }

    // Price should be within 0.3% of EMA7 for entry precision
    const priceDistance = Math.abs((currentPrice - ema7) / ema7) * 100;
    if (priceDistance > 0.3) {
      Logger.debug(
        `LONG signal failed: Price too far from EMA7 (${priceDistance.toFixed(
          2
        )}%)`
      );
      return false;
    }

    // RSI should be between 30-50 (oversold recovery)
    if (rsi < 30 || rsi > 50) {
      Logger.debug(
        `LONG signal failed: RSI not in range 30-50 (${rsi.toFixed(2)})`
      );
      return false;
    }

    Logger.info('✅ LONG signal conditions met!');
    return true;
  }

  /**
   * Check if conditions are met for a SHORT position
   */
  isShortSignal(data: TechnicalData): boolean {
    const { currentPrice, ema7, ema100, ema200, rsi } = data;

    // Check EMA alignment: Price < EMA7 < EMA100 < EMA200
    const emaAlignment =
      currentPrice < ema7 && ema7 < ema100 && ema100 < ema200;
    if (!emaAlignment) {
      Logger.debug('SHORT signal failed: EMA alignment not met');
      return false;
    }

    // Price should be within 0.3% of EMA7 for entry precision
    const priceDistance = Math.abs((currentPrice - ema7) / ema7) * 100;
    if (priceDistance > 0.3) {
      Logger.debug(
        `SHORT signal failed: Price too far from EMA7 (${priceDistance.toFixed(
          2
        )}%)`
      );
      return false;
    }

    // RSI should be between 50-70 (overbought reversal)
    if (rsi < 50 || rsi > 70) {
      Logger.debug(
        `SHORT signal failed: RSI not in range 50-70 (${rsi.toFixed(2)})`
      );
      return false;
    }

    Logger.info('✅ SHORT signal conditions met!');
    return true;
  }

  /**
   * Determine leverage based on RSI extremes
   */
  determineLeverage(
    rsi: number,
    isLong: boolean,
    baseLeverage: number = 5,
    highLeverage: number = 10
  ): number {
    // Use higher leverage for extreme RSI values (stronger signals)
    if (isLong && rsi < 35) {
      Logger.info(
        `Using high leverage ${highLeverage}x for extreme oversold RSI: ${rsi.toFixed(
          2
        )}`
      );
      return highLeverage;
    }

    if (!isLong && rsi > 65) {
      Logger.info(
        `Using high leverage ${highLeverage}x for extreme overbought RSI: ${rsi.toFixed(
          2
        )}`
      );
      return highLeverage;
    }

    Logger.info(
      `Using base leverage ${baseLeverage}x for RSI: ${rsi.toFixed(2)}`
    );
    return baseLeverage;
  }

  /**
   * Generate trading signal based on technical analysis
   */
  async generateTradingSignal(
    symbol: string = 'BTCUSDT'
  ): Promise<TradingSignal> {
    try {
      // Fetch candle data
      const candles = await this.fetchCandles(symbol, '30m', 200);

      if (candles.length < 200) {
        Logger.warn('Insufficient candle data for analysis');
        return {
          action: 'NO_SIGNAL',
          leverage: 5,
          confidence: 0,
          data: { ema7: 0, ema100: 0, ema200: 0, rsi: 50, currentPrice: 0 },
        };
      }

      // Calculate indicators
      const data = this.calculateIndicators(candles);

      // Check for signals
      if (this.isLongSignal(data)) {
        const leverage = this.determineLeverage(data.rsi, true);
        return {
          action: 'LONG',
          leverage,
          confidence: this.calculateConfidence(data, 'LONG'),
          data,
        };
      }

      if (this.isShortSignal(data)) {
        const leverage = this.determineLeverage(data.rsi, false);
        return {
          action: 'SHORT',
          leverage,
          confidence: this.calculateConfidence(data, 'SHORT'),
          data,
        };
      }

      Logger.info('No valid trading signal found');
      return {
        action: 'NO_SIGNAL',
        leverage: 5,
        confidence: 0,
        data,
      };
    } catch (error) {
      Logger.error('Error generating trading signal:', error);
      return {
        action: 'NO_SIGNAL',
        leverage: 5,
        confidence: 0,
        data: { ema7: 0, ema100: 0, ema200: 0, rsi: 50, currentPrice: 0 },
      };
    }
  }

  /**
   * Calculate signal confidence based on technical factors
   */
  private calculateConfidence(
    data: TechnicalData,
    action: 'LONG' | 'SHORT'
  ): number {
    const { currentPrice, ema7, ema100, ema200, rsi } = data;
    let confidence = 0;

    // EMA spread strength (wider spread = stronger trend)
    const emaSpread =
      action === 'LONG'
        ? ((ema7 - ema200) / ema200) * 100
        : ((ema200 - ema7) / ema200) * 100;

    confidence += Math.min(emaSpread * 10, 30); // Max 30 points

    // RSI positioning
    if (action === 'LONG') {
      confidence += (50 - rsi) * 2; // Closer to 30, higher confidence
    } else {
      confidence += (rsi - 50) * 2; // Closer to 70, higher confidence
    }

    // Price proximity to EMA7
    const priceDistance = Math.abs((currentPrice - ema7) / ema7) * 100;
    confidence += Math.max(0, (0.3 - priceDistance) * 100); // Max distance bonus

    return Math.min(Math.max(confidence, 0), 100);
  }
}
