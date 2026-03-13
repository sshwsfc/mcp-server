import { Prompt } from '@modelcontextprotocol/sdk/types.js';

/**
 * AIRIOT MCP 提示词模板
 *
 * Prompts 提供预定义的常用查询模板
 */
export const airiotPrompts: Prompt[] = [
  // ==================== 表查询提示词 ====================
  {
    name: 'list_tables',
    description: '列出所有数据表，支持按条件过滤',
    arguments: [
      {
        name: 'filter',
        description: '过滤条件，例如: {"type": "device"}',
        required: false,
      },
      {
        name: 'limit',
        description: '返回数量限制',
        required: false,
      },
    ],
  },
  {
    name: 'describe_table',
    description: '获取数据表的详细结构和字段定义',
    arguments: [
      {
        name: 'tableName',
        description: '表名称',
        required: true,
      },
    ],
  },

  // ==================== 数据查询提示词 ====================
  {
    name: 'query_devices',
    description: '查询设备列表，支持状态过滤和排序',
    arguments: [
      {
        name: 'status',
        description: '设备状态过滤，例如: online, offline',
        required: false,
      },
      {
        name: 'type',
        description: '设备类型过滤',
        required: false,
      },
      {
        name: 'limit',
        description: '返回数量限制',
        required: false,
      },
    ],
  },
  {
    name: 'query_device_status',
    description: '查询指定设备的详细状态信息',
    arguments: [
      {
        name: 'deviceName',
        description: '设备名称',
        required: true,
      },
    ],
  },
  {
    name: 'query_by_time_range',
    description: '查询指定时间范围内的数据记录',
    arguments: [
      {
        name: 'tableName',
        description: '表名称',
        required: true,
      },
      {
        name: 'startTime',
        description: '开始时间，格式: YYYY-MM-DD HH:mm:ss',
        required: true,
      },
      {
        name: 'endTime',
        description: '结束时间，格式: YYYY-MM-DD HH:mm:ss',
        required: true,
      },
      {
        name: 'limit',
        description: '返回数量限制',
        required: false,
      },
    ],
  },

  // ==================== 时序数据提示词 ====================
  {
    name: 'get_realtime_data',
    description: '获取设备的实时数据',
    arguments: [
      {
        name: 'deviceName',
        description: '设备名称',
        required: true,
      },
      {
        name: 'tagNames',
        description: '属性点名称列表，逗号分隔，留空则获取全部',
        required: false,
      },
    ],
  },
  {
    name: 'get_history_trend',
    description: '获取设备属性点的历史趋势数据',
    arguments: [
      {
        name: 'deviceName',
        description: '设备名称',
        required: true,
      },
      {
        name: 'tagName',
        description: '属性点名称',
        required: true,
      },
      {
        name: 'timeRange',
        description: '时间范围，例如: 1h(最近1小时), 24h, 7d, 30d',
        required: true,
      },
    ],
  },

  // ==================== 统计分析提示词 ====================
  {
    name: 'device_online_summary',
    description: '生成设备在线情况统计摘要',
    arguments: [
      {
        name: 'tableId',
        description: '表ID，留空则统计所有表',
        required: false,
      },
    ],
  },
  {
    name: 'data_statistics',
    description: '对表数据进行统计分析',
    arguments: [
      {
        name: 'tableName',
        description: '表名称',
        required: true,
      },
      {
        name: 'groupBy',
        description: '分组字段，例如: status, type',
        required: false,
      },
      {
        name: 'aggregate',
        description: '聚合操作，例如: count, avg, max, min',
        required: false,
      },
    ],
  },

  // ==================== 告警查询提示词 ====================
  {
    name: 'query_alarms',
    description: '查询告警信息',
    arguments: [
      {
        name: 'level',
        description: '告警级别，例如: critical, warning, info',
        required: false,
      },
      {
        name: 'status',
        description: '告警状态，例如: active, acknowledged, resolved',
        required: false,
      },
      {
        name: 'limit',
        description: '返回数量限制',
        required: false,
      },
    ],
  },

  // ==================== 数据操作提示词 ====================
  {
    name: 'create_device',
    description: '创建新设备记录',
    arguments: [
      {
        name: 'deviceName',
        description: '设备名称',
        required: true,
      },
      {
        name: 'deviceType',
        description: '设备类型',
        required: true,
      },
      {
        name: 'description',
        description: '设备描述',
        required: false,
      },
    ],
  },
  {
    name: 'update_device_status',
    description: '更新设备状态',
    arguments: [
      {
        name: 'deviceId',
        description: '设备ID或名称',
        required: true,
      },
      {
        name: 'status',
        description: '新状态，例如: online, offline, maintenance',
        required: true,
      },
    ],
  },
];

