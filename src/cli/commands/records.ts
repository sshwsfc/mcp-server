import { AiriotApiClient } from '../../airiot-api.js';
import { getApiClient, executeCommand } from '../utils.js';
import { formatOutput, formatSuccess } from '../formatter.js';
import { promises as fs } from 'fs';

// ==================== 表记录管理 ====================

export async function recordsList(tableName: string, options: any = {}): Promise<void> {
  await executeCommand(async () => {
    const client = await getApiClient();
    const result = await client.getTableRecords(tableName, options);
    console.log(formatOutput(result, options.output));
  });
}

export async function recordsGet(tableName: string, id: string, options: any = {}): Promise<void> {
  await executeCommand(async () => {
    const client = await getApiClient();
    const result = await client.getTableRecordById(tableName, id);
    console.log(formatOutput(result, options.output));
  });
}

export async function recordsCreate(tableName: string, options: any): Promise<void> {
  await executeCommand(async () => {
    let data = options.data;
    if (options.file) {
      const content = await fs.readFile(options.file, 'utf-8');
      data = JSON.parse(content);
    } else if (options.json) {
      data = JSON.parse(options.json);
    }

    const client = await getApiClient();
    const id = await client.saveTableRecord(tableName, data, options.upsert);
    console.log(formatSuccess(`创建成功，记录ID: ${id}`));
  });
}

export async function recordsUpdate(tableName: string, id: string, options: any): Promise<void> {
  await executeCommand(async () => {
    let data = options.data;
    if (options.file) {
      const content = await fs.readFile(options.file, 'utf-8');
      data = JSON.parse(content);
    } else if (options.json) {
      data = JSON.parse(options.json);
    }

    const client = await getApiClient();
    await client.updateTableRecord(tableName, id, data);
    console.log(formatSuccess('更新成功'));
  });
}

export async function recordsDelete(tableName: string, id: string, options: any = {}): Promise<void> {
  await executeCommand(async () => {
    const client = await getApiClient();
    await client.deleteTableRecord(tableName, id, options.attachment);
    console.log(formatSuccess('删除成功'));
  });
}

export async function recordsBatchDelete(tableName: string, ids: string[]): Promise<void> {
  await executeCommand(async () => {
    const client = await getApiClient();
    await client.batchDeleteTableRecords(tableName, ids);
    console.log(formatSuccess(`已删除 ${ids.length} 条记录`));
  });
}
