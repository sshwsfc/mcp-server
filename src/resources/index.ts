import { Resource } from '@modelcontextprotocol/sdk/types.js';
import { AiriotApiClient } from '../airiot-api.js';

/**
 * AIRIOT MCP 资源定义
 *
 * Resources 允许 AI 直接读取平台数据作为上下文
 */
export const airiotResources: Resource[] = [
  // ==================== 表资源 ====================
  {
    uri: 'airiot://tables',
    name: '数据表列表',
    description: '获取所有数据表的列表信息',
    mimeType: 'application/json',
  },
  {
    uri: 'airiot://tables/{id}',
    name: '数据表详情',
    description: '获取指定数据表的详细信息，包括字段定义',
    mimeType: 'application/json',
  },

  // ==================== 表记录资源 ====================
  {
    uri: 'airiot://table/{tableName}/records',
    name: '表记录列表',
    description: '获取指定数据表的记录列表',
    mimeType: 'application/json',
  },
  {
    uri: 'airiot://table/{tableName}/record/{id}',
    name: '表记录详情',
    description: '获取指定数据表的记录详情',
    mimeType: 'application/json',
  },

  // ==================== 设备资源 ====================
  {
    uri: 'airiot://devices',
    name: '设备列表',
    description: '获取所有设备信息',
    mimeType: 'application/json',
  },
  {
    uri: 'airiot://device/{id}',
    name: '设备详情',
    description: '获取指定设备的详细信息',
    mimeType: 'application/json',
  },

  // ==================== 属性点资源 ====================
  {
    uri: 'airiot://table/{tableId}/tags',
    name: '属性点列表',
    description: '获取数据表的所有属性点定义',
    mimeType: 'application/json',
  },

  // ==================== 时序数据资源 ====================
  {
    uri: 'airiot://device/{deviceId}/tag/{tagId}/latest',
    name: '最新数据',
    description: '获取设备属性点的最新数据',
    mimeType: 'application/json',
  },

  // ==================== 统计资源 ====================
  {
    uri: 'airiot://stats/online',
    name: '在线统计',
    description: '获取设备在线状态统计',
    mimeType: 'application/json',
  },
];

/**
 * 解析资源 URI 并返回数据
 */
export async function readResource(
  uri: string,
  apiClient: AiriotApiClient
): Promise<string> {
  try {
    // 移除协议前缀
    const path = uri.replace('airiot://', '');
    const segments = path.split('/').filter(Boolean);

    switch (segments[0]) {
      case 'tables': {
        if (segments.length === 1) {
          // airiot://tables - 获取所有表
          const tables = await apiClient.getTables({ limit: 100 });
          return JSON.stringify(tables, null, 2);
        }
        if (segments.length === 2 && segments[1] !== '{id}') {
          // airiot://tables/{id} - 获取表详情
          const table = await apiClient.getTableById(segments[1]);
          return JSON.stringify(table, null, 2);
        }
        throw new Error(`Invalid table URI: ${uri}`);
      }

      case 'table': {
        const tableName = segments[1];
        if (tableName === '{tableName}') {
          throw new Error('Table name placeholder not replaced');
        }

        if (segments[2] === 'records') {
          // airiot://table/{tableName}/records - 获取记录列表
          const result = await apiClient.getTableRecords(tableName, { limit: 100 });
          return JSON.stringify(result, null, 2);
        }

        if (segments[2] === 'record' && segments[3]) {
          // airiot://table/{tableName}/record/{id} - 获取记录详情
          const record = await apiClient.getTableRecordById(tableName, segments[3]);
          return JSON.stringify(record, null, 2);
        }

        throw new Error(`Invalid table URI: ${uri}`);
      }

      case 'devices': {
        if (segments.length === 1) {
          // airiot://devices - 获取所有设备
          const devices = await apiClient.getTableRecords('device', { limit: 100 });
          return JSON.stringify(devices, null, 2);
        }
        if (segments.length === 2 && segments[1] !== '{id}') {
          // airiot://device/{id} - 获取设备详情
          const device = await apiClient.getTableRecordById('device', segments[1]);
          return JSON.stringify(device, null, 2);
        }
        throw new Error(`Invalid device URI: ${uri}`);
      }

      case 'device': {
        if (segments[1] === '{deviceId}') {
          throw new Error('Device ID placeholder not replaced');
        }

        if (segments[2] === 'tag' && segments[3] && segments[4] === 'latest') {
          // airiot://device/{deviceId}/tag/{tagId}/latest
          const data = await apiClient.getLatestData([
            { deviceId: segments[1], tagId: segments[3] },
          ]);
          return JSON.stringify(data, null, 2);
        }
        throw new Error(`Invalid device URI: ${uri}`);
      }

      case 'stats': {
        if (segments[1] === 'online') {
          // airiot://stats/online - 获取在线统计
          const tables = await apiClient.getTables({ limit: 100 });
          const tableIds = tables.map((t) => t._id);
          const stats = await apiClient.getOnlineStats(tableIds);
          return JSON.stringify(stats, null, 2);
        }
        throw new Error(`Invalid stats URI: ${uri}`);
      }

      default:
        throw new Error(`Unknown resource URI: ${uri}`);
    }
  } catch (error: any) {
    return JSON.stringify(
      {
        error: error.message || '读取资源失败',
        uri,
      },
      null,
      2
    );
  }
}

/**
 * 列出可用资源
 */
export function listResources(): Resource[] {
  return airiotResources;
}
