/**
 * 表记录命令测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as recordsCmds from './records.js';

vi.mock('../utils.js', () => ({
  getApiClient: vi.fn(),
  executeCommand: vi.fn((fn) => fn()),
}));

vi.mock('../formatter.js', () => ({
  formatOutput: vi.fn((data) => JSON.stringify(data)),
  formatSuccess: vi.fn((msg) => `✓ ${msg}`),
  formatError: vi.fn((msg) => `✗ ${msg}`),
}));

describe('表记录管理命令', () => {
  const mockClient = {
    getRecords: vi.fn(),
    getRecordById: vi.fn(),
    createRecord: vi.fn(),
    updateRecord: vi.fn(),
    deleteRecord: vi.fn(),
    batchDeleteRecords: vi.fn(),
  };

  beforeEach(async () => {
    const { getApiClient } = await import('../utils.js');
    vi.mocked(getApiClient).mockResolvedValue(mockClient as any);
    vi.clearAllMocks();
  });

  describe('recordsList', () => {
    it('应该成功获取记录列表', async () => {
      const mockRecords = [
        { id: '1', name: '记录1', status: 1 },
        { id: '2', name: '记录2', status: 0 },
      ];
      mockClient.getRecords.mockResolvedValue(mockRecords);

      await recordsCmds.recordsList('table-1', { limit: 50 });

      expect(mockClient.getRecords).toHaveBeenCalledWith('table-1', {
        limit: 50,
      });
    });
  });

  describe('recordsGet', () => {
    it('应该成功获取单条记录', async () => {
      const mockRecord = {
        id: 'rec-1',
        name: '测试记录',
        status: 1,
        createTime: 1640000000000,
      };
      mockClient.getRecordById.mockResolvedValue(mockRecord);

      await recordsCmds.recordsGet('table-1', 'rec-1', {});

      expect(mockClient.getRecordById).toHaveBeenCalledWith('table-1', 'rec-1');
    });
  });

  describe('recordsCreate', () => {
    it('应该从文件创建记录', async () => {
      const recordData = { name: '新记录', status: 1 };
      mockClient.createRecord.mockResolvedValue('new-rec-id');

      const fs = await import('fs');
      vi.spyOn(fs.promises, 'readFile').mockResolvedValue(JSON.stringify(recordData));

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await recordsCmds.recordsCreate('table-1', { file: 'record.json' });

      expect(mockClient.createRecord).toHaveBeenCalledWith('table-1', recordData);
      consoleLogSpy.mockRestore();
    });

    it('应该支持 upsert 选项', async () => {
      const recordData = { id: 'rec-1', name: '记录' };
      mockClient.createRecord.mockResolvedValue('rec-1');

      await recordsCmds.recordsCreate('table-1', {
        json: JSON.stringify(recordData),
        upsert: true,
      });

      expect(mockClient.createRecord).toHaveBeenCalledWith('table-1', recordData, true);
    });
  });

  describe('recordsUpdate', () => {
    it('应该成功更新记录', async () => {
      const updateData = { name: '更新后的名称', status: 2 };
      mockClient.updateRecord.mockResolvedValue(undefined);

      await recordsCmds.recordsUpdate('table-1', 'rec-1', {
        json: JSON.stringify(updateData),
      });

      expect(mockClient.updateRecord).toHaveBeenCalledWith(
        'table-1',
        'rec-1',
        updateData
      );
    });
  });

  describe('recordsDelete', () => {
    it('应该成功删除记录', async () => {
      mockClient.deleteRecord.mockResolvedValue(undefined);

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await recordsCmds.recordsDelete('table-1', 'rec-1', {});

      expect(mockClient.deleteRecord).toHaveBeenCalledWith('table-1', 'rec-1', {});
      expect(consoleLogSpy).toHaveBeenCalledWith('✓ 删除成功');
      consoleLogSpy.mockRestore();
    });

    it('应该支持级联删除附件', async () => {
      mockClient.deleteRecord.mockResolvedValue(undefined);

      await recordsCmds.recordsDelete('table-1', 'rec-1', { attachment: true });

      expect(mockClient.deleteRecord).toHaveBeenCalledWith('table-1', 'rec-1', {
        attachment: true,
      });
    });
  });

  describe('recordsBatchDelete', () => {
    it('应该成功批量删除记录', async () => {
      mockClient.batchDeleteRecords.mockResolvedValue(undefined);

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await recordsCmds.recordsBatchDelete('table-1', ['rec-1', 'rec-2']);

      expect(mockClient.batchDeleteRecords).toHaveBeenCalledWith('table-1', [
        'rec-1',
        'rec-2',
      ]);
      expect(consoleLogSpy).toHaveBeenCalledWith('✓ 删除成功');
      consoleLogSpy.mockRestore();
    });
  });
});
