/**
 * CLI 配置管理测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import {
  readConfig,
  writeConfig,
  clearConfig,
  getApiConfig,
  type CliConfig,
} from './config.js';

vi.mock('fs', () => ({
  promises: {
    mkdir: vi.fn(),
    readFile: vi.fn(),
    writeFile: vi.fn(),
    unlink: vi.fn(),
  },
}));

const mockConfigDir = '/home/test/.airiot';
const mockConfigFile = mockConfigDir + '/config.json';
const mockProjectConfigFile = process.cwd() + '/.airiotrc.json';

describe('CLI 配置管理', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset process.cwd() to avoid test interference
    vi.stubEnv('CWD', '/test/project');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('readConfig', () => {
    it('应该读取全局配置', async () => {
      const globalConfig = {
        baseUrl: 'https://global.airiot.com',
        projectId: 'global-project',
        token: 'global-token',
        username: 'global-user',
      };
      vi.mocked(fs.readFile)
        .mockRejectedValueOnce(new Error('Project config not found')) // 项目配置不存在
        .mockResolvedValueOnce(JSON.stringify(globalConfig)); // 全局配置

      const config = await readConfig();

      expect(config).toMatchObject({
        baseUrl: 'https://global.airiot.com',
        projectId: 'global-project',
        token: 'global-token',
        username: 'global-user',
        output: 'table',
      });
    });

    it('应该读取项目配置', async () => {
      const projectConfig = {
        baseUrl: 'https://project.airiot.com',
        projectId: 'project-id',
        token: 'project-token',
      };
      vi.mocked(fs.readFile)
        .mockResolvedValueOnce(JSON.stringify(projectConfig)) // 项目配置
        .mockRejectedValueOnce(new Error('Global config not found')); // 全局配置不存在

      const config = await readConfig();

      expect(config).toMatchObject({
        baseUrl: 'https://project.airiot.com',
        projectId: 'project-id',
        token: 'project-token',
        output: 'table',
      });
    });

    it('项目配置应该覆盖全局配置', async () => {
      const globalConfig = {
        baseUrl: 'https://global.airiot.com',
        projectId: 'global-project',
        token: 'global-token',
      };
      const projectConfig = {
        baseUrl: 'https://project.airiot.com',
        projectId: 'project-id',
        token: 'project-token',
      };
      vi.mocked(fs.readFile)
        .mockResolvedValueOnce(JSON.stringify(projectConfig)) // 项目配置
        .mockResolvedValueOnce(JSON.stringify(globalConfig)); // 全局配置

      const config = await readConfig();

      expect(config).toMatchObject({
        baseUrl: 'https://project.airiot.com', // 使用项目配置
        projectId: 'project-id', // 使用项目配置
        token: 'project-token', // 使用项目配置
      });
    });

    it('配置文件不存在时应该返回 null', async () => {
      vi.mocked(fs.readFile).mockRejectedValue(new Error('File not found'));

      const config = await readConfig();

      expect(config).toBeNull();
    });

    it('无效的配置（缺少 baseUrl）应该返回 null', async () => {
      const invalidConfig = {
        projectId: 'test-project',
      };
      vi.mocked(fs.readFile)
        .mockRejectedValueOnce(new Error('Project config not found'))
        .mockResolvedValueOnce(JSON.stringify(invalidConfig));

      const config = await readConfig();

      expect(config).toBeNull();
    });

    it('无效的配置（缺少 projectId）应该返回 null', async () => {
      const invalidConfig = {
        baseUrl: 'https://test.com',
      };
      vi.mocked(fs.readFile)
        .mockRejectedValueOnce(new Error('Project config not found'))
        .mockResolvedValueOnce(JSON.stringify(invalidConfig));

      const config = await readConfig();

      expect(config).toBeNull();
    });
  });

  describe('writeConfig', () => {
    it('应该成功写入配置', async () => {
      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fs.readFile).mockRejectedValue(new Error('Not found'));

      const config: Partial<CliConfig> = {
        baseUrl: 'https://test.airiot.com',
        projectId: 'test-project',
        token: 'test-token',
        username: 'testuser',
      };

      await writeConfig(config);

      expect(fs.mkdir).toHaveBeenCalledWith(
        expect.stringContaining('.airiot'),
        { recursive: true }
      );
      expect(fs.writeFile).toHaveBeenCalled();
    });

    it('应该合并现有配置', async () => {
      const existingConfig = {
        baseUrl: 'https://old.airiot.com',
        projectId: 'old-project',
        token: 'old-token',
        output: 'json' as const,
      };
      const newConfig: Partial<CliConfig> = {
        token: 'new-token',
      };

      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fs.readFile)
        .mockRejectedValueOnce(new Error('Project config not found'))
        .mockResolvedValueOnce(JSON.stringify(existingConfig));

      await writeConfig(newConfig);

      const writtenConfig = JSON.parse(
        vi.mocked(fs.writeFile).mock.calls[0][1] as string
      );
      expect(writtenConfig).toMatchObject({
        baseUrl: 'https://old.airiot.com', // 保留
        projectId: 'old-project', // 保留
        token: 'new-token', // 更新
        output: 'json', // 保留
      });
    });
  });

  describe('clearConfig', () => {
    it('应该成功删除配置文件', async () => {
      vi.mocked(fs.unlink).mockResolvedValue(undefined);

      await clearConfig();

      expect(fs.unlink).toHaveBeenCalled();
    });

    it('配置文件不存在时不应该报错', async () => {
      vi.mocked(fs.unlink).mockRejectedValue(new Error('File not found'));

      await expect(clearConfig()).resolves.not.toThrow();
    });
  });

  describe('getApiConfig', () => {
    it('应该返回有效的 API 配置', async () => {
      const validConfig = {
        baseUrl: 'https://test.airiot.com',
        projectId: 'test-project',
        token: 'test-token',
      };
      vi.mocked(fs.readFile)
        .mockRejectedValueOnce(new Error('Project config not found'))
        .mockResolvedValueOnce(JSON.stringify(validConfig));

      const apiConfig = await getApiConfig();

      expect(apiConfig).toMatchObject({
        baseUrl: 'https://test.airiot.com',
        projectId: 'test-project',
        token: 'test-token',
      });
    });

    it('配置无效时应该返回 null', async () => {
      const invalidConfig = {
        baseUrl: 'https://test.airiot.com',
        // 缺少 projectId
      };
      vi.mocked(fs.readFile)
        .mockRejectedValueOnce(new Error('Project config not found'))
        .mockResolvedValueOnce(JSON.stringify(invalidConfig));

      const apiConfig = await getApiConfig();

      expect(apiConfig).toBeNull();
    });

    it('配置不存在时应该返回 null', async () => {
      vi.mocked(fs.readFile).mockRejectedValue(new Error('File not found'));

      const apiConfig = await getApiConfig();

      expect(apiConfig).toBeNull();
    });
  });
});
