/**
 * 文件管理命令测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as filesCmds from './files.js';

vi.mock('../utils.js', () => ({
  getApiClient: vi.fn(),
  executeCommand: vi.fn((fn) => fn()),
}));

vi.mock('../formatter.js', () => ({
  formatOutput: vi.fn((data) => JSON.stringify(data)),
  formatSuccess: vi.fn((msg) => `✓ ${msg}`),
}));

describe('文件管理命令', () => {
  const mockClient = {
    uploadFile: vi.fn(),
    getFileInfo: vi.fn(),
    deleteFile: vi.fn(),
  };

  beforeEach(async () => {
    const { getApiClient } = await import('../utils.js');
    vi.mocked(getApiClient).mockResolvedValue(mockClient as any);
    vi.clearAllMocks();
  });

  describe('fileUpload', () => {
    it('应该成功上传文件', async () => {
      const mockFile = {
        id: 'file-1',
        filename: 'test.pdf',
        size: 1024,
        url: 'https://test.com/file-1',
      };
      mockClient.uploadFile.mockResolvedValue(mockFile);

      const fs = await import('fs');
      const fileBuffer = Buffer.from('test content');
      vi.spyOn(fs, 'readFileSync').mockReturnValue(fileBuffer);

      await filesCmds.fileUpload('/path/to/test.pdf', {});

      expect(mockClient.uploadFile).toHaveBeenCalledWith(
        fileBuffer,
        'test.pdf',
        undefined
      );
    });

    it('应该支持自定义文件名', async () => {
      mockClient.uploadFile.mockResolvedValue({ id: 'file-1' });

      const fs = await import('fs');
      const fileBuffer = Buffer.from('test');
      vi.spyOn(fs, 'readFileSync').mockReturnValue(fileBuffer);

      await filesCmds.fileUpload('/path/to/file.pdf', { name: 'custom.pdf' });

      expect(mockClient.uploadFile).toHaveBeenCalledWith(
        fileBuffer,
        'custom.pdf',
        undefined
      );
    });

    it('应该支持指定MIME类型', async () => {
      mockClient.uploadFile.mockResolvedValue({ id: 'file-1' });

      const fs = await import('fs');
      const fileBuffer = Buffer.from('test');
      vi.spyOn(fs, 'readFileSync').mockReturnValue(fileBuffer);

      await filesCmds.fileUpload('/path/to/file.pdf', {
        mime: 'application/pdf',
      });

      expect(mockClient.uploadFile).toHaveBeenCalledWith(
        fileBuffer,
        'file.pdf',
        'application/pdf'
      );
    });
  });

  describe('fileGetInfo', () => {
    it('应该成功获取文件信息', async () => {
      const mockFile = {
        id: 'file-1',
        filename: 'test.pdf',
        size: 1024,
        mimeType: 'application/pdf',
        url: 'https://test.com/file-1',
        createTime: 1640000000000,
      };
      mockClient.getFileInfo.mockResolvedValue(mockFile);

      await filesCmds.fileGetInfo('file-1', {});

      expect(mockClient.getFileInfo).toHaveBeenCalledWith('file-1');
    });
  });

  describe('fileDelete', () => {
    it('应该成功删除文件', async () => {
      mockClient.deleteFile.mockResolvedValue(undefined);

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await filesCmds.fileDelete('file-1');

      expect(mockClient.deleteFile).toHaveBeenCalledWith('file-1');
      expect(consoleLogSpy).toHaveBeenCalledWith('✓ 删除成功');
      consoleLogSpy.mockRestore();
    });
  });
});
