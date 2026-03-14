/**
 * 报表管理命令测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as reportsCmds from './reports.js';

vi.mock('../utils.js', () => ({
  getApiClient: vi.fn(),
  executeCommand: vi.fn((fn) => fn()),
}));

vi.mock('../formatter.js', () => ({
  formatOutput: vi.fn((data) => JSON.stringify(data)),
  formatSuccess: vi.fn((msg) => `✓ ${msg}`),
}));

describe('报表管理命令', () => {
  const mockClient = {
    getReports: vi.fn(),
    getReportById: vi.fn(),
    executeReport: vi.fn(),
    createReport: vi.fn(),
    updateReport: vi.fn(),
    deleteReport: vi.fn(),
  };

  beforeEach(async () => {
    const { getApiClient } = await import('../utils.js');
    vi.mocked(getApiClient).mockResolvedValue(mockClient as any);
    vi.clearAllMocks();
  });

  describe('reportsList', () => {
    it('应该成功获取报表列表', async () => {
      const mockReports = [
        { id: '1', name: '日报表', type: 1 },
        { id: '2', name: '月报表', type: 2 },
      ];
      mockClient.getReports.mockResolvedValue(mockReports);

      await reportsCmds.reportsList({ limit: 50 });

      expect(mockClient.getReports).toHaveBeenCalledWith({ limit: 50 });
    });

    it('应该支持过滤条件', async () => {
      const filter = { type: 1 };
      mockClient.getReports.mockResolvedValue([]);

      await reportsCmds.reportsList({
        filter: JSON.stringify(filter),
      });

      expect(mockClient.getReports).toHaveBeenCalledWith({ filter });
    });
  });

  describe('reportsGet', () => {
    it('应该成功获取报表详情', async () => {
      const mockReport = {
        id: 'report-1',
        name: '设备运行报表',
        type: 1,
        description: '设备运行数据统计',
        config: { template: 'default' },
      };
      mockClient.getReportById.mockResolvedValue(mockReport);

      await reportsCmds.reportsGet('report-1', {});

      expect(mockClient.getReportById).toHaveBeenCalledWith('report-1');
    });
  });

  describe('reportsExecute', () => {
    it('应该成功执行报表生成', async () => {
      const parameters = { startDate: '2024-01-01', endDate: '2024-01-31' };
      const mockResult = {
        reportId: 'report-1',
        data: [{ device: 'device-1', count: 100 }],
        generatedAt: 1640000000000,
      };
      mockClient.executeReport.mockResolvedValue(mockResult);

      await reportsCmds.reportsExecute('report-1', {
        json: JSON.stringify(parameters),
      });

      expect(mockClient.executeReport).toHaveBeenCalledWith(
        'report-1',
        parameters
      );
    });

    it('应该从文件读取报表参数', async () => {
      const parameters = { format: 'pdf', includeCharts: true };
      mockClient.executeReport.mockResolvedValue({});

      const fs = await import('fs');
      vi.spyOn(fs.promises, 'readFile').mockResolvedValue(
        JSON.stringify(parameters)
      );

      await reportsCmds.reportsExecute('report-1', { file: 'params.json' });

      expect(mockClient.executeReport).toHaveBeenCalledWith(
        'report-1',
        parameters
      );
    });
  });

  describe('reportsCreate', () => {
    it('应该成功创建报表', async () => {
      mockClient.createReport.mockResolvedValue('new-report-id');

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await reportsCmds.reportsCreate({
        name: '新报表',
        type: '1',
        description: '新报表描述',
        config: '{"template": "default"}',
      });

      expect(mockClient.createReport).toHaveBeenCalledWith({
        name: '新报表',
        type: '1',
        description: '新报表描述',
        config: '{"template": "default"}',
      });
      expect(consoleLogSpy).toHaveBeenCalledWith('✓ 创建成功，报表ID: new-report-id');
      consoleLogSpy.mockRestore();
    });

    it('应该从文件读取报表定义', async () => {
      const reportData = {
        name: '文件报表',
        type: 2,
        description: '从文件创建',
        config: { template: 'custom' },
      };
      mockClient.createReport.mockResolvedValue('report-id');

      const fs = await import('fs');
      vi.spyOn(fs.promises, 'readFile').mockResolvedValue(JSON.stringify(reportData));

      await reportsCmds.reportsCreate({ file: 'report.json' });

      expect(mockClient.createReport).toHaveBeenCalledWith(reportData);
    });
  });

  describe('reportsUpdate', () => {
    it('应该成功更新报表', async () => {
      mockClient.updateReport.mockResolvedValue(undefined);

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await reportsCmds.reportsUpdate('report-1', {
        name: '更新后的报表',
        description: '更新后的描述',
      });

      expect(mockClient.updateReport).toHaveBeenCalledWith('report-1', {
        name: '更新后的报表',
        description: '更新后的描述',
      });
      expect(consoleLogSpy).toHaveBeenCalledWith('✓ 更新成功');
      consoleLogSpy.mockRestore();
    });
  });

  describe('reportsDelete', () => {
    it('应该成功删除报表', async () => {
      mockClient.deleteReport.mockResolvedValue(undefined);

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await reportsCmds.reportsDelete('report-1');

      expect(mockClient.deleteReport).toHaveBeenCalledWith('report-1');
      expect(consoleLogSpy).toHaveBeenCalledWith('✓ 删除成功');
      consoleLogSpy.mockRestore();
    });
  });
});
