/**
 * CLI 工具函数测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getApiClient, executeCommand, normalizeOptions } from './utils.js';
import { formatError } from './formatter.js';

vi.mock('./formatter.js', () => ({
  formatError: vi.fn((msg) => `Error: ${msg}`),
}));

vi.mock('./config.js', () => ({
  getApiConfig: vi.fn(),
}));

vi.mock('../airiot-api.js', () => ({
  AiriotApiClient: vi.fn().mockImplementation(() => ({
    // Mock methods
  })),
}));

describe('CLI 工具函数', () => {
  describe('getApiClient', () => {
    it('应该成功获取 API 客户端', async () => {
      const { getApiConfig } = await import('./config.js');
      vi.mocked(getApiConfig).mockResolvedValue({
        baseUrl: 'https://test.com',
        projectId: 'test-project',
        token: 'test-token',
      });

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const processExitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called');
      });

      const client = await getApiClient();

      expect(client).toBeDefined();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
      processExitSpy.mockRestore();
    });

    it('配置不存在时应该退出程序', async () => {
      const { getApiConfig } = await import('./config.js');
      vi.mocked(getApiConfig).mockResolvedValue(null);

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const processExitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called');
      });

      try {
        await getApiClient();
        expect.fail('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
      }

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error: 未配置 API 信息，请先运行 airiot login');
      expect(processExitSpy).toHaveBeenCalledWith(1);

      consoleErrorSpy.mockRestore();
      processExitSpy.mockRestore();
    });
  });

  describe('executeCommand', () => {
    it('应该成功执行命令', async () => {
      const command = vi.fn().mockResolvedValue(undefined);
      await expect(executeCommand(command)).resolves.not.toThrow();
      expect(command).toHaveBeenCalled();
    });

    it('应该捕获并处理命令错误', async () => {
      const error = new Error('Command failed');
      const command = vi.fn().mockRejectedValue(error);

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const processExitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called');
      });

      try {
        await executeCommand(command);
        expect.fail('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
      }

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error: Command failed');
      expect(processExitSpy).toHaveBeenCalledWith(1);

      consoleErrorSpy.mockRestore();
      processExitSpy.mockRestore();
    });
  });

  describe('normalizeOptions', () => {
    it('应该转换数字字段', () => {
      const options = {
        limit: '50',
        skip: '10',
        level: '2',
        status: '1',
        other: 'string',
      };

      const normalized = normalizeOptions(options);

      expect(normalized.limit).toBe(50);
      expect(normalized.skip).toBe(10);
      expect(normalized.level).toBe(2);
      expect(normalized.status).toBe(1);
      expect(normalized.other).toBe('string');
    });

    it('应该转换布尔字段', () => {
      const options = {
        'with-count': 'true',
        upsert: 'false',
        enable: '1',
        attachment: '0',
        other: 'string',
      };

      const normalized = normalizeOptions(options);

      expect(normalized['with-count']).toBe(true);
      expect(normalized.upsert).toBe(false);
      expect(normalized.enable).toBe(true);
      expect(normalized.attachment).toBe(false);
      expect(normalized.other).toBe('string');
    });

    it('应该解析 JSON 字段', () => {
      const options = {
        filter: '{"level": 2}',
        sort: '{"createTime": -1}',
        data: '{"name": "test"}',
        other: 'not json',
      };

      const normalized = normalizeOptions(options);

      expect(normalized.filter).toEqual({ level: 2 });
      expect(normalized.sort).toEqual({ createTime: -1 });
      expect(normalized.data).toEqual({ name: 'test' });
      expect(normalized.other).toBe('not json');
    });

    it('应该处理无效的 JSON 字段', () => {
      const options = {
        filter: 'invalid json',
        other: 'value',
      };

      const normalized = normalizeOptions(options);

      expect(normalized.filter).toBe('invalid json');
      expect(normalized.other).toBe('value');
    });

    it('应该返回空对象当输入为 null', () => {
      expect(normalizeOptions(null)).toBeNull();
    });

    it('应该返回空对象当输入为 undefined', () => {
      expect(normalizeOptions(undefined)).toBeUndefined();
    });

    it('应该处理已经是正确类型的值', () => {
      const options = {
        limit: 50,
        enable: true,
        filter: { level: 2 },
      };

      const normalized = normalizeOptions(options);

      expect(normalized.limit).toBe(50);
      expect(normalized.enable).toBe(true);
      expect(normalized.filter).toEqual({ level: 2 });
    });

    it('应该处理带连字符的选项名', () => {
      const options = {
        'with-count': 'true',
        'user-id': 'user-1',
        'device-id': 'device-1',
      };

      const normalized = normalizeOptions(options);

      expect(normalized['with-count']).toBe(true);
      expect(normalized['user-id']).toBe('user-1');
      expect(normalized['device-id']).toBe('device-1');
    });
  });
});