/**
 * 获取提示词模板内容
 */
export function getPromptMessage(
  promptName: string,
  args?: Record<string, string>
): string {
  const buildArgsText = () => {
    if (!args || Object.keys(args).length === 0) {
      return '';
    }
    return Object.entries(args)
      .map(([key, value]) => `- ${key}: ${value}`)
      .join('\n');
  };

  const argsText = buildArgsText();

  switch (promptName) {
    case 'list_tables':
      return `请列出数据表信息${argsText ? '，参数如下：\n' + argsText : ''}。

返回结果应包含：
- 表ID (_id)
- 表名称 (name)
- 表描述 (description)
- 表类型 (type)
- 创建/更新时间`;

    case 'describe_table':
      return `请获取表 "${args?.tableName || ''}" 的详细结构信息。

需要返回：
- 表的基本信息
- 所有字段定义（名称、类型、描述）
- 属性点列表（如果存在）`;

    case 'query_devices':
      return `请查询设备列表${argsText ? '，参数如下：\n' + argsText : ''}。

返回结果应包含：
- 设备ID和名称
- 设备类型
- 在线状态
- 最后更新时间`;

    case 'query_device_status':
      return `请查询设备 "${args?.deviceName || ''}" 的详细状态信息。

需要返回：
- 设备基本信息
- 当前在线状态
- 所有属性点的最新值`;

    case 'query_by_time_range':
      return `请查询表 "${args?.tableName || ''}" 在 ${args?.startTime || ''} 到 ${args?.endTime || ''} 时间范围内的数据${argsText ? '。\n其他参数：\n' + argsText : ''}。`;

    case 'get_realtime_data':
      return `请获取设备 "${args?.deviceName || ''}" 的实时数据${args?.tagNames ? '，仅包含以下属性点：' + args.tagNames : '（所有属性点）'}。

返回每个属性点的：
- 名称
- 最新值
- 单位
- 更新时间`;

    case 'get_history_trend':
      return `请获取设备 "${args?.deviceName || ''}" 的属性点 "${args?.tagName || ''}" 在 ${args?.timeRange || ''} 时间范围内的历史趋势数据。

数据应按时间排序，包含：
- 时间戳
- 数值
- 数据质量`;

    case 'device_online_summary':
      return `请生成设备在线情况统计摘要${args?.tableId ? '（表ID: ' + args.tableId + '）' : '（所有表）'}。

统计内容应包含：
- 总设备数
- 在线设备数
- 离线设备数
- 在线率百分比
- 按类型分组的在线统计`;

    case 'data_statistics':
      return `请对表 "${args?.tableName || ''}" 进行统计分析${argsText ? '，参数如下：\n' + argsText : ''}。

返回统计结果，包括：
- 总记录数
- 分组统计
- 聚合计算结果`;

    case 'query_alarms':
      return `请查询告警信息${argsText ? '，参数如下：\n' + argsText : ''}。

返回结果应包含：
- 告警ID
- 告警级别
- 告警内容
- 发生时间
- 状态`;

    case 'create_device':
      return `请创建新设备记录：
- 设备名称: ${args?.deviceName || ''}
- 设备类型: ${args?.deviceType || ''}
- 设备描述: ${args?.description || '无'}

使用 create_record 工具在 device 表中创建记录。`;

    case 'update_device_status':
      return `请更新设备 "${args?.deviceId || ''}" 的状态为 "${args?.status || ''}"。

使用 update_record 工具更新记录。`;

    default:
      return `Unknown prompt: ${promptName}`;
  }
}
