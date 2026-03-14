/**
 * 用户管理命令测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as usersCmds from './users.js';

vi.mock('../utils.js', () => ({
  getApiClient: vi.fn(),
  executeCommand: vi.fn((fn) => fn()),
}));

vi.mock('../formatter.js', () => ({
  formatOutput: vi.fn((data) => JSON.stringify(data)),
}));

describe('用户管理命令', () => {
  const mockClient = {
    getCurrentUser: vi.fn(),
    getUsers: vi.fn(),
  };

  beforeEach(async () => {
    const { getApiClient } = await import('../utils.js');
    vi.mocked(getApiClient).mockResolvedValue(mockClient as any);
    vi.clearAllMocks();
  });

  describe('userGetCurrent', () => {
    it('应该成功获取当前用户信息', async () => {
      const mockUser = {
        id: 'user-1',
        username: 'testuser',
        nickname: '测试用户',
        email: 'test@example.com',
        roles: ['admin'],
        createTime: 1640000000000,
      };
      mockClient.getCurrentUser.mockResolvedValue(mockUser);

      await usersCmds.userGetCurrent({});

      expect(mockClient.getCurrentUser).toHaveBeenCalled();
    });

    it('应该支持不同的输出格式', async () => {
      const mockUser = {
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
      };
      mockClient.getCurrentUser.mockResolvedValue(mockUser);

      await usersCmds.userGetCurrent({ output: 'json' });

      expect(mockClient.getCurrentUser).toHaveBeenCalled();
    });
  });

  describe('usersList', () => {
    it('应该成功获取用户列表', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          username: 'user1',
          nickname: '用户1',
          email: 'user1@example.com',
        },
        {
          id: 'user-2',
          username: 'user2',
          nickname: '用户2',
          email: 'user2@example.com',
        },
      ];
      mockClient.getUsers.mockResolvedValue(mockUsers);

      await usersCmds.usersList({ limit: 50 });

      expect(mockClient.getUsers).toHaveBeenCalledWith({ limit: 50 });
    });

    it('应该支持过滤条件', async () => {
      const filter = { role: 'admin' };
      mockClient.getUsers.mockResolvedValue([]);

      await usersCmds.usersList({
        filter: JSON.stringify(filter),
      });

      expect(mockClient.getUsers).toHaveBeenCalledWith({ filter });
    });

    it('应该支持限制返回数量', async () => {
      mockClient.getUsers.mockResolvedValue([]);

      await usersCmds.usersList({ limit: 10 });

      expect(mockClient.getUsers).toHaveBeenCalledWith({ limit: 10 });
    });
  });
});
