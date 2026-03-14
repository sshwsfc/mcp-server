import { getApiClient, executeCommand } from '../utils.js';
import { formatOutput, formatSuccess } from '../formatter.js';
import { promises as fs } from 'fs';

// ==================== 报表管理 ====================

export async function reportsList(options: any = {}): Promise<void> {
  await executeCommand(async () => {
    const client = await getApiClient();
    const result = await client.getReports(options);
    console.log(formatOutput(result, options.output));
  });
}

export async function reportsGet(id: string, options: any = {}): Promise<void> {
  await executeCommand(async () => {
    const client = await getApiClient();
    const result = await client.getReportById(id);
    console.log(formatOutput(result, options.output));
  });
}

export async function reportsExecute(id: string, options: any = {}): Promise<void> {
  await executeCommand(async () => {
    let parameters = options.parameters;
    if (options.file) {
      const content = await fs.readFile(options.file, 'utf-8');
      parameters = JSON.parse(content);
    } else if (options.json) {
      parameters = JSON.parse(options.json);
    }

    const client = await getApiClient();
    const result = await client.executeReport(id, parameters);
    console.log(formatOutput(result, options.output));
  });
}

export async function reportsCreate(options: any): Promise<void> {
  await executeCommand(async () => {
    let data = {
      name: options.name,
      type: options.type,
      description: options.description,
      config: options.config,
    };

    if (options.file) {
      const content = await fs.readFile(options.file, 'utf-8');
      data = JSON.parse(content);
    }

    const client = await getApiClient();
    const id = await client.createReport(data);
    console.log(formatSuccess(`创建成功，报表ID: ${id}`));
  });
}

export async function reportsUpdate(id: string, options: any): Promise<void> {
  await executeCommand(async () => {
    const updateData: any = {};
    if (options.name) updateData.name = options.name;
    if (options.description) updateData.description = options.description;
    if (options.config) updateData.config = JSON.parse(options.config);

    const client = await getApiClient();
    await client.updateReport(id, updateData);
    console.log(formatSuccess('更新成功'));
  });
}

export async function reportsDelete(id: string): Promise<void> {
  await executeCommand(async () => {
    const client = await getApiClient();
    await client.deleteReport(id);
    console.log(formatSuccess('删除成功'));
  });
}
