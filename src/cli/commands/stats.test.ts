/**
 * 统计命令测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as statsCmds from './stats.js';

vi.mock('../utils.js', () => ({
  getApiClient: vi.fn(),
  executeCommand: vi.fn((fn) => fn()),
}));

vi.mock('../formatter.js', () => ({
  formatOutput: vi.fn((data) => JSON.stringify(data)),
}));

describe('统计命令', () => {
  const mockClient = {
    getOnlineStats: vi.fn(),
  };

  beforeEach(async () => {
    const { getApiClient } = await import('../utils.js');
    vi.mocked(getApiClient).mockResolvedValue(mockClient as any);
    vi.clearAllMocks();
  });

  describe('statsOnline', () => {
    it('应该成功获取设备在线状态统计', async () => {
      const mockStats = {
        'table-1': {
          total: 100,
          online: 85,
          offline: 15,
          onlineRate: 0.85,
        },
        'table-2': {
          total: 50,
          online: 40,
          offline: 10,
          onlineRate: 0.8,
        },
      };
      mockClient.getOnlineStats.mockResolvedValue(mockStats);

      await statsCmds.statsOnline(['table-1', 'table-2'], {});

      expect(mockClient.getOnlineStats).toHaveBeenCalledWith(['table-1', 'table-2']);
    });

    it('应该支持单个表查询', async () => {
      mockClient.getOnlineStats.mockResolvedValue({});

      await statsCmds.statsOnline(['table-1'], {});

      expect(mockClient.getOnlineStats).toHaveBeenCalledWith(['table-1']);
    });
  });
});
