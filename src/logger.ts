/**
 * 简单的日志系统
 * 支持不同日志级别和输出格式
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const COLORS: Record<LogLevel, string> = {
  debug: '\x1b[36m', // cyan
  info: '\x1b[32m',  // green
  warn: '\x1b[33m',  // yellow
  error: '\x1b[31m', // red
};

const RESET = '\x1b[0m';

class Logger {
  private level: LogLevel = 'info';
  private prefix = '[AIRIOT-MCP]';

  constructor(level?: LogLevel) {
    if (level) {
      this.level = level;
    }
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  setPrefix(prefix: string): void {
    this.prefix = prefix;
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.level];
  }

  private formatMessage(level: LogLevel, message: string, ...args: any[]): string {
    const timestamp = new Date().toISOString();
    const color = COLORS[level];
    const formattedArgs = args.length > 0 ? ` ${args.map(a => JSON.stringify(a)).join(' ')}` : '';
    return `${color}[${timestamp}] ${this.prefix} [${level.toUpperCase()}]${RESET} ${message}${formattedArgs}`;
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.error(this.formatMessage('debug', message, ...args));
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      console.error(this.formatMessage('info', message, ...args));
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.error(this.formatMessage('warn', message, ...args));
    }
  }

  error(message: string, ...args: any[]): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, ...args));
    }
  }
}

// 创建全局日志实例
export const logger = new Logger();

/**
 * 从环境变量或配置获取日志级别
 */
export function getLogLevelFromEnv(): LogLevel {
  const envLevel = process.env.AIRIOT_LOG_LEVEL?.toLowerCase();
  if (envLevel && ['debug', 'info', 'warn', 'error'].includes(envLevel)) {
    return envLevel as LogLevel;
  }
  return 'info';
}

/**
 * 初始化日志系统
 */
export function initLogger(level?: LogLevel): void {
  const logLevel = level || getLogLevelFromEnv();
  logger.setLevel(logLevel);
  logger.info(`Logger initialized with level: ${logLevel}`);
}
