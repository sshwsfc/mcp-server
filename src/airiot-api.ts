import axios, { AxiosInstance } from 'axios';
import type { AiriotConfig, ApiResponse, QueryParams, TableSchema, TableRecord, PageResponse, Tag, TimeSeriesData } from './types.js';

/**
 * AIRIOT API 客户端
 */
export class AiriotApiClient {
  private client: AxiosInstance;
  private config: AiriotConfig;
  private token?: string;

  constructor(config: AiriotConfig) {
    this.config = config;
    this.token = config.token;

    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'x-request-project': config.projectId || 'default',
      },
    });

    // 请求拦截器
    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers['Authorization'] = `Bearer ${this.token}`;
      }
      return config;
    });

    // 响应拦截器
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error.response?.data || error.message);
        throw error;
      }
    );
  }

  /**
   * 设置认证令牌
   */
  setToken(token: string): void {
    this.token = token;
  }

  /**
   * 用户登录
   */
  async login(username: string, password: string): Promise<void> {
    const response = await this.client.post<ApiResponse<{ token: string }>>('/api/auth/login', {
      username,
      password,
      projectId: this.config.projectId,
    });

    if (response.data.code === 200 && response.data.data.token) {
      this.token = response.data.data.token;
    } else {
      throw new Error(response.data.message || '登录失败');
    }
  }



  // ==================== 表管理接口 ====================

  /**
   * 查询表数据列表
   * API: GET /core/t/schema
   */
  async getTables(params?: QueryParams): Promise<TableSchema[]> {
    const response = await this.client.get<TableSchema[]>('/core/t/schema', {
      params: { query: JSON.stringify(params || {}) },
    });

    return response.data || [];
  }

  /**
   * 根据ID查询单个表数据
   * API: GET /core/t/schema/{id}
   */
  async getTableById(id: string): Promise<TableSchema | null> {
    const response = await this.client.get<TableSchema>(`/core/t/schema/${id}`);

    return response.data || null;
  }

  /**
   * 查询子级表数据
   * API: GET /core/t/schema/{id}/children
   */
  async getChildTables(parentId: string): Promise<TableSchema[]> {
    const response = await this.client.get<TableSchema[]>(
      `/core/t/schema/${parentId}/children`
    );

    return response.data || [];
  }

  /**
   * 保存表数据
   * API: POST /core/t/schema
   */
  async saveTable(data: Partial<TableSchema>): Promise<string> {
    const response = await this.client.post<{ InsertedID: string }>(
      '/core/t/schema',
      data
    );

    if (response.data.InsertedID) {
      return response.data.InsertedID;
    }
    throw new Error('保存失败');
  }

  /**
   * 更新表数据
   * API: PATCH /core/t/schema/{id}
   */
  async updateTable(id: string, data: Partial<TableSchema>): Promise<void> {
    const response = await this.client.patch<{ status: string }>(`/core/t/schema/${id}`, data);

    if (response.data.status !== 'OK') {
      throw new Error('更新失败');
    }
  }

  /**
   * 删除表数据
   * API: DELETE /core/t/schema/{id}
   */
  async deleteTable(id: string): Promise<void> {
    const response = await this.client.delete<{ status: string }>(`/core/t/schema/${id}`);

    if (response.data.status !== 'OK') {
      throw new Error('删除失败');
    }
  }

  // ==================== 表记录管理接口 ====================

  /**
   * 查询表记录数据
   * API: GET /core/t/{table}/d
   * @param tableName 表名称(不是ID)
   * @param params 查询参数
   */
  async getTableRecords(tableName: string, params?: QueryParams): Promise<PageResponse<TableRecord>> {
    const queryParams: Record<string, any> = {};

    if (params?.withCount) {
      queryParams.withCount = true;
    }

    const response = await this.client.get<TableRecord[]>(
      `/core/t/${tableName}/d`,
      {
        params: {
          query: JSON.stringify(params || {}),
          ...queryParams,
        },
      }
    );

    let totalCount = response.data?.length || 0;

    if (params?.withCount && response.headers['count']) {
      totalCount = parseInt(response.headers['count'], 10);
    }

    return {
      list: response.data || [],
      total: totalCount,
      limit: params?.limit || 50,
      skip: params?.skip || 0,
    };
  }

  /**
   * 根据ID查询单个表记录
   * API: GET /core/t/{table}/d/{id}
   * @param tableName 表名称(不是ID)
   * @param id 记录ID
   */
  async getTableRecordById(tableName: string, id: string): Promise<TableRecord | null> {
    const response = await this.client.get<TableRecord>(
      `/core/t/${tableName}/d/${id}`
    );

    return response.data || null;
  }

  /**
   * 保存表记录数据
   * API: POST /core/t/{table}/d
   * @param tableName 表名称(不是ID)
   * @param data 记录数据
   * @param upsert 是否更新已存在的记录
   */
  async saveTableRecord(tableName: string, data: Record<string, any>, upsert: boolean = false): Promise<string> {
    const response = await this.client.post<{ InsertedID: string }>(
      `/core/t/${tableName}/d`,
      data,
      {
        params: { upsert: upsert ? 'true' : undefined },
      }
    );

    if (response.data.InsertedID) {
      return response.data.InsertedID;
    }
    throw new Error('保存失败');
  }

  /**
   * 更新表记录数据
   * API: PATCH /core/t/{table}/d/{id}
   * @param tableName 表名称(不是ID)
   * @param id 记录ID
   * @param data 更新数据
   */
  async updateTableRecord(tableName: string, id: string, data: Record<string, any>): Promise<void> {
    const response = await this.client.patch<{ status: string }>(
      `/core/t/${tableName}/d/${id}`,
      data
    );

    if (response.data.status !== 'OK') {
      throw new Error('更新失败');
    }
  }

  /**
   * 删除表记录
   * API: DELETE /core/t/{table}/d/{id}
   * @param tableName 表名称(不是ID)
   * @param id 记录ID
   * @param attachment 是否级联删除附件
   */
  async deleteTableRecord(tableName: string, id: string, attachment: boolean = false): Promise<void> {
    const response = await this.client.delete<{ status: string }>(
      `/core/t/${tableName}/d/${id}`,
      {
        params: { attachment: attachment ? 'true' : undefined },
      }
    );

    if (response.data.status !== 'OK') {
      throw new Error('删除失败');
    }
  }

  /**
   * 批量删除表记录
   * API: POST /core/t/{table}/d/batch-delete
   * @param tableName 表名称(不是ID)
   * @param ids 记录ID数组
   */
  async batchDeleteTableRecords(tableName: string, ids: string[]): Promise<void> {
    const response = await this.client.post<{ status: string }>(
      `/core/t/${tableName}/d/batch-delete`,
      { ids }
    );

    if (response.data.status !== 'OK') {
      throw new Error('批量删除失败');
    }
  }

  // ==================== 属性点管理接口 ====================

  /**
   * 查询表的属性点列表
   * API: GET /core/t/schema/tag/{id}
   * @param tableId 表ID
   */
  async getTableTags(tableId: string): Promise<Tag[]> {
    const response = await this.client.get<Tag[]>(`/core/t/schema/tag/${tableId}`);

    return response.data || [];
  }

  /**
   * 查询表记录的属性点列表
   * API: GET /core/t/{table}/d/tag/{id}
   * @param tableName 表名称(不是ID)
   * @param recordId 记录ID
   */
  async getRecordTags(tableName: string, recordId: string): Promise<Tag[]> {
    const response = await this.client.get<Tag[]>(
      `/core/t/${tableName}/d/tag/${recordId}`
    );

    return response.data || [];
  }

  // ==================== 时序数据接口 ====================

  /**
   * 查询最新数据点
   * API: POST /api/core/time-series/latest
   */
  async getLatestData(deviceTagPairs: Array<{ deviceId: string; tagId: string }>): Promise<TimeSeriesData[]> {
    const response = await this.client.post<TimeSeriesData[]>(
      '/api/core/time-series/latest',
      { deviceTagPairs }
    );

    return response.data || [];
  }

  /**
   * 查询历史时序数据
   * API: POST /api/core/time-series/history
   */
  async getHistoryData(
    deviceTagPairs: Array<{ deviceId: string; tagId: string }>,
    startTime: number,
    endTime: number,
    limit?: number
  ): Promise<TimeSeriesData[]> {
    const response = await this.client.post<TimeSeriesData[]>(
      '/api/core/time-series/history',
      {
        deviceTagPairs,
        startTime,
        endTime,
        limit,
      }
    );

    return response.data || [];
  }

  // ==================== 统计接口 ====================

  /**
   * 统计设备在线状态
   * API: GET /core/t/status/stats
   * @param tableIds 表ID数组
   */
  async getOnlineStats(tableIds: string[]): Promise<Record<string, any>[]> {
    const response = await this.client.get<Record<string, any>[]>(
      '/core/t/status/stats',
      {
        params: {
          query: JSON.stringify({ tableIds }),
        },
      }
    );

    return response.data || [];
  }
}
