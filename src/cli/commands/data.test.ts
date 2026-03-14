/**
 * 时序数据查询命令测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as dataCmds from './data.js';

vi.mock('../utils.js', () => ({
  getApiClient: vi.fn(),
  executeCommand: vi.fn((fn) => fn()),
}));

vi.mock('../formatter.js', () => ({
  formatOutput: vi.fn((data) => JSON.stringify(data)),
}));

describe('时序数据查询命令', () => {
  const mockClient = {
    getLatestData: vi.fn(),
    getHistoryData: vi.fn(),
  };

  beforeEach(async () => {
    const { getApiClient } = await import('../utils.js');
    vi.mocked(getApiClient).mockResolvedValue(mockClient as any);
    vi.clearAllMocks();
  });

  describe('dataLatest', () => {
    it('应该成功查询最新数据', async () => {
      const mockData = [
        {
          deviceId: 'device-1',
          tagId: 'tag-1',
          value: 25.5,
          timestamp: 1640000000000,
        },
      ];
      mockClient.getLatestData.mockResolvedValue(mockData);

      await dataCmds.dataLatest({
        device: 'device-1',
        tag: 'tag-1',
      });

      expect(mockClient.getLatestData).toHaveBeenCalledWith([
        { deviceId: 'device-1', tagId: 'tag-1' },
      ]);
    });

    it('应该从文件读取设备-属性点对', async () => {
      const pairs = [
        { deviceId: 'device-1', tagId: 'tag-1' },
        { deviceId: 'device-2', tagId: 'tag-2' },
      ];
      mockClient.getLatestData.mockResolvedValue([]);

      const fs = await import('fs');
      vi.spyOn(fs.promises, 'readFile').mockResolvedValue(JSON.stringify(pairs));

      await dataCmds.dataLatest({ file: 'pairs.json' });

      expect(mockClient.getLatestData).toHaveBeenCalledWith(pairs);
    });
  });

  describe('dataHistory', () => {
    it('应该成功查询历史数据', async () => {
      const mockData = [
        {
          deviceId: 'device-1',
          tagId: 'tag-1',
          value: 25.5,
          timestamp: 1640000000000,
        },
        {
          deviceId: 'device-1',
          tagId: 'tag-1',
          value: 26.0,
          timestamp: 1640000100000,
        },
      ];
      mockClient.getHistoryData.mockResolvedValue(mockData);

      await dataCmds.dataHistory({
        device: 'device-1',
        tag: 'tag-1',
        start: '1600000000000',
        end: '1700000000000',
      });

      expect(mockClient.getHistoryData).toHaveBeenCalledWith([
        {
          deviceId: 'device-1',
          tagId: 'tag-1',
          start: 1600000000000,
          end: 1700000000000,
        },
      ]);
    });

    it('应该支持限制返回数量', async () => {
      mockClient.getHistoryData.mockResolvedValue([]);

      await dataCmds.dataHistory({
        device: 'device-1',
        tag: 'tag-1',
        start: '1600000000000',
        end: '1700000000000',
        limit: '100',
      });

      expect(mockClient.getHistoryData).toHaveBeenCalledWith([
        {
          deviceId: 'device-1',
          tagId: 'tag-1',
          start: 1600000000000,
          end: 1700000000000,
          limit: 100,
        },
      ]);
    });

    it('应该从JSON读取设备-属性点对', async () => {
      const pairs = [
        {
          deviceId: 'device-1',
          tagId: 'tag-1',
          start: 1600000000000,
          end: 1700000000000,
        },
      ];
      mockClient.getHistoryData.mockResolvedValue([]);

      await dataCmds.dataHistory({
        json: JSON.stringify(pairs),
        start: '1600000000000',
        end: '1700000000000',
      });

      expect(mockClient.getHistoryData).toHaveBeenCalledWith(pairs);
    });
  });
});
