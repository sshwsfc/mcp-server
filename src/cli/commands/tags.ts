import { getApiClient, executeCommand } from '../utils.js';
import { formatOutput } from '../formatter.js';

// ==================== 属性点查询 ====================

export async function tagsList(tableId: string, options: any = {}): Promise<void> {
  await executeCommand(async () => {
    const client = await getApiClient();
    const result = await client.getTableTags(tableId);
    console.log(formatOutput(result, options.output));
  });
}

export async function recordTagsList(tableName: string, recordId: string, options: any = {}): Promise<void> {
  await executeCommand(async () => {
    const client = await getApiClient();
    const result = await client.getRecordTags(tableName, recordId);
    console.log(formatOutput(result, options.output));
  });
}
