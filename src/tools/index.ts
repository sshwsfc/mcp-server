import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { AiriotApiClient } from '../airiot-api.js';
import { promises as fs } from 'fs';
import path from 'path';

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
    description: '创建新的数据表，需要提供完整的表结构定义（schema）',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: '表ID，唯一标识（必填）',
        },
        title: {
          type: 'string',
          description: '表标题/显示名称（必填）',
        },
        showField: {
          type: 'string',
          description: '显示字段，用于列表展示的默认字段',
        },
        formschema: {
          type: 'object',
          description: '表单模式配置（可选）',
        },
        schema: {
          type: 'object',
          description: '表结构定义（必填），包含字段定义、表单配置等完整结构。示例：\n{\n  "form": ["name", "id", "online"],\n  "key": "modelProperties",\n  "listFields": ["name", "id", "online"],\n  "name": "modelProperties",\n  "properties": {\n    "name": {\n      "type": "string",\n      "key": "name",\n      "title": "名称",\n      "fieldType": "input",\n      "listFields": true,\n      "createShow": true,\n      "editShow": true,\n      "need": true\n    },\n    "online": {\n      "type": "boolean",\n      "key": "online",\n      "title": "在线",\n      "fieldType": "boolean",\n      "listFields": true,\n      "createShow": false,\n      "editShow": false,\n      "disabled": true\n    }\n  },\n  "required": ["name"],\n  "title": "模型属性",\n  "type": "object"\n}',
        },
      },
      required: ['id', 'title', 'schema'],
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

  // ==================== 报警模块工具 ====================

  // --------------------
  // 报警规则管理工具
  // --------------------
  {
    name: 'get_warning_rules',
    description: '查询报警规则列表，支持过滤、排序和分页',
    inputSchema: {
      type: 'object',
      properties: {
        filter: {
          type: 'object',
          description: '查询过滤条件，例如: {"enable": true, "level": 4}',
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
        withCount: {
          type: 'boolean',
          description: '是否返回总数',
          default: false,
        },
      },
    },
  },

  {
    name: 'get_warning_rule_by_id',
    description: '根据ID查询单个报警规则的详细信息',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: '规则ID',
        },
      },
      required: ['id'],
    },
  },

  {
    name: 'create_warning_rule',
    description: '创建新的报警规则',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: '规则名称',
        },
        level: {
          type: 'number',
          description: '报警级别: 1-提示, 2-一般, 3-重要, 4-紧急',
          enum: [1, 2, 3, 4],
        },
        enable: {
          type: 'boolean',
          description: '是否启用',
          default: true,
        },
        description: {
          type: 'string',
          description: '规则描述',
        },
        tags: {
          type: 'array',
          description: '关联的属性点列表',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', description: '属性点ID' },
              name: { type: 'string', description: '属性点名称' },
              deviceId: { type: 'string', description: '设备ID' },
              deviceName: { type: 'string', description: '设备名称' },
            },
          },
        },
        applyRange: {
          type: 'object',
          description: '应用范围配置',
          properties: {
            type: { type: 'string', enum: ['all', 'device', 'tag'] },
            deviceIds: { type: 'array', items: { type: 'string' } },
            tagIds: { type: 'array', items: { type: 'string' } },
            tableIds: { type: 'array', items: { type: 'string' } },
          },
        },
      },
      required: ['name', 'level'],
    },
  },

  {
    name: 'update_warning_rule',
    description: '更新报警规则',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: '规则ID',
        },
        name: {
          type: 'string',
          description: '规则名称',
        },
        level: {
          type: 'number',
          description: '报警级别: 1-提示, 2-一般, 3-重要, 4-紧急',
          enum: [1, 2, 3, 4],
        },
        enable: {
          type: 'boolean',
          description: '是否启用',
        },
        description: {
          type: 'string',
          description: '规则描述',
        },
      },
      required: ['id'],
    },
  },

  {
    name: 'delete_warning_rule',
    description: '删除报警规则',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: '规则ID',
        },
      },
      required: ['id'],
    },
  },

  // --------------------
  // 报警管理工具
  // --------------------
  {
    name: 'get_warnings',
    description: '查询报警列表，支持按级别、状态、设备、时间范围等过滤',
    inputSchema: {
      type: 'object',
      properties: {
        filter: {
          type: 'object',
          description: '查询过滤条件，例如: {"level": 4, "status": 0, "deviceId": "xxx"}',
        },
        sort: {
          type: 'object',
          description: '排序条件，例如: {"occurTime": -1} 表示按发生时间倒序',
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
        withCount: {
          type: 'boolean',
          description: '是否返回总数',
          default: false,
        },
        // 快捷过滤参数
        level: {
          type: 'number',
          description: '报警级别: 1-提示, 2-一般, 3-重要, 4-紧急',
          enum: [1, 2, 3, 4],
        },
        status: {
          type: 'number',
          description: '报警状态: 0-未确认, 1-已确认, 2-已恢复, 3-已归档',
          enum: [0, 1, 2, 3],
        },
        ruleId: {
          type: 'string',
          description: '规则ID',
        },
        deviceId: {
          type: 'string',
          description: '设备ID',
        },
        tagId: {
          type: 'string',
          description: '属性点ID',
        },
        startTime: {
          type: 'number',
          description: '开始时间戳（毫秒）',
        },
        endTime: {
          type: 'number',
          description: '结束时间戳（毫秒）',
        },
        keyword: {
          type: 'string',
          description: '关键词搜索',
        },
      },
    },
  },

  {
    name: 'get_warning_by_id',
    description: '根据ID查询单个报警的详细信息',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: '报警ID',
        },
      },
      required: ['id'],
    },
  },

  {
    name: 'create_warning',
    description: '创建新的报警记录',
    inputSchema: {
      type: 'object',
      properties: {
        ruleId: {
          type: 'string',
          description: '规则ID',
        },
        level: {
          type: 'number',
          description: '报警级别: 1-提示, 2-一般, 3-重要, 4-紧急',
          enum: [1, 2, 3, 4],
        },
        status: {
          type: 'number',
          description: '报警状态: 0-未确认, 1-已确认, 2-已恢复, 3-已归档',
          enum: [0, 1, 2, 3],
          default: 0,
        },
        title: {
          type: 'string',
          description: '报警标题',
        },
        content: {
          type: 'string',
          description: '报警内容',
        },
        deviceId: {
          type: 'string',
          description: '设备ID',
        },
        deviceName: {
          type: 'string',
          description: '设备名称',
        },
        tagId: {
          type: 'string',
          description: '属性点ID',
        },
        tagName: {
          type: 'string',
          description: '属性点名称',
        },
        tagValue: {
          description: '当前值',
        },
        threshold: {
          description: '阈值',
        },
        occurTime: {
          type: 'number',
          description: '发生时间戳（毫秒）',
        },
      },
      required: ['level', 'content'],
    },
  },

  {
    name: 'update_warning',
    description: '更新报警信息（状态、确认信息等）',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: '报警ID',
        },
        status: {
          type: 'number',
          description: '报警状态: 0-未确认, 1-已确认, 2-已恢复, 3-已归档',
          enum: [0, 1, 2, 3],
        },
        confirmTime: {
          type: 'number',
          description: '确认时间戳（毫秒）',
        },
        confirmUser: {
          type: 'string',
          description: '确认人',
        },
        confirmNote: {
          type: 'string',
          description: '确认备注',
        },
        recoverTime: {
          type: 'number',
          description: '恢复时间戳（毫秒）',
        },
        recoverNote: {
          type: 'string',
          description: '恢复备注',
        },
      },
      required: ['id'],
    },
  },

  {
    name: 'delete_warning',
    description: '删除报警记录',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: '报警ID',
        },
      },
      required: ['id'],
    },
  },

  {
    name: 'batch_confirm_warnings',
    description: '批量确认报警',
    inputSchema: {
      type: 'object',
      properties: {
        ids: {
          type: 'array',
          description: '报警ID列表',
          items: { type: 'string' },
        },
        note: {
          type: 'string',
          description: '确认备注',
        },
        userId: {
          type: 'string',
          description: '操作用户ID',
        },
      },
      required: ['ids'],
    },
  },

  {
    name: 'get_archived_warnings',
    description: '查询已归档的报警列表',
    inputSchema: {
      type: 'object',
      properties: {
        filter: {
          type: 'object',
          description: '查询过滤条件',
        },
        sort: {
          type: 'object',
          description: '排序条件',
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
        withCount: {
          type: 'boolean',
          description: '是否返回总数',
          default: false,
        },
      },
    },
  },

  {
    name: 'restore_archived_warning',
    description: '恢复已归档的报警',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: '归档记录ID',
        },
      },
      required: ['id'],
    },
  },

  {
    name: 'get_archive_setting',
    description: '获取自动归档设置',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },

  {
    name: 'update_archive_setting',
    description: '更新自动归档设置',
    inputSchema: {
      type: 'object',
      properties: {
        enable: {
          type: 'boolean',
          description: '是否启用自动归档',
        },
        archiveDays: {
          type: 'number',
          description: '归档天数（多少天前的报警自动归档）',
        },
        archiveStatus: {
          type: 'number',
          description: '归档条件状态: 2-已恢复',
          enum: [2],
        },
      },
    },
  },

  {
    name: 'get_warning_descriptions',
    description: '获取报警描述列表',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },

  {
    name: 'archive_all_warnings',
    description: '一键归档所有符合条件的报警',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },

  {
    name: 'get_warning_statistics',
    description: '获取报警统计信息（总数、各级别数量、各状态数量等）',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },

  {
    name: 'get_latest_warnings',
    description: '获取最新的报警列表',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: '返回数量限制',
          default: 10,
        },
      },
    },
  },

  {
    name: 'get_warning_timeline',
    description: '获取报警时间线数据（指定时间段内的报警趋势）',
    inputSchema: {
      type: 'object',
      properties: {
        startTime: {
          type: 'number',
          description: '开始时间戳（毫秒）',
        },
        endTime: {
          type: 'number',
          description: '结束时间戳（毫秒）',
        },
        level: {
          type: 'number',
          description: '过滤指定级别: 1-提示, 2-一般, 3-重要, 4-紧急',
          enum: [1, 2, 3, 4],
        },
      },
      required: ['startTime', 'endTime'],
    },
  },

  // --------------------
  // 报警清除管理工具
  // --------------------
  {
    name: 'get_warning_cleans',
    description: '查询报警清除规则列表',
    inputSchema: {
      type: 'object',
      properties: {
        filter: {
          type: 'object',
          description: '查询过滤条件',
        },
        sort: {
          type: 'object',
          description: '排序条件',
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
        withCount: {
          type: 'boolean',
          description: '是否返回总数',
          default: false,
        },
      },
    },
  },

  {
    name: 'get_warning_clean_by_id',
    description: '根据ID查询单个清除规则的详细信息',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: '清除规则ID',
        },
      },
      required: ['id'],
    },
  },

  {
    name: 'create_warning_clean',
    description: '创建新的报警清除规则',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: '清除规则名称',
        },
        enable: {
          type: 'boolean',
          description: '是否启用',
          default: true,
        },
        cleanType: {
          type: 'string',
          description: '清除类型: archive-归档, delete-删除',
          enum: ['archive', 'delete'],
        },
        cleanCondition: {
          type: 'object',
          description: '清除条件',
          properties: {
            status: {
              type: 'number',
              description: '报警状态: 2-已恢复, 3-已归档',
              enum: [2, 3],
            },
            beforeDays: {
              type: 'number',
              description: '多久之前的报警（天）',
            },
            level: {
              type: 'number',
              description: '报警级别',
              enum: [1, 2, 3, 4],
            },
          },
        },
      },
      required: ['name', 'cleanType', 'cleanCondition'],
    },
  },

  {
    name: 'update_warning_clean',
    description: '更新报警清除规则',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: '清除规则ID',
        },
        name: {
          type: 'string',
          description: '清除规则名称',
        },
        enable: {
          type: 'boolean',
          description: '是否启用',
        },
        cleanType: {
          type: 'string',
          description: '清除类型: archive-归档, delete-删除',
          enum: ['archive', 'delete'],
        },
        cleanCondition: {
          type: 'object',
          description: '清除条件',
        },
      },
      required: ['id'],
    },
  },

  {
    name: 'delete_warning_clean',
    description: '删除报警清除规则',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: '清除规则ID',
        },
      },
      required: ['id'],
    },
  },

  {
    name: 'execute_warning_clean',
    description: '立即执行清除规则',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: '清除规则ID',
        },
      },
      required: ['id'],
    },
  },

  // --------------------
  // 兼容旧接口（废弃）
  // --------------------
  {
    name: 'get_alarms',
    description: '[已废弃] 请使用 get_warnings 替代。查询告警列表，支持按级别、状态、时间范围过滤',
    inputSchema: {
      type: 'object',
      properties: {
        level: {
          type: 'string',
          description: '告警级别: critical, warning, info',
          enum: ['critical', 'warning', 'info'],
        },
        status: {
          type: 'string',
          description: '告警状态: active, acknowledged, resolved',
          enum: ['active', 'acknowledged', 'resolved'],
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
    name: 'get_alarm_by_id',
    description: '[已废弃] 请使用 get_warning_by_id 替代。根据ID查询单个告警的详细信息',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: '告警ID',
        },
      },
      required: ['id'],
    },
  },

  {
    name: 'acknowledge_alarm',
    description: '[已废弃] 请使用 update_warning 替代。确认告警，将告警状态从active改为acknowledged',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: '告警ID',
        },
        note: {
          type: 'string',
          description: '确认备注',
        },
        userId: {
          type: 'string',
          description: '确认用户ID（可选）',
        },
      },
      required: ['id'],
    },
  },

  {
    name: 'resolve_alarm',
    description: '[已废弃] 请使用 update_warning 替代。解除告警，将告警状态改为resolved',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: '告警ID',
        },
        note: {
          type: 'string',
          description: '恢复备注',
        },
      },
      required: ['id'],
    },
  },

  // ==================== 文件管理工具 ====================
  {
    name: 'upload_file',
    description: '上传文件到AIRIOT平台',
    inputSchema: {
      type: 'object',
      properties: {
        filePath: {
          type: 'string',
          description: '本地文件路径',
        },
        filename: {
          type: 'string',
          description: '文件名（可选，默认使用原文件名）',
        },
        mimeType: {
          type: 'string',
          description: 'MIME类型（可选）',
        },
      },
      required: ['filePath'],
    },
  },

  {
    name: 'get_file_info',
    description: '获取文件信息',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: '文件ID',
        },
      },
      required: ['id'],
    },
  },

  {
    name: 'delete_file',
    description: '删除文件',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: '文件ID',
        },
      },
      required: ['id'],
    },
  },

  // ==================== 设备控制工具 ====================
  {
    name: 'send_control_command',
    description: '向设备发送控制命令',
    inputSchema: {
      type: 'object',
      properties: {
        deviceId: {
          type: 'string',
          description: '设备ID',
        },
        tagName: {
          type: 'string',
          description: '属性点名称',
        },
        value: {
          description: '控制值（可以是数字、字符串、布尔值等）',
        },
        timeout: {
          type: 'number',
          description: '超时时间（秒），默认30秒',
          default: 30,
        },
      },
      required: ['deviceId', 'tagName', 'value'],
    },
  },

  {
    name: 'send_batch_control_commands',
    description: '批量发送控制命令',
    inputSchema: {
      type: 'object',
      properties: {
        commands: {
          type: 'array',
          description: '控制命令数组',
          items: {
            type: 'object',
            properties: {
              deviceId: { type: 'string' },
              tagName: { type: 'string' },
              value: { description: '控制值' },
              timeout: { type: 'number' },
            },
            required: ['deviceId', 'tagName', 'value'],
          },
        },
      },
      required: ['commands'],
    },
  },

  // ==================== 报表管理工具 ====================
  {
    name: 'get_reports',
    description: '查询报表列表',
    inputSchema: {
      type: 'object',
      properties: {
        filter: {
          type: 'object',
          description: '查询过滤条件',
        },
        limit: {
          type: 'number',
          description: '返回数量限制',
          default: 50,
        },
      },
    },
  },

  {
    name: 'get_report_by_id',
    description: '根据ID查询单个报表的详细信息',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: '报表ID',
        },
      },
      required: ['id'],
    },
  },

  {
    name: 'execute_report',
    description: '执行报表生成，返回报表数据',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: '报表ID',
        },
        parameters: {
          type: 'object',
          description: '报表参数（可选）',
        },
      },
      required: ['id'],
    },
  },

  {
    name: 'create_report',
    description: '创建新报表',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: '报表名称',
        },
        description: {
          type: 'string',
          description: '报表描述',
        },
        type: {
          type: 'string',
          description: '报表类型',
        },
        config: {
          type: 'object',
          description: '报表配置',
        },
      },
      required: ['name', 'type'],
    },
  },

  {
    name: 'update_report',
    description: '更新报表信息',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: '报表ID',
        },
        name: {
          type: 'string',
          description: '报表名称',
        },
        description: {
          type: 'string',
          description: '报表描述',
        },
        config: {
          type: 'object',
          description: '报表配置',
        },
      },
      required: ['id'],
    },
  },

  {
    name: 'delete_report',
    description: '删除报表',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: '报表ID',
        },
      },
      required: ['id'],
    },
  },

  // ==================== 用户管理工具 ====================
  {
    name: 'login',
    description: '用户登录，返回 token 和用户信息',
    inputSchema: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          description: '用户名',
        },
        password: {
          type: 'string',
          description: '密码',
        },
        code: {
          type: 'string',
          description: '验证码（如果需要）',
        },
      },
      required: ['username', 'password'],
    },
  },

  {
    name: 'get_current_user',
    description: '获取当前登录用户的信息',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },

  {
    name: 'get_users',
    description: '获取用户列表',
    inputSchema: {
      type: 'object',
      properties: {
        filter: {
          type: 'object',
          description: '查询过滤条件',
        },
        limit: {
          type: 'number',
          description: '返回数量限制',
          default: 50,
        },
      },
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

    // ==================== 报警模块工具 ====================

    // 报警规则管理
    case 'get_warning_rules':
      return await apiClient.getWarningRules(args);
    case 'get_warning_rule_by_id':
      return await apiClient.getWarningRuleById(args.id);
    case 'create_warning_rule':
      return await apiClient.createWarningRule(args);
    case 'update_warning_rule':
      return await apiClient.updateWarningRule(args.id, args);
    case 'delete_warning_rule':
      return await apiClient.deleteWarningRule(args.id);

    // 报警管理
    case 'get_warnings':
      return await apiClient.getWarnings(args);
    case 'get_warning_by_id':
      return await apiClient.getWarningById(args.id);
    case 'create_warning':
      return await apiClient.createWarning(args);
    case 'update_warning':
      return await apiClient.updateWarning(args.id, args);
    case 'delete_warning':
      return await apiClient.deleteWarning(args.id);
    case 'batch_confirm_warnings':
      return await apiClient.batchConfirmWarnings(args);
    case 'get_archived_warnings':
      return await apiClient.getArchivedWarnings(args);
    case 'restore_archived_warning':
      return await apiClient.restoreArchivedWarning(args.id);
    case 'get_archive_setting':
      return await apiClient.getArchiveSetting();
    case 'update_archive_setting':
      return await apiClient.updateArchiveSetting(args);
    case 'get_warning_descriptions':
      return await apiClient.getWarningDescriptions();
    case 'archive_all_warnings':
      return await apiClient.archiveAllWarnings();
    case 'get_warning_statistics':
      return await apiClient.getWarningStatistics();
    case 'get_latest_warnings':
      return await apiClient.getLatestWarnings(args.limit);
    case 'get_warning_timeline':
      return await apiClient.getWarningTimeline(args.startTime, args.endTime, args.level);

    // 报警清除管理
    case 'get_warning_cleans':
      return await apiClient.getWarningCleans(args);
    case 'get_warning_clean_by_id':
      return await apiClient.getWarningCleanById(args.id);
    case 'create_warning_clean':
      return await apiClient.createWarningClean(args);
    case 'update_warning_clean':
      return await apiClient.updateWarningClean(args.id, args);
    case 'delete_warning_clean':
      return await apiClient.deleteWarningClean(args.id);
    case 'execute_warning_clean':
      return await apiClient.executeWarningClean(args.id);

    // 兼容旧接口（废弃）
    case 'get_alarms':
      return await apiClient.getAlarms(args);
    case 'get_alarm_by_id':
      return await apiClient.getAlarmById(args.id);
    case 'acknowledge_alarm':
      return await apiClient.acknowledgeAlarm(args.id, args.note, args.userId);
    case 'resolve_alarm':
      return await apiClient.resolveAlarm(args.id, args.note);

    // 文件管理
    case 'upload_file':
      {
        const filePath = args.filePath;
        const filename = args.filename || path.basename(filePath);
        const fileBuffer = await fs.readFile(filePath);
        return await apiClient.uploadFile(fileBuffer, filename, args.mimeType);
      }
    case 'get_file_info':
      return await apiClient.getFileInfo(args.id);
    case 'delete_file':
      return await apiClient.deleteFile(args.id);

    // 设备控制
    case 'send_control_command':
      return await apiClient.sendControlCommand({
        deviceId: args.deviceId,
        tagName: args.tagName,
        value: args.value,
        timeout: args.timeout,
      });
    case 'send_batch_control_commands':
      return await apiClient.sendBatchControlCommands(args.commands);

    // 报表管理
    case 'get_reports':
      return await apiClient.getReports(args);
    case 'get_report_by_id':
      return await apiClient.getReportById(args.id);
    case 'execute_report':
      return await apiClient.executeReport(args.id, args.parameters);
    case 'create_report':
      return await apiClient.createReport(args);
    case 'update_report':
      return await apiClient.updateReport(args.id, args);
    case 'delete_report':
      return await apiClient.deleteReport(args.id);

    // 用户管理
    case 'login':
      return await apiClient.login(args.username, args.password, args.code);
    case 'get_current_user':
      return await apiClient.getCurrentUser();
    case 'get_users':
      return await apiClient.getUsers(args);

    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}
