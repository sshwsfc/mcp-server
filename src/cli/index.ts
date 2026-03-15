#!/usr/bin/env node
import { Command } from 'commander';
import { writeConfig, clearConfig, readConfig } from './config.js';
import { AiriotApiClient } from '../airiot-api.js';
import { formatOutput, formatError, formatSuccess } from './formatter.js';

// Command modules
import * as warningCmds from './commands/warning.js';
import * as tablesCmds from './commands/tables.js';
import * as recordsCmds from './commands/records.js';
import * as tagsCmds from './commands/tags.js';
import * as dataCmds from './commands/data.js';
import * as statsCmds from './commands/stats.js';
import * as filesCmds from './commands/files.js';
import * as controlCmds from './commands/control.js';
import * as reportsCmds from './commands/reports.js';
import * as usersCmds from './commands/users.js';

const program = new Command();

/**
 * 全局选项
 */
interface GlobalOptions {
  output?: 'json' | 'table' | 'plain';
}

/**
 * 通用选项处理
 */
function addCommonOptions(cmd: Command): Command {
  return cmd.option('-o, --output <format>', '输出格式: json, table, plain', 'table');
}

/**
 * 登录命令
 */
program
  .command('login')
  .description('登录 AIRIOT 平台')
  .requiredOption('--url <url>', '平台地址，如: https://airiot.example.com')
  .requiredOption('--project <id>', '项目ID')
  .option('-u, --username <user>', '用户名')
  .option('-p, --password <pass>', '密码')
  .option('-t, --token <token>', '直接使用token')
  .action(async (options) => {
    try {
      let token = options.token;

      // 如果提供了用户名密码，进行登录获取token
      if (options.username && options.password && !token) {
        const client = new AiriotApiClient({
          baseUrl: options.url,
          projectId: options.project,
        });

        const result = await client.login(options.username, options.password);
        token = result.token;
        console.log(formatSuccess(`登录成功，欢迎 ${result.username}`));
      }

      // 保存配置
      await writeConfig({
        baseUrl: options.url,
        projectId: options.project,
        token,
        username: options.username,
      });

      console.log(formatSuccess('配置已保存'));
    } catch (error: any) {
      console.error(formatError(error.message));
      process.exit(1);
    }
  });

/**
 * 登出命令
 */
program
  .command('logout')
  .description('清除本地配置')
  .action(async () => {
    await clearConfig();
    console.log(formatSuccess('已清除配置'));
  });

/**
 * 配置查看命令
 */
program
  .command('config')
  .description('查看当前配置')
  .action(async () => {
    const config = await readConfig();
    if (!config) {
      console.log('未配置，请先运行: airiot login');
      return;
    }

    // 隐藏敏感信息
    const display = {
      baseUrl: config.baseUrl,
      projectId: config.projectId,
      username: config.username,
      hasToken: !!config.token,
      output: config.output || 'table',
    };

    console.log(formatOutput(display, 'json'));
  });

// ==================== 报警规则管理 ====================

const rulesCmd = program.command('rules').description('报警规则管理（别名: warning-rules）');

addCommonOptions(rulesCmd
  .command('list')
  .description('查询报警规则列表')
  .option('-f, --filter <json>', '过滤条件，JSON格式')
  .option('-s, --sort <json>', '排序条件，JSON格式')
  .option('-l, --limit <number>', '返回数量限制', parseInt)
  .option('--skip <number>', '跳过数量', parseInt)
  .option('--with-count', '返回总数')
  .action(async (options) => {
    await warningCmds.warningRulesList(options);
  }));

addCommonOptions(rulesCmd
  .command('get <id>')
  .description('获取单个报警规则详情')
  .action(async (id, options) => {
    await warningCmds.warningRulesGet(id, options);
  }));

rulesCmd
  .command('create')
  .description('创建报警规则')
  .requiredOption('-n, --name <name>', '规则名称')
  .requiredOption('-l, --level <number>', '报警级别: 1-提示, 2-一般, 3-重要, 4-紧急')
  .option('-e, --enable <boolean>', '是否启用', 'true')
  .option('-d, --description <text>', '规则描述')
  .action(async (options) => {
    await warningCmds.warningRulesCreate(options);
  });

