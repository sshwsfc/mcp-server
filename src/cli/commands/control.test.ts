/**
 * 设备控制命令测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as controlCmds from './control.js';

vi.mock('../utils.js', () => ({
  getApiClient: vi.fn(),
  executeCommand: vi.fn((fn) => fn()),
}));

vi.mock('../formatter.js', () => ({
  formatOutput: vi.fn((data) => JSON.stringify(data)),
}));

describe('设备控制命令', () => {
  const mockClient = {
    sendControlCommand: vi.fn(),
    sendBatchControlCommands: vi.fn(),
  };

  beforeEach(async () => {
    const { getApiClient } = await import('../utils.js');
    vi.mocked(getApiClient).mockResolvedValue(mockClient as any);
    vi.clearAllMocks();
  });

  describe('controlSend', () => {
    it('应该成功发送控制命令', async () => {
      const mockResult = {
        success: true,
        deviceId: 'device-1',
        tagName: 'temperature',
        oldValue: 20,
        newValue: 25,
        timestamp: 1640000000000,
      };
      mockClient.sendControlCommand.mockResolvedValue(mockResult);

      await controlCmds.controlSend({
        device: 'device-1',
        tag: 'temperature',
        value: '25',
      });

      expect(mockClient.sendControlCommand).toHaveBeenCalledWith({
        deviceId: 'device-1',
        tagName: 'temperature',
        value: '25',
        timeout: undefined,
      });
    });

    it('应该支持设置超时时间', async () => {
      mockClient.sendControlCommand.mockResolvedValue({ success: true });

      await controlCmds.controlSend({
        device: 'device-1',
        tag: 'switch',
        value: 'on',
        timeout: '60',
      });

      expect(mockClient.sendControlCommand).toHaveBeenCalledWith({
        deviceId: 'device-1',
        tagName: 'switch',
        value: 'on',
        timeout: 60,
      });
    });
  });

  describe('controlBatchSend', () => {
    it('应该成功批量发送控制命令', async () => {
      const commands = [
        { deviceId: 'device-1', tagName: 'temp1', value: '25' },
        { deviceId: 'device-1', tagName: 'temp2', value: '30' },
        { deviceId: 'device-2', tagName: 'switch', value: 'on' },
      ];
      const mockResults = [
        { success: true, deviceId: 'device-1', tagName: 'temp1' },
        { success: true, deviceId: 'device-1', tagName: 'temp2' },
        { success: true, deviceId: 'device-2', tagName: 'switch' },
      ];
      mockClient.sendBatchControlCommands.mockResolvedValue(mockResults);

      await controlCmds.controlBatchSend({
        json: JSON.stringify(commands),
      });

      expect(mockClient.sendBatchControlCommands).toHaveBeenCalledWith(commands);
    });

    it('应该从文件读取批量命令', async () => {
      const commands = [
        { deviceId: 'device-1', tagName: 'temp', value: '25' },
      ];
      mockClient.sendBatchControlCommands.mockResolvedValue([]);

      const fs = await import('fs');
      vi.spyOn(fs.promises, 'readFile').mockResolvedValue(JSON.stringify(commands));

      await controlCmds.controlBatchSend({ file: 'commands.json' });

      expect(mockClient.sendBatchControlCommands).toHaveBeenCalledWith(commands);
    });

    it('应该处理批量命令失败的情况', async () => {
      const commands = [
        { deviceId: 'device-1', tagName: 'temp', value: '25' },
      ];
      const mockResults = [
        { success: false, deviceId: 'device-1', tagName: 'temp', error: '设备离线' },
      ];
      mockClient.sendBatchControlCommands.mockResolvedValue(mockResults);

      await controlCmds.controlBatchSend({
        json: JSON.stringify(commands),
      });

      expect(mockClient.sendBatchControlCommands).toHaveBeenCalledWith(commands);
    });
  });
});
