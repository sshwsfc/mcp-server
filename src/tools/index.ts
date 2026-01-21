import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { AiriotApiClient } from '../airiot-api.js';

/**
 * MCP 工具定义
 */
export const airiotTools: Tool[] = [
  // ==================== 表管理工具 ====================
  {
    name: 'get_tables',
    description: '查询AIRIOT数据表列表，支持过滤、排序和分页',
    inputSchema: {
      type: 'object',
      properties: {
        filter: {
          type: 'object',
          description: '查询过滤条件，例如: {"name": "设备表"}',
        },
        sort: {
          type: 'object',
          description: '排序条件，例如: {"createTime": -1} 表示按创建时间倒序',
        },
        limit: {
          type: 'number',
          description: '返回数量限制',
          default: 50,
        },
        skip: {
          type: 'number',
          description: '跳过数量，用于分页',
          default: 0,
        },
      },
    },
  },

  {
    name: 'get_table_by_id',
    description: '根据ID查询单个数据表的详细信息',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: '表ID',
        },
      },
      required: ['id'],
    },
  },

  {
    name: 'create_table',
    description: '创建新的数据表',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: '表名称',
        },
        description: {
          type: 'string',
          description: '表描述',
        },
        type: {
          type: 'string',
          description: '表类型',
        },
      },
      required: ['name'],
    },
  },

  {
    name: 'update_table',
    description: '更新数据表信息',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: '表ID',
        },
        name: {
          type: 'string',
          description: '表名称',
        },
        description: {
          type: 'string',
          description: '表描述',
        },
      },
      required: ['id'],
    },
  },

  {
    name: 'delete_table',
    description: '删除数据表',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: '表ID',
        },
      },
      required: ['id'],
    },
  },

  // ==================== 表记录管理工具 ====================
  {
    name: 'get_table_records',
    description: '查询数据表的记录列表，支持过滤、排序、分页和字段投影',
    inputSchema: {
      type: 'object',
      properties: {
        tableName: {
          type: 'string',
          description: '表名称(不是ID)',
        },
        filter: {
          type: 'object',
          description: '查询过滤条件，类似于关系库的where参数。第一级的key可以是字段名称或者or等特殊参数。\n- 字段名称支持完全匹配和模糊搜索\n- or表示多个条件中满足其中一个即可\n- 示例1（完全匹配）: {"status": "online", "type": "sensor"}\n- 示例2（模糊搜索）: {"name": {"$regex": "设备", "$options": "i"}}\n- 示例3（or条件）: {"$or": [{"status": "online"}, {"type": "sensor"}]}\n- 示例4（组合查询）: {"status": "online", "$or": [{"type": "sensor"}, {"type": "controller"}]}',
        },
        sort: {
          type: 'object',
          description: '排序条件，类似于关系库的order by参数。格式{key:value}，key是需要排序的字段名称，value是1和-1，1表示升序，-1表示降序。\n- 可以同时按照多个字段排序，排序优先级按照字段顺序\n- 示例1（单字段升序）: {"createTime": 1}\n- 示例2（单字段降序）: {"createTime": -1}\n- 示例3（多字段排序）: {"status": 1, "createTime": -1} (先按status升序，相同值按createTime降序)',
        },
        limit: {
          type: 'number',
          description: '分页查询参数，指定返回的记录数量限制，格式{key:value}，key是limit，value是实际值。类似于关系库的LIMIT语句。',
          default: 50,
        },
        skip: {
          type: 'number',
          description: '分页查询参数，指定跳过的记录数量，用于分页，格式{key:value}，key是skip，value是实际值。类似于关系库的OFFSET语句。',
          default: 0,
        },
        project: {
          type: 'object',
          description: '字段投影，指定需要查询返回的字段，格式{key:value}，key是字段名称，value是1表示包含该字段。\n- 示例: {"name": 1, "status": 1, "createTime": 1} 只返回name、status和createTime字段',
        },
        withCount: {
          type: 'object',
          description: '总条数统计参数，格式{key:value}，key是固定值withCount，value是true。会在响应头加上count字段，对应值为总条数。\n- 示例: {"withCount": true}',
        },
      },
      required: ['tableName'],
    },
  },

  {
    name: 'get_record_by_id',
    description: '根据ID查询单个表记录的详细信息',
    inputSchema: {
      type: 'object',
      properties: {
        tableName: {
          type: 'string',
          description: '表名称(不是ID)',
        },
        id: {
          type: 'string',
          description: '记录ID',
        },
      },
      required: ['tableName', 'id'],
    },
  },

  {
    name: 'create_record',
    description: '在指定表中创建新记录',
    inputSchema: {
      type: 'object',
      properties: {
        tableName: {
          type: 'string',
          description: '表名称(不是ID)',
        },
        data: {
          type: 'object',
          description: '记录数据，键值对形式',
        },
        upsert: {
          type: 'boolean',
          description: '如果记录ID存在则更新，否则新增',
          default: false,
        },
      },
      required: ['tableName', 'data'],
    },
  },

  {
    name: 'update_record',
    description: '更新表记录数据',
    inputSchema: {
      type: 'object',
      properties: {
        tableName: {
          type: 'string',
          description: '表名称(不是ID)',
        },
        id: {
          type: 'string',
          description: '记录ID',
        },
        data: {
          type: 'object',
          description: '要更新的数据，键值对形式',
        },
      },
      required: ['tableName', 'id', 'data'],
    },
  },

  {
    name: 'delete_record',
    description: '删除单条表记录',
    inputSchema: {
      type: 'object',
      properties: {
        tableName: {
          type: 'string',
          description: '表名称(不是ID)',
        },
        id: {
          type: 'string',
          description: '记录ID',
        },
        attachment: {
          type: 'boolean',
          description: '是否级联删除附件',
          default: false,
        },
      },
      required: ['tableName', 'id'],
    },
  },

  {
    name: 'batch_delete_records',
    description: '批量删除表记录',
    inputSchema: {
      type: 'object',
      properties: {
        tableName: {
          type: 'string',
          description: '表名称(不是ID)',
        },
        ids: {
          type: 'array',
          items: { type: 'string' },
          description: '记录ID数组',
        },
      },
      required: ['tableName', 'ids'],
    },
  },

  // ==================== 属性点查询工具 ====================
  {
    name: 'get_table_tags',
    description: '查询数据表的所有属性点定义',
    inputSchema: {
      type: 'object',
      properties: {
        tableId: {
          type: 'string',
          description: '表ID',
        },
      },
      required: ['tableId'],
    },
  },

  {
    name: 'get_record_tags',
    description: '查询表记录的属性点列表',
    inputSchema: {
      type: 'object',
      properties: {
        tableName: {
          type: 'string',
          description: '表名称(不是ID)',
        },
        recordId: {
          type: 'string',
          description: '记录ID',
        },
      },
      required: ['tableName', 'recordId'],
    },
  },

  // ==================== 时序数据查询工具 ====================
  {
    name: 'get_latest_data',
    description: '查询设备属性点的最新数据',
    inputSchema: {
      type: 'object',
      properties: {
        deviceTagPairs: {
          type: 'array',
          description: '设备和属性点对数组',
          items: {
            type: 'object',
            properties: {
              deviceId: { type: 'string' },
              tagId: { type: 'string' },
            },
            required: ['deviceId', 'tagId'],
          },
        },
      },
      required: ['deviceTagPairs'],
    },
  },

  {
    name: 'get_history_data',
    description: '查询设备属性点的历史时序数据',
    inputSchema: {
      type: 'object',
      properties: {
        deviceTagPairs: {
          type: 'array',
          description: '设备和属性点对数组',
          items: {
            type: 'object',
            properties: {
              deviceId: { type: 'string' },
              tagId: { type: 'string' },
            },
            required: ['deviceId', 'tagId'],
          },
        },
        startTime: {
          type: 'number',
          description: '开始时间戳（毫秒）',
        },
        endTime: {
          type: 'number',
          description: '结束时间戳（毫秒）',
        },
        limit: {
          type: 'number',
          description: '返回数量限制',
          default: 1000,
        },
      },
      required: ['deviceTagPairs', 'startTime', 'endTime'],
    },
  },

  // ==================== 统计工具 ====================
  {
    name: 'get_online_stats',
    description: '统计数据表下设备的在线状态',
    inputSchema: {
      type: 'object',
      properties: {
        tableIds: {
          type: 'array',
          items: { type: 'string' },
          description: '表ID数组',
        },
      },
      required: ['tableIds'],
    },
  },
];

