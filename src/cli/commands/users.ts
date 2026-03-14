import { getApiClient, executeCommand } from '../utils.js';
import { formatOutput } from '../formatter.js';

// ==================== 用户管理 ====================

export async function userGetCurrent(options: any = {}): Promise<void> {
  await executeCommand(async () => {
    const client = await getApiClient();
    const result = await client.getCurrentUser();
    console.log(formatOutput(result, options.output));
  });
}

export async function usersList(options: any = {}): Promise<void> {
  await executeCommand(async () => {
    const client = await getApiClient();
    const result = await client.getUsers(options);
    console.log(formatOutput(result, options.output));
  });
}