rulesCmd
  .command('update <id>')
  .description('更新报警规则')
  .option('-n, --name <name>', '规则名称')
  .option('-l, --level <number>', '报警级别: 1-提示, 2-一般, 3-重要, 4-紧急')
  .option('-e, --enable <boolean>', '是否启用')
  .option('-d, --description <text>', '规则描述')
  .action(async (id, options) => {
    await warningCmds.warningRulesUpdate(id, options);
  });

rulesCmd
  .command('delete <id>')
  .description('删除报警规则')
  .action(async (id) => {
    await warningCmds.warningRulesDelete(id);
  });

// 别名说明: warning-rules 命令已由 rules 命令提供

// ==================== 报警管理 ====================

const warningsCmd = program.command('warnings').alias('w').description('报警管理');

addCommonOptions(warningsCmd
  .command('list')
  .alias('ls')
  .description('查询报警列表')
  .option('-f, --filter <json>', '过滤条件，JSON格式')
  .option('-s, --sort <json>', '排序条件，JSON格式')
  .option('-l, --limit <number>', '返回数量限制', parseInt)
  .option('--skip <number>', '跳过数量', parseInt)
  .option('--with-count', '返回总数')
  .option('--level <number>', '报警级别: 1-提示, 2-一般, 3-重要, 4-紧急')
  .option('--status <number>', '报警状态: 0-未确认, 1-已确认, 2-已恢复, 3-已归档')
  .option('--rule-id <id>', '规则ID')
  .option('--device-id <id>', '设备ID')
  .option('--tag-id <id>', '属性点ID')
  .option('--keyword <text>', '关键词搜索')
  .action(async (options) => {
    await warningCmds.warningsList(options);
  }));

addCommonOptions(warningsCmd
  .command('get <id>')
  .description('获取单个报警详情')
  .action(async (id, options) => {
    await warningCmds.warningsGet(id, options);
  }));

warningsCmd
  .command('confirm <id>')
  .description('确认报警')
  .option('-n, --note <text>', '确认备注')
  .option('--user-id <id>', '确认人ID')
  .action(async (id, options) => {
    await warningCmds.warningsConfirm(id, options);
  });

warningsCmd
  .command('resolve <id>')
  .alias('rv')
  .description('标记报警为已恢复')
  .option('-n, --note <text>', '恢复备注')
  .action(async (id, options) => {
    await warningCmds.warningsResolve(id, options);
  });

addCommonOptions(warningsCmd
  .command('stats')
  .description('获取报警统计')
  .action(async (options) => {
    await warningCmds.warningsStats(options);
  }));

addCommonOptions(warningsCmd
  .command('latest')
  .description('获取最新报警')
  .option('-l, --limit <number>', '返回数量', parseInt)
  .action(async (options) => {
    await warningCmds.warningsLatest(options);
  }));

warningsCmd
  .command('batch-confirm <ids...>')
  .description('批量确认报警')
  .option('-n, --note <text>', '确认备注')
  .option('--user-id <id>', '确认人ID')
  .action(async (ids, options) => {
    await warningCmds.warningsBatchConfirm(ids, options);
  });

// ==================== 表管理 ====================

addCommonOptions(program
  .command('tables')
  .alias('tbl')
  .description('数据表管理')
  .option('-f, --filter <json>', '过滤条件，JSON格式')
  .option('-s, --sort <json>', '排序条件，JSON格式')
  .option('-l, --limit <number>', '返回数量限制', parseInt, 50)
  .option('--skip <number>', '跳过数量', parseInt)
  .action(async (options) => {
    await tablesCmds.tablesList(options);
  }));

addCommonOptions(program
  .command('table <id>')
  .description('获取单个表详情')
  .action(async (id, options) => {
    await tablesCmds.tablesGet(id, options);
  }));

