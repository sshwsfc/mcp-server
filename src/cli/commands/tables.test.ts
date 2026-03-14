/**
 * 表管理命令测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as tablesCmds from './tables.js';

// Mock dependencies
vi.mock('../utils.js', () => ({
  getApiClient: vi.fn(),
  executeCommand: vi.fn((fn) => fn()),
}));

vi.mock('../formatter.js', () => ({
  formatOutput: vi.fn((data) => JSON.stringify(data)),
  formatSuccess: vi.fn((msg) => `✓ ${msg}`),
  formatError: vi.fn((msg) => `✗ ${msg}`),
}));

describe('表管理命令', () => {
  const mockClient = {
    getTables: vi.fn(),
    getTableById: vi.fn(),
    saveTable: vi.fn(),
    updateTable: vi.fn(),
    deleteTable: vi.fn(),
  };

  beforeEach(async () => {
    const { getApiClient } = await import('../utils.js');
    vi.mocked(getApiClient).mockResolvedValue(mockClient as any);
    vi.clearAllMocks();
  });

  describe('tablesList', () => {
    it('应该成功获取表列表', async () => {
      const mockTables = [
        { id: '1', name: '设备表', type: 1 },
        { id: '2', name: '数据表', type: 2 },
      ];
      mockClient.getTables.mockResolvedValue(mockTables);

      await tablesCmds.tablesList({ limit: 50, skip: 0 });

      expect(mockClient.getTables).toHaveBeenCalledWith({
        limit: 50,
        skip: 0,
      });
    });

    it('应该支持过滤和排序', async () => {
      const filter = { type: 1 };
      const sort = { createTime: -1 };
      mockClient.getTables.mockResolvedValue([]);

      await tablesCmds.tablesList({
        filter: JSON.stringify(filter),
        sort: JSON.stringify(sort),
      });

      expect(mockClient.getTables).toHaveBeenCalledWith({
        filter,
        sort,
      });
    });
  });

  describe('tablesGet', () => {
    it('应该成功获取单个表详情', async () => {
      const mockTable = {
        id: 'table-1',
        name: '设备表',
        type: 1,
        description: '设备管理表',
        fields: [
          { name: 'name', type: 'string' },
          { name: 'status', type: 'number' },
        ],
      };
      mockClient.getTableById.mockResolvedValue(mockTable);

      await tablesCmds.tablesGet('table-1', {});

      expect(mockClient.getTableById).toHaveBeenCalledWith('table-1');
    });
  });

  describe('tablesCreate', () => {
    it('应该从JSON字符串创建表', async () => {
      const tableData = {
        id: 'new-table',
        title: '新表',
        schema: {
          form: ['name', 'id'],
          key: 'modelProperties',
          listFields: ['name', 'id'],
          name: 'modelProperties',
          properties: {
            name: {
              type: 'string',
              key: 'name',
              title: '名称',
              fieldType: 'input',
            },
          },
          required: ['name'],
          title: '模型属性',
          type: 'object',
        },
      };
      mockClient.saveTable.mockResolvedValue('new-table-id');

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await tablesCmds.tablesCreate({ json: JSON.stringify(tableData) });

      expect(mockClient.saveTable).toHaveBeenCalledWith(tableData);
      expect(consoleLogSpy).toHaveBeenCalledWith('✓ 创建成功，表ID: new-table-id');
      consoleLogSpy.mockRestore();
    });

    it('应该从文件创建表', async () => {
      const tableData = {
        id: 'new-table',
        title: '新表',
        schema: {
          form: ['name'],
          key: 'modelProperties',
          listFields: ['name'],
          name: 'modelProperties',
          properties: {
            name: {
              type: 'string',
              key: 'name',
              title: '名称',
              fieldType: 'input',
            },
          },
          required: ['name'],
          title: '模型属性',
          type: 'object',
        },
      };
      mockClient.saveTable.mockResolvedValue('new-table-id');

      const fs = await import('fs');
      vi.spyOn(fs.promises, 'readFile').mockResolvedValue(JSON.stringify(tableData));

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await tablesCmds.tablesCreate({ file: 'table.json' });

      expect(mockClient.saveTable).toHaveBeenCalledWith(tableData);
      expect(consoleLogSpy).toHaveBeenCalledWith('✓ 创建成功，表ID: new-table-id');
      consoleLogSpy.mockRestore();
    });

    it('应该处理无效JSON格式', async () => {
      await expect(tablesCmds.tablesCreate({ json: 'invalid-json' }))
        .rejects.toThrow('无效的JSON格式');
    });

    it('应该在缺少参数时抛出错误', async () => {
      await expect(tablesCmds.tablesCreate({}))
        .rejects.toThrow('请提供 --json 或 --file 参数');
    });
  });

  describe('tablesUpdate', () => {
    it('应该成功更新表', async () => {
      mockClient.updateTable.mockResolvedValue(undefined);

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await tablesCmds.tablesUpdate('table-1', {
        name: '更新后的表名',
        description: '更新后的描述',
      });

      expect(mockClient.updateTable).toHaveBeenCalledWith('table-1', {
        name: '更新后的表名',
        description: '更新后的描述',
      });
      expect(consoleLogSpy).toHaveBeenCalledWith('✓ 更新成功');
      consoleLogSpy.mockRestore();
    });
  });

  describe('tablesDelete', () => {
    it('应该成功删除表', async () => {
      mockClient.deleteTable.mockResolvedValue(undefined);

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await tablesCmds.tablesDelete('table-1');

      expect(mockClient.deleteTable).toHaveBeenCalledWith('table-1');
      expect(consoleLogSpy).toHaveBeenCalledWith('✓ 删除成功');
      consoleLogSpy.mockRestore();
    });
  });
});
