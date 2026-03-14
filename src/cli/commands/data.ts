import { getApiClient, executeCommand } from '../utils.js';
import { formatOutput } from '../formatter.js';
import { promises as fs } from 'fs';

// ==================== 时序数据查询 ====================

export async function dataLatest(options: any): Promise<void> {
  await executeCommand(async () => {
    let pairs: any[] = [];
    if (options.file) {
      const content = await fs.readFile(options.file, 'utf-8');
      pairs = JSON.parse(content);
    } else if (options.json) {
      pairs = JSON.parse(options.json);
    } else if (options.device && options.tag) {
      pairs = [{ deviceId: options.device, tagId: options.tag }];
    }

    const client = await getApiClient();
    const result = await client.getLatestData(pairs);
    console.log(formatOutput(result, options.output));
  });
}

export async function dataHistory(options: any): Promise<void> {
  await executeCommand(async () => {
    let pairs: any[] = [];
    if (options.file) {
      const content = await fs.readFile(options.file, 'utf-8');
      pairs = JSON.parse(content);
    } else if (options.json) {
      pairs = JSON.parse(options.json);
    } else if (options.device && options.tag) {
      pairs = [{ deviceId: options.device, tagId: options.tag }];
    }

    const client = await getApiClient();
    const result = await client.getHistoryData(
      pairs,
      parseInt(options.start),
      parseInt(options.end),
      options.limit ? parseInt(options.limit) : undefined
    );
    console.log(formatOutput(result, options.output));
  });
}