program
  .command('table-create')
  .description('创建数据表')
  .option('--file <path>', '从JSON文件读取表定义')
  .option('--json <json>', 'JSON格式的表定义数据')
  .action(async (options) => {
    await tablesCmds.tablesCreate(options);
  });

program
  .command('table-update <id>')
  .description('更新数据表')
  .option('--file <path>', '从JSON文件读取表定义')
  .option('--json <json>', 'JSON格式的表定义数据')
  .action(async (id, options) => {
    await tablesCmds.tablesUpdate(id, options);
  });

program
  .command('table-delete <id>')
  .description('删除数据表')
  .action(async (id) => {
    await tablesCmds.tablesDelete(id);
  });

// ==================== 表记录管理 ====================

addCommonOptions(program
  .command('records <table>')
  .alias('rec')
  .description('查询表记录')
  .option('-f, --filter <json>', '过滤条件，JSON格式')
  .option('-s, --sort <json>', '排序条件，JSON格式')
  .option('-l, --limit <number>', '返回数量限制', parseInt, 50)
  .option('--skip <number>', '跳过数量', parseInt)
  .option('--with-count', '返回总数')
  .action(async (table, options) => {
    await recordsCmds.recordsList(table, options);
  }));

addCommonOptions(program
  .command('record <table> <id>')
  .description('获取单条记录详情')
  .action(async (table, id, options) => {
    await recordsCmds.recordsGet(table, id, options);
  }));

program
  .command('record-create <table>')
  .description('创建记录')
  .option('--file <path>', '从JSON文件读取数据')
  .option('--json <json>', 'JSON格式的数据')
  .option('--data <json>', 'JSON格式的数据（别名）')
  .option('--upsert', '如果记录存在则更新')
  .action(async (table, options) => {
    await recordsCmds.recordsCreate(table, options);
  });

program
  .command('record-update <table> <id>')
  .description('更新记录')
  .option('--file <path>', '从JSON文件读取数据')
  .option('--json <json>', 'JSON格式的数据')
  .option('--data <json>', 'JSON格式的数据（别名）')
  .action(async (table, id, options) => {
    await recordsCmds.recordsUpdate(table, id, options);
  });

program
  .command('record-delete <table> <id>')
  .description('删除记录')
  .option('--attachment', '级联删除附件')
  .action(async (table, id, options) => {
    await recordsCmds.recordsDelete(table, id, options);
  });

program
  .command('records-batch-delete <table> <ids...>')
  .description('批量删除记录')
  .action(async (table, ids) => {
    await recordsCmds.recordsBatchDelete(table, ids);
  });

// ==================== 属性点查询 ====================

addCommonOptions(program
  .command('tags <tableId>')
  .description('查询表的属性点')
  .action(async (tableId, options) => {
    await tagsCmds.tagsList(tableId, options);
  }));

addCommonOptions(program
  .command('record-tags <table> <recordId>')
  .description('查询记录的属性点')
  .action(async (table, recordId, options) => {
    await tagsCmds.recordTagsList(table, recordId, options);
  }));

// ==================== 时序数据查询 ====================

addCommonOptions(program
  .command('data-latest')
  .description('查询最新数据')
  .option('--device <id>', '设备ID')
  .option('--tag <id>', '属性点ID')
  .option('--file <path>', '从JSON文件读取设备-属性点对')
  .option('--json <json>', 'JSON格式的设备-属性点对')
  .action(async (options) => {
    await dataCmds.dataLatest(options);
  }));

addCommonOptions(program
  .command('data-history')
  .description('查询历史数据')
  .option('--device <id>', '设备ID')
  .option('--tag <id>', '属性点ID')
  .option('--file <path>', '从JSON文件读取设备-属性点对')
  .option('--json <json>', 'JSON格式的设备-属性点对')
  .requiredOption('--start <timestamp>', '开始时间戳（毫秒）')
  .requiredOption('--end <timestamp>', '结束时间戳（毫秒）')
  .option('-l, --limit <number>', '返回数量限制', parseInt)
  .action(async (options) => {
    await dataCmds.dataHistory(options);
  }));