/**
 * 执行MCP工具调用
 */
export async function executeTool(
  toolName: string,
  args: any,
  apiClient: AiriotApiClient
): Promise<any> {
  switch (toolName) {
    // 表管理
    case 'get_tables':
      return await apiClient.getTables(args);
    case 'get_table_by_id':
      return await apiClient.getTableById(args.id);
    case 'create_table':
      return await apiClient.saveTable(args);
    case 'update_table':
      return await apiClient.updateTable(args.id, args);
    case 'delete_table':
      return await apiClient.deleteTable(args.id);

    // 表记录管理
    case 'get_table_records':
      return await apiClient.getTableRecords(args.tableName, args);
    case 'get_record_by_id':
      return await apiClient.getTableRecordById(args.tableName, args.id);
    case 'create_record':
      return await apiClient.saveTableRecord(args.tableName, args.data, args.upsert);
    case 'update_record':
      return await apiClient.updateTableRecord(args.tableName, args.id, args.data);
    case 'delete_record':
      return await apiClient.deleteTableRecord(args.tableName, args.id, args.attachment);
    case 'batch_delete_records':
      return await apiClient.batchDeleteTableRecords(args.tableName, args.ids);

    // 属性点查询
    case 'get_table_tags':
      return await apiClient.getTableTags(args.tableId);
    case 'get_record_tags':
      return await apiClient.getRecordTags(args.tableName, args.recordId);

    // 时序数据查询
    case 'get_latest_data':
      return await apiClient.getLatestData(args.deviceTagPairs);
    case 'get_history_data':
      return await apiClient.getHistoryData(
        args.deviceTagPairs,
        args.startTime,
        args.endTime,
        args.limit
      );

    // 统计
    case 'get_online_stats':
      return await apiClient.getOnlineStats(args.tableIds);

    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}
