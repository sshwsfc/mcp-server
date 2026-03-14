/**
 * 属性点查询命令测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as tagsCmds from './tags.js';

vi.mock('../utils.js', () => ({
  getApiClient: vi.fn(),
  executeCommand: vi.fn((fn) => fn()),
}));

vi.mock('../formatter.js', () => ({
  formatOutput: vi.fn((data) => JSON.stringify(data)),
  formatSuccess: vi.fn((msg) => `✓ ${msg}`),
}));

describe('属性点查询命令', () => {
  const mockClient = {
    getTags: vi.fn(),
    getRecordTags: vi.fn(),
  };

  beforeEach(async () => {
    const { getApiClient } = await import('../utils.js');
    vi.mocked(getApiClient).mockResolvedValue(mockClient as any);
    vi.clearAllMocks();
  });

  describe('tagsList', () => {
    it('应该成功获取表的属性点列表', async () => {
      const mockTags = [
        { id: 'tag-1', name: '温度', dataType: 1, unit: '°C' },
        { id: 'tag-2', name: '湿度', dataType: 1, unit: '%' },
      ];
      mockClient.getTags.mockResolvedValue(mockTags);

      await tagsCmds.tagsList('table-1', {});

      expect(mockClient.getTags).toHaveBeenCalledWith('table-1');
    });
  });

  describe('recordTagsList', () => {
    it('应该成功获取记录的属性点数据', async () => {
      const mockTagData = [
        { name: '温度', value: 25.5, unit: '°C', updateTime: 1640000000000 },
        { name: '湿度', value: 60, unit: '%', updateTime: 1640000000000 },
      ];
      mockClient.getRecordTags.mockResolvedValue(mockTagData);

      await tagsCmds.recordTagsList('table-1', 'rec-1', {});

      expect(mockClient.getRecordTags).toHaveBeenCalledWith('table-1', 'rec-1');
    });
  });
});
