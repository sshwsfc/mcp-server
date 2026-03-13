import { logger } from './logger.js';

/**
 * 基础错误类
 */
export class AiriotError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AiriotError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 配置错误
 */
export class ConfigError extends AiriotError {
  constructor(message: string, details?: any) {
    super(message, 'CONFIG_ERROR', details);
    this.name = 'ConfigError';
  }
}

/**
 * 认证错误
 */
export class AuthError extends AiriotError {
  constructor(message: string, details?: any) {
    super(message, 'AUTH_ERROR', details);
    this.name = 'AuthError';
  }
}

/**
 * API 请求错误
 */
export class ApiError extends AiriotError {
  constructor(
    message: string,
    public statusCode?: number,
    details?: any
  ) {
    super(message, 'API_ERROR', details);
    this.name = 'ApiError';
  }
}

/**
 * 网络错误
 */
export class NetworkError extends AiriotError {
  constructor(message: string, details?: any) {
    super(message, 'NETWORK_ERROR', details);
    this.name = 'NetworkError';
  }
}

/**
 * 验证错误
 */
export class ValidationError extends AiriotError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

/**
 * 资源未找到错误
 */
export class NotFoundError extends AiriotError {
  constructor(message: string, details?: any) {
    super(message, 'NOT_FOUND', details);
    this.name = 'NotFoundError';
  }
}

/**
 * 错误处理工具类
 */
export class ErrorHandler {
  /**
   * 处理并记录错误
   */
  static handle(error: unknown, context?: string): AiriotError {
    if (error instanceof AiriotError) {
      logger.error(`${context || 'Error'}: ${error.message}`, error.code, error.details);
      return error;
    }

    if (error instanceof Error) {
      logger.error(`${context || 'Error'}: ${error.message}`);
      return new AiriotError(error.message, 'UNKNOWN_ERROR', {
        originalError: error.name,
        stack: error.stack,
      });
    }

    logger.error(`${context || 'Error'}: Unknown error`, error);
    return new AiriotError('Unknown error occurred', 'UNKNOWN_ERROR', { error });
  }

  /**
   * 将错误转换为 MCP 错误响应
   */
  static toMcpResponse(error: unknown): {
    content: Array<{ type: string; text: string }>;
    isError: boolean;
  } {
    const handled = this.handle(error);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              error: handled.message,
              code: handled.code,
              details: handled.details,
            },
            null,
            2
          ),
        },
      ],
      isError: true,
    };
  }

  /**
   * 检查错误是否为特定类型
   */
  static isType(error: unknown, errorClass: new (...args: any[]) => AiriotError): boolean {
    return error instanceof errorClass;
  }

  /**
   * 判断是否为网络错误
   */
  static isNetworkError(error: unknown): boolean {
    if (error instanceof NetworkError) {
      return true;
    }

    // 检查 Axios 网络错误
    if (error && typeof error === 'object') {
      const err = error as any;
      return !err.response && err.message;
    }

    return false;
  }

  /**
   * 判断是否为认证错误
   */
  static isAuthError(error: unknown): boolean {
    if (error instanceof AuthError) {
      return true;
    }

    // 检查 401 响应
    if (error && typeof error === 'object') {
      const err = error as any;
      return err.response?.status === 401;
    }

    return false;
  }

  /**
   * 判断是否为可重试错误
   */
  static isRetryable(error: unknown): boolean {
    if (this.isNetworkError(error)) {
      return true;
    }

    // 5xx 服务器错误可以重试
    if (error && typeof error === 'object') {
      const err = error as any;
      const status = err.response?.status;
      return status && status >= 500 && status < 600;
    }

    return false;
  }
}

/**
 * 异步重试装饰器
 */
export function retry<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: {
    maxRetries?: number;
    delay?: number;
    backoff?: number;
    shouldRetry?: (error: unknown) => boolean;
  } = {}
): T {
  const {
    maxRetries = 3,
    delay = 1000,
    backoff = 2,
    shouldRetry = ErrorHandler.isRetryable.bind(ErrorHandler),
  } = options;

  return (async (...args: any[]) => {
    let lastError: unknown;
    let currentDelay = delay;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn(...args);
      } catch (error) {
        lastError = error;

        if (attempt === maxRetries || !shouldRetry(error)) {
          throw error;
        }

        logger.warn(`Retry attempt ${attempt + 1}/${maxRetries} after ${currentDelay}ms`, error instanceof Error ? error.message : String(error));
        await new Promise(resolve => setTimeout(resolve, currentDelay));
        currentDelay *= backoff;
      }
    }

    throw lastError;
  }) as T;
}
