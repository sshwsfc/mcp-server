import { getApiClient, executeCommand } from '../utils.js';
import { formatOutput, formatSuccess } from '../formatter.js';
import { promises as fs } from 'fs';
import path from 'path';

// ==================== 文件管理 ====================

export async function fileUpload(filePath: string, options: any = {}): Promise<void> {
  await executeCommand(async () => {
    const client = await getApiClient();
    const fileBuffer = await fs.readFile(filePath);
    const filename = options.name || path.basename(filePath);
    const result = await client.uploadFile(fileBuffer, filename, options.mime);
    console.log(formatOutput(result, options.output));
  });
}

export async function fileGetInfo(id: string, options: any = {}): Promise<void> {
  await executeCommand(async () => {
    const client = await getApiClient();
    const result = await client.getFileInfo(id);
    console.log(formatOutput(result, options.output));
  });
}

export async function fileDelete(id: string): Promise<void> {
  await executeCommand(async () => {
    const client = await getApiClient();
    await client.deleteFile(id);
    console.log(formatSuccess('删除成功'));
  });
}