// ==================== 统计 ====================

addCommonOptions(program
  .command('stats-online <tableIds...>')
  .description('统计设备在线状态')
  .action(async (tableIds, options) => {
    await statsCmds.statsOnline(tableIds, options);
  }));

// ==================== 文件管理 ====================

program
  .command('file-upload <filePath>')
  .description('上传文件')
  .option('--name <name>', '文件名（默认使用原文件名）')
  .option('--mime <type>', 'MIME类型')
  .action(async (filePath, options) => {
    await filesCmds.fileUpload(filePath, options);
  });

addCommonOptions(program
  .command('file-info <id>')
  .description('获取文件信息')
  .action(async (id, options) => {
    await filesCmds.fileGetInfo(id, options);
  }));

program
  .command('file-delete <id>')
  .description('删除文件')
  .action(async (id) => {
    await filesCmds.fileDelete(id);
  });

// ==================== 设备控制 ====================

addCommonOptions(program
  .command('control-send')
  .description('发送控制命令')
  .requiredOption('--device <id>', '设备ID')
  .requiredOption('--tag <name>', '属性点名称')
  .requiredOption('--value <value>', '控制值')
  .option('--timeout <seconds>', '超时时间（秒）', parseInt)
  .action(async (options) => {
    await controlCmds.controlSend(options);
  }));

addCommonOptions(program
  .command('control-batch')
  .description('批量发送控制命令')
  .option('--file <path>', '从JSON文件读取命令')
  .option('--json <json>', 'JSON格式的命令数组')
  .action(async (options) => {
    await controlCmds.controlBatchSend(options);
  }));

// ==================== 报表管理 ====================

addCommonOptions(program
  .command('reports')
  .alias('rpt')
  .description('查询报表列表')
  .option('-f, --filter <json>', '过滤条件，JSON格式')
  .option('-l, --limit <number>', '返回数量限制', parseInt)
  .action(async (options) => {
    await reportsCmds.reportsList(options);
  }));

addCommonOptions(program
  .command('report <id>')
  .description('获取报表详情')
  .action(async (id, options) => {
    await reportsCmds.reportsGet(id, options);
  }));

addCommonOptions(program
  .command('report-execute <id>')
  .description('执行报表生成')
  .option('--file <path>', '从JSON文件读取参数')
  .option('--json <json>', 'JSON格式的参数')
  .action(async (id, options) => {
    await reportsCmds.reportsExecute(id, options);
  }));

program
  .command('report-create')
  .description('创建报表')
  .option('--file <path>', '从JSON文件读取报表定义')
  .requiredOption('-n, --name <name>', '报表名称')
  .requiredOption('-t, --type <type>', '报表类型')
  .option('-d, --description <desc>', '报表描述')
  .option('-c, --config <json>', '报表配置（JSON格式）')
  .action(async (options) => {
    await reportsCmds.reportsCreate(options);
  });

program
  .command('report-update <id>')
  .description('更新报表')
  .option('-n, --name <name>', '报表名称')
  .option('-d, --description <desc>', '报表描述')
  .option('-c, --config <json>', '报表配置（JSON格式）')
  .action(async (id, options) => {
    await reportsCmds.reportsUpdate(id, options);
  });

program
  .command('report-delete <id>')
  .description('删除报表')
  .action(async (id) => {
    await reportsCmds.reportsDelete(id);
  });

// ==================== 用户管理 ====================

addCommonOptions(program
  .command('user')
  .description('获取当前用户信息')
  .action(async (options) => {
    await usersCmds.userGetCurrent(options);
  }));

addCommonOptions(program
  .command('users')
  .description('获取用户列表')
  .option('-f, --filter <json>', '过滤条件，JSON格式')
  .option('-l, --limit <number>', '返回数量限制', parseInt)
  .action(async (options) => {
    await usersCmds.usersList(options);
  }));

/**
 * 解析并执行
 */
program.parse(process.argv);

// 如果没有参数，显示帮助
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
