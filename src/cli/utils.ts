import { AiriotApiClient } from '../airiot-api.js';
import { getApiConfig } from './config.js';
import { formatError } from './formatter.js';

/**
 * 获取 API 客户端，统一处理认证检查
 */
export async function getApiClient(): Promise<AiriotApiClient> {
  const apiConfig = await getApiConfig();
  if (!apiConfig) {
    console.error(formatError('未配置 API 信息，请先运行 airiot login'));
    process.exit(1);
  }
  return new AiriotApiClient(apiConfig);
}

/**
 * 包装命令执行，统一错误处理
 */
export async function executeCommand(fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
  } catch (error: any) {
    console.error(formatError(error.message));
    process.exit(1);
  }
}

/**
 * 处理选项中的数字类型转换
 * 将字符串选项转换为数字（如果存在）
 */
export function normalizeOptions(options: any): any {
  if (!options) return options;

  const normalized = { ...options };

  // 转换常见的数字选项
  const numberFields = ['limit', 'skip', 'level', 'status', 'timeout', 'page', 'pageSize'];
  for (const field of numberFields) {
    if (normalized[field] !== undefined && typeof normalized[field] === 'string') {
      const parsed = parseInt(normalized[field], 10);
      if (!isNaN(parsed)) {
        normalized[field] = parsed;
      }
    }
  }

  // 处理布尔值选项
  const booleanFields = ['withCount', 'with-count', 'upsert', 'attachment', 'enable'];
  for (const field of booleanFields) {
    if (normalized[field] !== undefined) {
      if (typeof normalized[field] === 'string') {
        normalized[field] = normalized[field] === 'true' || normalized[field] === '1';
      }
    }
  }

  // 处理 JSON 选项
  const jsonFields = ['filter', 'sort', 'data', 'json', 'config', 'parameters'];
  for (const field of jsonFields) {
    if (normalized[field] !== undefined && typeof normalized[field] === 'string') {
      try {
        normalized[field] = JSON.parse(normalized[field]);
      } catch {
        // 保持原值，解析失败时在命令处理函数中处理
      }
    }
  }

  return normalized;
}

/**
 * 创建一个包装函数，用于在 action 处理器中自动标准化选项
 * 适用于只传递 options 的 action
 */
export function withNormalizedOptions(
  handler: (options: any) => void | Promise<void>
): (options: any) => Promise<void> {
  return async (options: any) => {
    const normalized = normalizeOptions(options);
    await handler(normalized);
  };
}

/**
 * 创建一个包装函数，用于在 action 处理器中自动标准化选项
 * 适用于传递多个参数的 action（第一个参数是 ID 或其他，最后一个参数是 options）
 */
export function withNormalizedOptionsMulti(
  handler: (...args: any[]) => void | Promise<void>
): (...args: any[]) => Promise<void> {
  return async (...args: any[]) => {
    const lastArg = args[args.length - 1];
    if (lastArg && typeof lastArg === 'object' && !Array.isArray(lastArg)) {
      args[args.length - 1] = normalizeOptions(lastArg);
    }
    await handler(...args);
  };
}
