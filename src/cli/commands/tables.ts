import { AiriotApiClient } from '../../airiot-api.js';
import { getApiClient, executeCommand } from '../utils.js';
import { formatOutput, formatSuccess } from '../formatter.js';

// ==================== 表管理 ====================

export async function tablesList(options: any = {}): Promise<void> {
  await executeCommand(async () => {
    const client = await getApiClient();
    const result = await client.getTables(options);
    console.log(formatOutput(result, options.output));
  });
}

export async function tablesGet(id: string, options: any = {}): Promise<void> {
  await executeCommand(async () => {
    const client = await getApiClient();
    const result = await client.getTableById(id);
    console.log(formatOutput(result, options.output));
  });
}

export async function tablesCreate(options: any): Promise<void> {
  await executeCommand(async () => {
    const client = await getApiClient();

    // 从 --json 参数或 --file 参数读取表定义
    let tableData: any;
    if (options.json) {
      try {
        tableData = JSON.parse(options.json);
      } catch (e) {
        throw new Error(`无效的JSON格式: ${e}`);
      }
    } else if (options.file) {
      const fs = await import('fs');
      const content = await fs.promises.readFile(options.file, 'utf-8');
      tableData = JSON.parse(content);
    } else {
      throw new Error('请提供 --json 或 --file 参数');
    }

    const id = await client.saveTable(tableData);
    console.log(formatSuccess(`创建成功，表ID: ${id}`));
  });
}

export async function tablesUpdate(id: string, options: any): Promise<void> {
  await executeCommand(async () => {
    const client = await getApiClient();

    // 从 --json 参数或 --file 参数读取表定义
    let tableData: any;
    if (options.json) {
      try {
        tableData = JSON.parse(options.json);
      } catch (e) {
        throw new Error(`无效的JSON格式: ${e}`);
      }
    } else if (options.file) {
      const fs = await import('fs');
      const content = await fs.promises.readFile(options.file, 'utf-8');
      tableData = JSON.parse(content);
    } else {
      throw new Error('请提供 --json 或 --file 参数');
    }

    await client.updateTable(id, tableData);
    console.log(formatSuccess('更新成功'));
  });
}

export async function tablesDelete(id: string): Promise<void> {
  await executeCommand(async () => {
    const client = await getApiClient();
    await client.deleteTable(id);
    console.log(formatSuccess('删除成功'));
  });
}
