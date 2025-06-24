export class Logger {
  private static formatTime(): string {
    return new Date().toISOString();
  }

  static info(message: string, data?: any): void {
    console.log(
      `[${this.formatTime()}] INFO: ${message}`,
      data ? JSON.stringify(data, null, 2) : ''
    );
  }

  static error(message: string, error?: any): void {
    console.error(`[${this.formatTime()}] ERROR: ${message}`, error);
  }

  static warn(message: string, data?: any): void {
    console.warn(
      `[${this.formatTime()}] WARN: ${message}`,
      data ? JSON.stringify(data, null, 2) : ''
    );
  }

  static debug(message: string, data?: any): void {
    console.debug(
      `[${this.formatTime()}] DEBUG: ${message}`,
      data ? JSON.stringify(data, null, 2) : ''
    );
  }
}
