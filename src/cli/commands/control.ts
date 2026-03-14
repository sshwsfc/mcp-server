import { getApiClient, executeCommand } from '../utils.js';
import { formatOutput } from '../formatter.js';
import { promises as fs } from 'fs';

// ==================== 设备控制 ====================

export async function controlSend(options: any): Promise<void> {
  await executeCommand(async () => {
    const client = await getApiClient();
    const result = await client.sendControlCommand({
      deviceId: options.device,
      tagName: options.tag,
      value: options.value,
      timeout: options.timeout ? parseInt(options.timeout) : undefined,
    });
    console.log(formatOutput(result, options.output));
  });
}

export async function controlBatchSend(options: any): Promise<void> {
  await executeCommand(async () => {
    let commands: any[] = [];
    if (options.file) {
      const content = await fs.readFile(options.file, 'utf-8');
      commands = JSON.parse(content);
    } else if (options.json) {
      commands = JSON.parse(options.json);
    }

    const client = await getApiClient();
    const result = await client.sendBatchControlCommands(commands);
    console.log(formatOutput(result, options.output));
  });
}
