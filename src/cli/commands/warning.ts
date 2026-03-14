import { getApiClient, executeCommand } from '../utils.js';
import { formatOutput, formatSuccess } from '../formatter.js';

/**
 * 报警规则列表
 */
export async function warningRulesList(options: any = {}): Promise<void> {
  await executeCommand(async () => {
    const client = await getApiClient();
    const result = await client.getWarningRules(options);
    console.log(formatOutput(result, options.output));
  });
}

/**
 * 获取单个报警规则
 */
export async function warningRulesGet(id: string, options: any = {}): Promise<void> {
  await executeCommand(async () => {
    const client = await getApiClient();
    const result = await client.getWarningRuleById(id);

    if (!result) {
      console.log('未找到该规则');
      return;
    }

    console.log(formatOutput(result, options.output));
  });
}

/**
 * 创建报警规则
 */
export async function warningRulesCreate(options: any): Promise<void> {
  await executeCommand(async () => {
    const client = await getApiClient();

    // 构建规则数据
    const ruleData: any = {
      name: options.name,
      level: parseInt(options.level),
      enable: options.enable !== undefined ? options.enable === 'true' : true,
    };

    if (options.description) {
      ruleData.description = options.description;
    }

    const id = await client.createWarningRule(ruleData);
    console.log(formatSuccess(`创建成功，规则ID: ${id}`));
  });
}

/**
 * 更新报警规则
 */
export async function warningRulesUpdate(id: string, options: any): Promise<void> {
  await executeCommand(async () => {
    const client = await getApiClient();

    const updateData: any = {};
    if (options.name) updateData.name = options.name;
    if (options.level) updateData.level = parseInt(options.level);
    if (options.enable !== undefined) updateData.enable = options.enable === 'true';
    if (options.description) updateData.description = options.description;

    await client.updateWarningRule(id, updateData);
    console.log(formatSuccess('更新成功'));
  });
}

/**
 * 删除报警规则
 */
export async function warningRulesDelete(id: string): Promise<void> {
  await executeCommand(async () => {
    const client = await getApiClient();
    await client.deleteWarningRule(id);
    console.log(formatSuccess('删除成功'));
  });
}

/**
 * 报警列表
 */
export async function warningsList(options: any = {}): Promise<void> {
  await executeCommand(async () => {
    const client = await getApiClient();

    // 构建查询参数
    const params: any = {
      filter: options.filter ? JSON.parse(options.filter) : undefined,
      sort: options.sort ? JSON.parse(options.sort) : undefined,
      limit: options.limit,
      skip: options.skip,
      withCount: options['with-count'],
    };

    // 添加快捷过滤
    if (options.level) params.level = parseInt(options.level);
    if (options.status !== undefined) params.status = parseInt(options.status);
    if (options['rule-id']) params.ruleId = options['rule-id'];
    if (options['device-id']) params.deviceId = options['device-id'];
    if (options['tag-id']) params.tagId = options['tag-id'];
    if (options.keyword) params.keyword = options.keyword;

    const result = await client.getWarnings(params);
    console.log(formatOutput(result, options.output));
  });
}

/**
 * 获取单个报警
 */
export async function warningsGet(id: string, options: any = {}): Promise<void> {
  await executeCommand(async () => {
    const client = await getApiClient();
    const result = await client.getWarningById(id);

    if (!result) {
      console.log('未找到该报警');
      return;
    }

    console.log(formatOutput(result, options.output));
  });
}

/**
 * 确认报警
 */
export async function warningsConfirm(id: string, options: any = {}): Promise<void> {
  await executeCommand(async () => {
    const client = await getApiClient();
    await client.updateWarning(id, {
      status: 1, // 已确认
      confirmNote: options.note,
      confirmUser: options['user-id'],
    });
    console.log(formatSuccess('确认成功'));
  });
}

/**
 * 恢复/解决报警
 */
export async function warningsResolve(id: string, options: any = {}): Promise<void> {
  await executeCommand(async () => {
    const client = await getApiClient();
    await client.updateWarning(id, {
      status: 2, // 已恢复
      recoverNote: options.note,
    });
    console.log(formatSuccess('已标记为恢复'));
  });
}

/**
 * 获取报警统计
 */
export async function warningsStats(options: any = {}): Promise<void> {
  await executeCommand(async () => {
    const client = await getApiClient();
    const result = await client.getWarningStatistics();
    console.log(formatOutput(result, options.output));
  });
}

/**
 * 获取最新报警
 */
export async function warningsLatest(options: any = {}): Promise<void> {
  await executeCommand(async () => {
    const client = await getApiClient();
    const result = await client.getLatestWarnings(options.limit || 10);
    console.log(formatOutput(result, options.output));
  });
}

/**
 * 批量确认报警
 */
export async function warningsBatchConfirm(ids: string[], options: any = {}): Promise<void> {
  await executeCommand(async () => {
    const client = await getApiClient();
    await client.batchConfirmWarnings({
      ids,
      note: options.note,
      userId: options['user-id'],
    });
    console.log(formatSuccess(`已确认 ${ids.length} 条报警`));
  });
}
