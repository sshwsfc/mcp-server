/**
 * 报警命令测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as warningCmds from './warning.js';
import { getApiClient, executeCommand } from '../utils.js';

// Mock dependencies
vi.mock('../utils.js', () => ({
  getApiClient: vi.fn(),
  executeCommand: vi.fn((fn) => fn()),
}));

import { formatOutput, formatSuccess } from '../formatter.js';

vi.mock('../formatter.js', () => ({
  formatOutput: vi.fn((data) => JSON.stringify(data)),
  formatSuccess: vi.fn((msg) => `✓ ${msg}`),
  formatError: vi.fn((msg) => `✗ ${msg}`),
}));

describe('报警规则命令', () => {
  const mockClient = {
    getWarningRules: vi.fn(),
    getWarningRuleById: vi.fn(),
    createWarningRule: vi.fn(),
    updateWarningRule: vi.fn(),
    deleteWarningRule: vi.fn(),
  };

  beforeEach(() => {
    vi.mocked(getApiClient).mockResolvedValue(mockClient as any);
    vi.clearAllMocks();
  });

  describe('warningRulesList', () => {
    it('应该成功获取报警规则列表', async () => {
      const mockRules = [
        { id: '1', name: '规则1', level: 1, enable: true },
        { id: '2', name: '规则2', level: 2, enable: false },
      ];
      mockClient.getWarningRules.mockResolvedValue(mockRules);

      await warningCmds.warningRulesList({ limit: 50, skip: 0 });

      expect(mockClient.getWarningRules).toHaveBeenCalledWith({
        limit: 50,
        skip: 0,
      });
    });

    it('应该支持过滤条件', async () => {
      const filter = { level: 2 };
      mockClient.getWarningRules.mockResolvedValue([]);

      await warningCmds.warningRulesList({ filter: JSON.stringify(filter) });

      expect(mockClient.getWarningRules).toHaveBeenCalledWith({
        filter,
      });
    });
  });

  describe('warningRulesGet', () => {
    it('应该成功获取单个报警规则', async () => {
      const mockRule = { id: '1', name: '规则1', level: 1, enable: true };
      mockClient.getWarningRuleById.mockResolvedValue(mockRule);

      await warningCmds.warningRulesGet('1', {});

      expect(mockClient.getWarningRuleById).toHaveBeenCalledWith('1');
    });

    it('规则不存在时应该显示提示信息', async () => {
      mockClient.getWarningRuleById.mockResolvedValue(null);

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await warningCmds.warningRulesGet('nonexistent', {});

      expect(consoleLogSpy).toHaveBeenCalledWith('未找到该规则');
      consoleLogSpy.mockRestore();
    });
  });

  describe('warningRulesCreate', () => {
    it('应该成功创建报警规则', async () => {
      mockClient.createWarningRule.mockResolvedValue('new-rule-id');

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await warningCmds.warningRulesCreate({
        name: '新规则',
        level: '2',
        enable: 'true',
        description: '测试描述',
      });

      expect(mockClient.createWarningRule).toHaveBeenCalledWith({
        name: '新规则',
        level: 2,
        enable: true,
        description: '测试描述',
      });
      expect(consoleLogSpy).toHaveBeenCalledWith('✓ 创建成功，规则ID: new-rule-id');
      consoleLogSpy.mockRestore();
    });

    it('默认启用状态应该为 true', async () => {
      mockClient.createWarningRule.mockResolvedValue('rule-id');

      await warningCmds.warningRulesCreate({
        name: '规则',
        level: '1',
      });

      expect(mockClient.createWarningRule).toHaveBeenCalledWith({
        name: '规则',
        level: 1,
        enable: true,
      });
    });
  });

  describe('warningRulesUpdate', () => {
    it('应该成功更新报警规则', async () => {
      mockClient.updateWarningRule.mockResolvedValue(undefined);

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await warningCmds.warningRulesUpdate('rule-1', {
        name: '更新后的规则',
        level: '3',
        enable: 'false',
      });

      expect(mockClient.updateWarningRule).toHaveBeenCalledWith('rule-1', {
        name: '更新后的规则',
        level: 3,
        enable: false,
      });
      consoleLogSpy.mockRestore();
    });

    it('应该只更新提供的字段', async () => {
      mockClient.updateWarningRule.mockResolvedValue(undefined);

      await warningCmds.warningRulesUpdate('rule-1', {
        name: '新名称',
      });

      expect(mockClient.updateWarningRule).toHaveBeenCalledWith('rule-1', {
        name: '新名称',
      });
    });
  });

  describe('warningRulesDelete', () => {
    it('应该成功删除报警规则', async () => {
      mockClient.deleteWarningRule.mockResolvedValue(undefined);

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await warningCmds.warningRulesDelete('rule-1');

      expect(mockClient.deleteWarningRule).toHaveBeenCalledWith('rule-1');
      expect(consoleLogSpy).toHaveBeenCalledWith('✓ 删除成功');
      consoleLogSpy.mockRestore();
    });
  });
});

describe('报警管理命令', () => {
  const mockClient = {
    getWarnings: vi.fn(),
    getWarningById: vi.fn(),
    updateWarning: vi.fn(),
    getWarningStatistics: vi.fn(),
    getLatestWarnings: vi.fn(),
    batchConfirmWarnings: vi.fn(),
  };

  beforeEach(() => {
    vi.mocked(getApiClient).mockResolvedValue(mockClient as any);
    vi.clearAllMocks();
  });

  describe('warningsList', () => {
    it('应该成功获取报警列表', async () => {
      const mockWarnings = [
        { id: '1', level: 2, status: 0 },
        { id: '2', level: 3, status: 1 },
      ];
      mockClient.getWarnings.mockResolvedValue(mockWarnings);

      await warningCmds.warningsList({ limit: 50 });

      expect(mockClient.getWarnings).toHaveBeenCalledWith({ limit: 50 });
    });

    it('应该支持快捷过滤选项', async () => {
      mockClient.getWarnings.mockResolvedValue([]);

      await warningCmds.warningsList({
        level: '2',
        status: '0',
        'rule-id': 'rule-1',
        'device-id': 'device-1',
        keyword: '测试',
      });

      expect(mockClient.getWarnings).toHaveBeenCalledWith({
        level: 2,
        status: 0,
        ruleId: 'rule-1',
        deviceId: 'device-1',
        keyword: '测试',
      });
    });
  });

  describe('warningsConfirm', () => {
    it('应该成功确认报警', async () => {
      mockClient.updateWarning.mockResolvedValue(undefined);

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await warningCmds.warningsConfirm('warning-1', {
        note: '已确认',
        'user-id': 'user-1',
      });

      expect(mockClient.updateWarning).toHaveBeenCalledWith('warning-1', {
        status: 1,
        confirmNote: '已确认',
        confirmUser: 'user-1',
      });
      expect(consoleLogSpy).toHaveBeenCalledWith('✓ 确认成功');
      consoleLogSpy.mockRestore();
    });
  });

  describe('warningsResolve', () => {
    it('应该成功解决报警', async () => {
      mockClient.updateWarning.mockResolvedValue(undefined);

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await warningCmds.warningsResolve('warning-1', {
        note: '已修复',
      });

      expect(mockClient.updateWarning).toHaveBeenCalledWith('warning-1', {
        status: 2,
        recoverNote: '已修复',
      });
      expect(consoleLogSpy).toHaveBeenCalledWith('✓ 已标记为恢复');
      consoleLogSpy.mockRestore();
    });
  });

  describe('warningsStats', () => {
    it('应该成功获取报警统计', async () => {
      const mockStats = {
        total: 100,
        confirmed: 50,
        unconfirmed: 30,
        resolved: 20,
      };
      mockClient.getWarningStatistics.mockResolvedValue(mockStats);

      await warningCmds.warningsStats({});

      expect(mockClient.getWarningStatistics).toHaveBeenCalled();
    });
  });

  describe('warningsLatest', () => {
    it('应该成功获取最新报警', async () => {
      const mockWarnings = [
        { id: '1', level: 3, createTime: Date.now() },
      ];
      mockClient.getLatestWarnings.mockResolvedValue(mockWarnings);

      await warningCmds.warningsLatest({ limit: '10' });

      expect(mockClient.getLatestWarnings).toHaveBeenCalledWith(10);
    });

    it('默认应该返回10条', async () => {
      mockClient.getLatestWarnings.mockResolvedValue([]);

      await warningCmds.warningsLatest({});

      expect(mockClient.getLatestWarnings).toHaveBeenCalledWith(10);
    });
  });

  describe('warningsBatchConfirm', () => {
    it('应该成功批量确认报警', async () => {
      mockClient.batchConfirmWarnings.mockResolvedValue(undefined);

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await warningCmds.warningsBatchConfirm(['warning-1', 'warning-2'], {
        note: '批量确认',
        'user-id': 'user-1',
      });

      expect(mockClient.batchConfirmWarnings).toHaveBeenCalledWith({
        ids: ['warning-1', 'warning-2'],
        note: '批量确认',
        userId: 'user-1',
      });
      expect(consoleLogSpy).toHaveBeenCalledWith('✓ 已确认 2 条报警');
      consoleLogSpy.mockRestore();
    });
  });
});
