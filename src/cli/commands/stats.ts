import { getApiClient, executeCommand } from '../utils.js';
import { formatOutput } from '../formatter.js';

// ==================== 统计 ====================

export async function statsOnline(tableIds: string[], options: any = {}): Promise<void> {
  await executeCommand(async () => {
    const client = await getApiClient();
    const result = await client.getOnlineStats(tableIds);
    console.log(formatOutput(result, options.output));
  });
}
