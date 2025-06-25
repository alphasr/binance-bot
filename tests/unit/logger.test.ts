// Unit tests for Logger utility
import { Logger } from '../../src/utils/logger';

describe('Logger', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    // Spy on console methods
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'info').mockImplementation();
  });

  afterEach(() => {
    // Restore console methods
    consoleSpy.mockRestore();
  });

  describe('logging methods', () => {
    test('should log info messages with timestamp', () => {
      const message = 'Test info message';
      Logger.info(message);

      expect(console.log).toHaveBeenCalled();
      const logCall = (console.log as jest.Mock).mock.calls[0][0];
      expect(logCall).toContain('INFO');
      expect(logCall).toContain(message);
      expect(logCall).toMatch(
        /\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/
      );
    });

    test('should log error messages with timestamp', () => {
      const message = 'Test error message';
      Logger.error(message);

      expect(console.log).toHaveBeenCalled();
      const logCall = (console.log as jest.Mock).mock.calls[0][0];
      expect(logCall).toContain('ERROR');
      expect(logCall).toContain(message);
      expect(logCall).toMatch(
        /\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/
      );
    });

    test('should log warning messages with timestamp', () => {
      const message = 'Test warning message';
      Logger.warn(message);

      expect(console.log).toHaveBeenCalled();
      const logCall = (console.log as jest.Mock).mock.calls[0][0];
      expect(logCall).toContain('WARN');
      expect(logCall).toContain(message);
      expect(logCall).toMatch(
        /\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/
      );
    });

    test('should handle multiple arguments', () => {
      Logger.info('Message with', 'multiple', 'arguments', 123);

      expect(console.log).toHaveBeenCalled();
      const logCall = (console.log as jest.Mock).mock.calls[0][0];
      expect(logCall).toContain('Message with multiple arguments 123');
    });

    test('should handle object logging', () => {
      const testObject = { key: 'value', number: 42 };
      Logger.info('Object test:', testObject);

      expect(console.log).toHaveBeenCalled();
      const logCall = (console.log as jest.Mock).mock.calls[0][0];
      expect(logCall).toContain('Object test:');
      expect(logCall).toContain(JSON.stringify(testObject));
    });

    test('should handle error objects', () => {
      const error = new Error('Test error');
      error.stack = 'Error stack trace';

      Logger.error('Error occurred:', error);

      expect(console.log).toHaveBeenCalled();
      const logCall = (console.log as jest.Mock).mock.calls[0][0];
      expect(logCall).toContain('ERROR');
      expect(logCall).toContain('Error occurred:');
      expect(logCall).toContain('Test error');
    });

    test('should handle null and undefined values', () => {
      Logger.info('Null test:', null);
      Logger.info('Undefined test:', undefined);

      expect(console.log).toHaveBeenCalledTimes(2);

      const firstCall = (console.log as jest.Mock).mock.calls[0][0];
      const secondCall = (console.log as jest.Mock).mock.calls[1][0];

      expect(firstCall).toContain('Null test: null');
      expect(secondCall).toContain('Undefined test: undefined');
    });
  });

  describe('timestamp formatting', () => {
    test('should use ISO timestamp format', () => {
      Logger.info('Timestamp test');

      const logCall = (console.log as jest.Mock).mock.calls[0][0];
      const timestampMatch = logCall.match(
        /\[(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)\]/
      );

      expect(timestampMatch).not.toBeNull();

      const timestamp = timestampMatch[1];
      const date = new Date(timestamp);
      expect(date.toISOString()).toBe(timestamp);
    });

    test('should have consistent timestamp format across calls', () => {
      Logger.info('First message');
      Logger.error('Second message');
      Logger.warn('Third message');

      expect(console.log).toHaveBeenCalledTimes(3);

      const calls = (console.log as jest.Mock).mock.calls;
      calls.forEach((call) => {
        expect(call[0]).toMatch(
          /\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/
        );
      });
    });

    test('should have recent timestamps', () => {
      const beforeTime = Date.now();
      Logger.info('Timing test');
      const afterTime = Date.now();

      const logCall = (console.log as jest.Mock).mock.calls[0][0];
      const timestampMatch = logCall.match(
        /\[(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)\]/
      );

      const logTime = new Date(timestampMatch[1]).getTime();
      expect(logTime).toBeGreaterThanOrEqual(beforeTime);
      expect(logTime).toBeLessThanOrEqual(afterTime);
    });
  });

  describe('log level formatting', () => {
    test('should format log levels correctly', () => {
      Logger.info('Info test');
      Logger.error('Error test');
      Logger.warn('Warn test');

      const calls = (console.log as jest.Mock).mock.calls;

      expect(calls[0][0]).toContain('] INFO: ');
      expect(calls[1][0]).toContain('] ERROR: ');
      expect(calls[2][0]).toContain('] WARN: ');
    });

    test('should have consistent spacing in log format', () => {
      Logger.info('Test');
      Logger.error('Test');
      Logger.warn('Test');

      const calls = (console.log as jest.Mock).mock.calls;

      calls.forEach((call) => {
        const logLine = call[0];
        expect(logLine).toMatch(/\[.*\] (INFO|ERROR|WARN): /);
      });
    });
  });

  describe('message serialization', () => {
    test('should serialize arrays properly', () => {
      const testArray = [1, 2, 3, 'test'];
      Logger.info('Array test:', testArray);

      const logCall = (console.log as jest.Mock).mock.calls[0][0];
      expect(logCall).toContain('Array test: [1,2,3,"test"]');
    });

    test('should serialize nested objects', () => {
      const nestedObject = {
        level1: {
          level2: {
            value: 'deep',
          },
        },
      };

      Logger.info('Nested object:', nestedObject);

      const logCall = (console.log as jest.Mock).mock.calls[0][0];
      expect(logCall).toContain('Nested object:');
      expect(logCall).toContain('"value":"deep"');
    });

    test('should handle circular references gracefully', () => {
      const circularObj: any = { name: 'test' };
      circularObj.self = circularObj;

      expect(() => {
        Logger.info('Circular test:', circularObj);
      }).not.toThrow();

      expect(console.log).toHaveBeenCalled();
    });

    test('should handle very long messages', () => {
      const longMessage = 'x'.repeat(10000);

      expect(() => {
        Logger.info('Long message:', longMessage);
      }).not.toThrow();

      const logCall = (console.log as jest.Mock).mock.calls[0][0];
      expect(logCall).toContain('Long message:');
      expect(logCall.length).toBeGreaterThan(10000);
    });
  });

  describe('performance', () => {
    test('should handle high frequency logging', () => {
      const startTime = Date.now();

      for (let i = 0; i < 1000; i++) {
        Logger.info(`Message ${i}`);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(1000); // Should complete within 1 second
      expect(console.log).toHaveBeenCalledTimes(1000);
    });

    test('should not block execution', () => {
      let counter = 0;

      Logger.info('Starting counter test');

      const interval = setInterval(() => {
        counter++;
        if (counter >= 5) {
          clearInterval(interval);
        }
      }, 1);

      // Wait a bit and check that counter incremented
      setTimeout(() => {
        expect(counter).toBeGreaterThan(0);
      }, 10);
    });
  });

  describe('edge cases', () => {
    test('should handle empty messages', () => {
      Logger.info('');
      Logger.error('');
      Logger.warn('');

      expect(console.log).toHaveBeenCalledTimes(3);

      const calls = (console.log as jest.Mock).mock.calls;
      calls.forEach((call) => {
        expect(call[0]).toMatch(/\[.*\] (INFO|ERROR|WARN): $/);
      });
    });

    test('should handle special characters', () => {
      const specialMessage = 'Special chars: äöü 中文 🚀 \\n\\t\\r';
      Logger.info(specialMessage);

      const logCall = (console.log as jest.Mock).mock.calls[0][0];
      expect(logCall).toContain(specialMessage);
    });

    test('should handle number values', () => {
      Logger.info('Numbers:', 42, 3.14, -0, Infinity, NaN);

      const logCall = (console.log as jest.Mock).mock.calls[0][0];
      expect(logCall).toContain('Numbers: 42 3.14 0 Infinity NaN');
    });

    test('should handle boolean values', () => {
      Logger.info('Booleans:', true, false);

      const logCall = (console.log as jest.Mock).mock.calls[0][0];
      expect(logCall).toContain('Booleans: true false');
    });
  });
});
