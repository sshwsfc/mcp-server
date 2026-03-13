import axios, { AxiosInstance } from 'axios';
import type {
  AiriotConfig,
  QueryParams,
  TableSchema,
  TableSchemaInput,
  TableRecord,
  PageResponse,
  Tag,
  TimeSeriesData,
  // 报警模块类型
  WarningLevel,
  WarningRule,
  RuleDetailAddOrUpdate,
  Warning,
  WarningQueryParams,
  WarningStatus,
  BatchConfirmRequest,
  WarningArchive,
  ArchiveSetting,
  WarningStatistics,
  WarningTimeline,
  WarningClean,
  CleanAddOrUpdate,
  CleanExecuteResult,
  // 兼容旧类型
  Alarm,
  AlarmQueryParams,
  FileInfo,
  UploadResult,
  ControlCommand,
  ControlResult,
  Report,
  ReportData,
  LoginInput,
  LoginOutput,
} from './types.js';
import { logger } from './logger.js';
import { ApiError, NetworkError, AuthError, NotFoundError } from './errors.js';

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

    // 打印初始化配置信息
    logger.info('=== AiriotApiClient Init ===', {
      baseUrl: config.baseUrl,
      projectId: config.projectId,
      hasToken: !!config.token,
      hasUsernamePassword: !!(config.username && config.password),
      tokenLength: config.token?.length,
      tokenPrefix: config.token ? config.token.substring(0, 10) + '...' : 'none',
    });

    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'x-request-project': config.projectId || 'default',
      },
    });

    // 请求拦截器 - 添加 token 调试日志
    this.client.interceptors.request.use((config) => {
      const authHeader = config.headers['Authorization'];
      logger.debug('=== API Request ===', {
        url: config.url,
        method: config.method,
        hasToken: !!this.token,
        tokenLength: this.token?.length,
        tokenPrefix: this.token ? String(this.token).substring(0, 10) + '...' : 'none',
        authHeader: authHeader ? String(authHeader).substring(0, 20) + '...' : 'none',
        projectHeader: config.headers['x-request-project'],
      });

      if (this.token) {
        config.headers['Authorization'] = `Bearer ${this.token}`;
      }
      return config;
    });

    // 响应拦截器 - 改进错误处理
    this.client.interceptors.response.use(
      (response) => {
        logger.debug('=== API Response ===', {
          url: response.config.url,
          method: response.config.method,
          status: response.status,
          statusText: response.statusText,
        });
        return response;
      },
      (error) => {
        // 详细的错误日志
        const requestInfo = {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          statusText: error.response?.statusText,
          message: error.message,
          hasToken: !!this.token,
          requestAuthHeader: error.config?.headers?.['Authorization'] ? String(error.config.headers['Authorization']).substring(0, 20) + '...' : 'none',
        };

        // 401 错误时额外打印 token 信息
        if (error.response?.status === 401) {
          logger.error('=== Authentication Failed (401) ===', {
            ...requestInfo,
            responseData: error.response?.data,
            currentToken: this.token ? String(this.token).substring(0, 20) + '...' : 'none',
            tokenLength: this.token?.length,
          });
        } else {
          logger.error('=== API Request Failed ===', requestInfo);
        }

        // 转换为自定义错误类型
        if (error.response) {
          const { status, data } = error.response;

          if (status === 401) {
            throw new AuthError(data?.message || 'Authentication failed', data);
          }
          if (status === 404) {
            throw new NotFoundError(data?.message || 'Resource not found', data);
          }
          throw new ApiError(data?.message || 'API request failed', status, data);
        }

        if (error.request) {
          throw new NetworkError('Network error: No response received', error);
        }

        throw new ApiError(error.message || 'Unknown error');
      }
    );
  }

  /**
   * 设置认证令牌
   */
  setToken(token: string): void {
    logger.info('=== Set Token ===', {
      tokenLength: token?.length,
      tokenPrefix: token ? token.substring(0, 10) + '...' : 'none',
    });
    this.token = token;
  }

  /**
   * 用户登录
   * API: POST /core/auth/login
   */
  async login(username: string, password: string, code?: string): Promise<LoginOutput> {
    logger.info('=== Login Request ===', {
      username,
      hasPassword: !!password,
      hasCode: !!code,
      baseUrl: this.config.baseUrl,
      projectId: this.config.projectId,
    });

    const response = await this.client.post<LoginOutput>('/core/auth/login', {
      username,
      password,
      code,
    });

    const result = response.data;

    // 打印登录结果
    logger.info('=== Login Response ===', {
      success: !!result.token,
      userId: result.id,
      username: result.username,
      isSuper: result.isSuper,
      tokenLength: result.token?.length,
      tokenPrefix: result.token ? result.token.substring(0, 10) + '...' : 'none',
      rolesCount: result.roles?.length,
      permissionsCount: result.permissions?.length,
    });

    // 保存 token 到客户端
    if (result.token) {
      this.token = result.token;
      logger.info('Token saved to client', {
        tokenLength: this.token.length,
        tokenPrefix: this.token.substring(0, 10) + '...',
      });
    }

    return result;
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
   * 保存表数据（创建表）
   * API: POST /core/t/schema
   *
   * @param data 表结构定义，需要包含完整的 schema 信息
   */
  async saveTable(data: TableSchemaInput): Promise<string> {
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

  // ==================== 报警模块接口 ====================

  // --------------------
  // 报警规则管理 (/warning/rule)
  // --------------------

  /**
   * 查询报警规则列表
   * API: GET /warning/rule
   */
  async getWarningRules(params?: QueryParams): Promise<PageResponse<WarningRule>> {
    const queryParams: Record<string, any> = {};

    if (params?.withCount) {
      queryParams.withCount = true;
    }

    const response = await this.client.get<WarningRule[]>(
      '/warning/rule',
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
   * 创建报警规则
   * API: POST /warning/rule
   */
  async createWarningRule(data: RuleDetailAddOrUpdate): Promise<string> {
    const response = await this.client.post<{ InsertedID: string }>(
      '/warning/rule',
      data
    );

    if (response.data.InsertedID) {
      return response.data.InsertedID;
    }
    throw new Error('创建报警规则失败');
  }

  /**
   * 根据ID查询单个报警规则
   * API: GET /warning/rule/{id}
   */
  async getWarningRuleById(id: string): Promise<WarningRule | null> {
    const response = await this.client.get<WarningRule>(`/warning/rule/${id}`);

    return response.data || null;
  }

  /**
   * 更新报警规则
   * API: PATCH /warning/rule/{id}
   */
  async updateWarningRule(id: string, data: Partial<WarningRule>): Promise<void> {
    const response = await this.client.patch<{ status: string }>(
      `/warning/rule/${id}`,
      data
    );

    if (response.data.status !== 'OK') {
      throw new Error('更新报警规则失败');
    }
  }

  /**
   * 删除报警规则
   * API: DELETE /warning/rule/{id}
   */
  async deleteWarningRule(id: string): Promise<void> {
    const response = await this.client.delete<{ status: string }>(
      `/warning/rule/${id}`
    );

    if (response.data.status !== 'OK') {
      throw new Error('删除报警规则失败');
    }
  }

  // --------------------
  // 报警管理 (/warning/warning)
  // --------------------

  /**
   * 查询报警列表
   * API: GET /warning/warning
   */
  async getWarnings(params?: WarningQueryParams): Promise<PageResponse<Warning>> {
    const queryParams: Record<string, any> = {};

    if (params?.withCount) {
      queryParams.withCount = true;
    }

    const response = await this.client.get<Warning[]>(
      '/warning/warning',
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
   * 创建报警
   * API: POST /warning/warning
   */
  async createWarning(data: Partial<Warning>): Promise<string> {
    const response = await this.client.post<{ InsertedID: string }>(
      '/warning/warning',
      data
    );

    if (response.data.InsertedID) {
      return response.data.InsertedID;
    }
    throw new Error('创建报警失败');
  }

  /**
   * 根据ID查询单个报警
   * API: GET /warning/warning/{id}
   */
  async getWarningById(id: string): Promise<Warning | null> {
    const response = await this.client.get<Warning>(`/warning/warning/${id}`);

    return response.data || null;
  }

  /**
   * 更新报警
   * API: PATCH /warning/warning/{id}
   */
  async updateWarning(id: string, data: Partial<Warning>): Promise<void> {
    const response = await this.client.patch<{ status: string }>(
      `/warning/warning/${id}`,
      data
    );

    if (response.data.status !== 'OK') {
      throw new Error('更新报警失败');
    }
  }

  /**
   * 删除报警
   * API: DELETE /warning/warning/{id}
   */
  async deleteWarning(id: string): Promise<void> {
    const response = await this.client.delete<{ status: string }>(
      `/warning/warning/${id}`
    );

    if (response.data.status !== 'OK') {
      throw new Error('删除报警失败');
    }
  }

  /**
   * 批量确认报警
   * API: POST /warning/warning/batch-confirm
   */
  async batchConfirmWarnings(request: BatchConfirmRequest): Promise<void> {
    const response = await this.client.post<{ status: string }>(
      '/warning/warning/batch-confirm',
      request
    );

    if (response.data.status !== 'OK') {
      throw new Error('批量确认报警失败');
    }
  }

  /**
   * 查询归档报警
   * API: GET /warning/warning/archive
   */
  async getArchivedWarnings(params?: WarningQueryParams): Promise<PageResponse<WarningArchive>> {
    const queryParams: Record<string, any> = {};

    if (params?.withCount) {
      queryParams.withCount = true;
    }

    const response = await this.client.get<WarningArchive[]>(
      '/warning/warning/archive',
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
   * 恢复归档报警
   * API: POST /warning/warning/archive/restore
   */
  async restoreArchivedWarning(id: string): Promise<void> {
    const response = await this.client.post<{ status: string }>(
      `/warning/warning/archive/restore/${id}`
    );

    if (response.data.status !== 'OK') {
      throw new Error('恢复归档报警失败');
    }
  }

  /**
   * 查询归档设置
   * API: GET /warning/warning/archive-setting
   */
  async getArchiveSetting(): Promise<ArchiveSetting | null> {
    const response = await this.client.get<ArchiveSetting>(
      '/warning/warning/archive-setting'
    );

    return response.data || null;
  }

  /**
   * 更新归档设置
   * API: POST /warning/warning/archive-setting
   */
  async updateArchiveSetting(data: Partial<ArchiveSetting>): Promise<void> {
    const response = await this.client.post<{ status: string }>(
      '/warning/warning/archive-setting',
      data
    );

    if (response.data.status !== 'OK') {
      throw new Error('更新归档设置失败');
    }
  }

  /**
   * 获取报警描述列表
   * API: GET /warning/warning/descriptions
   */
  async getWarningDescriptions(): Promise<string[]> {
    const response = await this.client.get<string[]>(
      '/warning/warning/descriptions'
    );

    return response.data || [];
  }

  /**
   * 一键归档报警
   * API: POST /warning/warning/archive-all
   */
  async archiveAllWarnings(): Promise<void> {
    const response = await this.client.post<{ status: string }>(
      '/warning/warning/archive-all'
    );

    if (response.data.status !== 'OK') {
      throw new Error('一键归档失败');
    }
  }

  /**
   * 获取报警统计
   * API: GET /warning/warning/statistics
   */
  async getWarningStatistics(): Promise<WarningStatistics> {
    const response = await this.client.get<WarningStatistics>(
      '/warning/warning/statistics'
    );

    return response.data || {
      total: 0,
      active: 0,
      confirmed: 0,
      recovered: 0,
      archived: 0,
      level1: 0,
      level2: 0,
      level3: 0,
      level4: 0,
    };
  }

  /**
   * 获取最新报警
   * API: GET /warning/warning/latest
   */
  async getLatestWarnings(limit: number = 10): Promise<Warning[]> {
    const response = await this.client.get<Warning[]>(
      '/warning/warning/latest',
      {
        params: { limit },
      }
    );

    return response.data || [];
  }

  /**
   * 获取报警时间线
   * API: POST /warning/warning/timeline
   */
  async getWarningTimeline(
    startTime: number,
    endTime: number,
    level?: WarningLevel
  ): Promise<WarningTimeline[]> {
    const response = await this.client.post<WarningTimeline[]>(
      '/warning/warning/timeline',
      {
        startTime,
        endTime,
        level,
      }
    );

    return response.data || [];
  }

  // --------------------
  // 报警清除管理 (/warning/warningclean)
  // --------------------

  /**
   * 查询清除规则列表
   * API: GET /warning/warningclean
   */
  async getWarningCleans(params?: QueryParams): Promise<PageResponse<WarningClean>> {
    const queryParams: Record<string, any> = {};

    if (params?.withCount) {
      queryParams.withCount = true;
    }

    const response = await this.client.get<WarningClean[]>(
      '/warning/warningclean',
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
   * 创建清除规则
   * API: POST /warning/warningclean
   */
  async createWarningClean(data: CleanAddOrUpdate): Promise<string> {
    const response = await this.client.post<{ InsertedID: string }>(
      '/warning/warningclean',
      data
    );

    if (response.data.InsertedID) {
      return response.data.InsertedID;
    }
    throw new Error('创建清除规则失败');
  }

  /**
   * 执行清除
   * API: POST /warning/warningclean/execute/{id}
   */
  async executeWarningClean(id: string): Promise<CleanExecuteResult> {
    const response = await this.client.post<CleanExecuteResult>(
      `/warning/warningclean/execute/${id}`
    );

    return response.data || { success: false };
  }

  /**
   * 根据ID查询单个清除规则
   * API: GET /warning/warningclean/{id}
   */
  async getWarningCleanById(id: string): Promise<WarningClean | null> {
    const response = await this.client.get<WarningClean>(
      `/warning/warningclean/${id}`
    );

    return response.data || null;
  }

  /**
   * 更新清除规则
   * API: PATCH /warning/warningclean/{id}
   */
  async updateWarningClean(id: string, data: Partial<WarningClean>): Promise<void> {
    const response = await this.client.patch<{ status: string }>(
      `/warning/warningclean/${id}`,
      data
    );

    if (response.data.status !== 'OK') {
      throw new Error('更新清除规则失败');
    }
  }

  /**
   * 删除清除规则
   * API: DELETE /warning/warningclean/{id}
   */
  async deleteWarningClean(id: string): Promise<void> {
    const response = await this.client.delete<{ status: string }>(
      `/warning/warningclean/${id}`
    );

    if (response.data.status !== 'OK') {
      throw new Error('删除清除规则失败');
    }
  }

  // --------------------
  // 兼容旧接口（废弃）
  // --------------------

  /**
   * @deprecated 请使用 getWarnings 替代
   * 查询告警列表
   */
  async getAlarms(params?: AlarmQueryParams): Promise<PageResponse<Alarm>> {
    return this.getWarnings(params as WarningQueryParams);
  }

  /**
   * @deprecated 请使用 getWarningById 替代
   * 根据ID查询单个告警
   */
  async getAlarmById(id: string): Promise<Alarm | null> {
    return this.getWarningById(id);
  }

  /**
   * @deprecated 请使用 updateWarning 并传入确认状态替代
   * 确认告警
   */
  async acknowledgeAlarm(id: string, note?: string, userId?: string): Promise<void> {
    await this.updateWarning(id, {
      status: 1,  // 1-已确认
      confirmNote: note,
      confirmUser: userId,
    });
  }

  /**
   * @deprecated 请使用 updateWarning 并传入恢复状态替代
   * 解除告警
   */
  async resolveAlarm(id: string, note?: string): Promise<void> {
    await this.updateWarning(id, {
      status: 2,  // 2-已恢复
      recoverNote: note,
    });
  }

  // ==================== 文件管理接口 ====================

  /**
   * 上传文件
   * API: POST /api/files/upload
   */
  async uploadFile(
    file: Buffer,
    filename: string,
    mimeType?: string
  ): Promise<UploadResult> {
    const formData = new FormData();

    // Node.js 环境 - 直接使用 Buffer
    formData.append('file', file as any, filename);
    if (mimeType) {
      formData.append('mimeType', mimeType);
    }

    const response = await this.client.post<UploadResult>(
      '/api/files/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  }

  /**
   * 下载文件
   * API: GET /api/files/{id}/download
   */
  async downloadFile(id: string): Promise<{ data: Buffer; filename: string }> {
    const response = await this.client.get(`/api/files/${id}/download`, {
      responseType: 'arraybuffer',
    });

    const filename = response.headers['content-disposition']
      ?.match(/filename="?(.+)"?/)?.[1] || 'file';

    return {
      data: response.data,
      filename,
    };
  }

  /**
   * 获取文件信息
   * API: GET /api/files/{id}
   */
  async getFileInfo(id: string): Promise<FileInfo | null> {
    const response = await this.client.get<FileInfo>(`/api/files/${id}`);

    return response.data || null;
  }

  /**
   * 删除文件
   * API: DELETE /api/files/{id}
   */
  async deleteFile(id: string): Promise<void> {
    const response = await this.client.delete<{ status: string }>(`/api/files/${id}`);

    if (response.data.status !== 'OK') {
      throw new Error('删除文件失败');
    }
  }

  // ==================== 设备控制接口 ====================

  /**
   * 发送控制命令
   * API: POST /api/control/send
   */
  async sendControlCommand(command: ControlCommand): Promise<ControlResult> {
    const response = await this.client.post<ControlResult>(
      '/api/control/send',
      command
    );

    return response.data;
  }

  /**
   * 批量发送控制命令
   * API: POST /api/control/batch
   */
  async sendBatchControlCommands(commands: ControlCommand[]): Promise<ControlResult[]> {
    const response = await this.client.post<ControlResult[]>(
      '/api/control/batch',
      { commands }
    );

    return response.data || [];
  }

  // ==================== 报表管理接口 ====================

  /**
   * 查询报表列表
   * API: GET /api/reports
   */
  async getReports(params?: QueryParams): Promise<Report[]> {
    const response = await this.client.get<Report[]>('/api/reports', {
      params: { query: JSON.stringify(params || {}) },
    });

    return response.data || [];
  }

  /**
   * 根据ID查询单个报表
   * API: GET /api/reports/{id}
   */
  async getReportById(id: string): Promise<Report | null> {
    const response = await this.client.get<Report>(`/api/reports/${id}`);

    return response.data || null;
  }

  /**
   * 执行报表生成
   * API: POST /api/reports/{id}/execute
   */
  async executeReport(
    id: string,
    parameters?: Record<string, any>
  ): Promise<ReportData> {
    const response = await this.client.post<ReportData>(
      `/api/reports/${id}/execute`,
      { parameters }
    );

    return response.data;
  }

  /**
   * 创建报表
   * API: POST /api/reports
   */
  async createReport(data: Partial<Report>): Promise<string> {
    const response = await this.client.post<{ InsertedID: string }>(
      '/api/reports',
      data
    );

    if (response.data.InsertedID) {
      return response.data.InsertedID;
    }
    throw new Error('创建报表失败');
  }

  /**
   * 更新报表
   * API: PATCH /api/reports/{id}
   */
  async updateReport(id: string, data: Partial<Report>): Promise<void> {
    const response = await this.client.patch<{ status: string }>(
      `/api/reports/${id}`,
      data
    );

    if (response.data.status !== 'OK') {
      throw new Error('更新报表失败');
    }
  }

  /**
   * 删除报表
   * API: DELETE /api/reports/{id}
   */
  async deleteReport(id: string): Promise<void> {
    const response = await this.client.delete<{ status: string }>(
      `/api/reports/${id}`
    );

    if (response.data.status !== 'OK') {
      throw new Error('删除报表失败');
    }
  }

  // ==================== 用户管理接口 ====================

  /**
   * 获取当前用户信息
   * API: GET /api/user/me
   */
  async getCurrentUser(): Promise<Record<string, any> | null> {
    const response = await this.client.get<Record<string, any>>('/api/user/me');

    return response.data || null;
  }

  /**
   * 获取用户列表
   * API: GET /api/users
   */
  async getUsers(params?: QueryParams): Promise<Record<string, any>[]> {
    const response = await this.client.get<Record<string, any>[]>('/api/users', {
      params: { query: JSON.stringify(params || {}) },
    });

    return response.data || [];
  }
}
