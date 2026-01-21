/**
 * AIRIOT API 类型定义
 */

// 通用查询参数
export interface QueryParams {
  filter?: Record<string, any>;
  sort?: Record<string, 1 | -1>;
  limit?: number;
  skip?: number;
  projection?: Record<string, 0 | 1>;
  project?: Record<string, 0 | 1>;
  withCount?: boolean;
}

// 表结构
export interface TableSchema {
  _id: string;
  name: string;
  description?: string;
  projectId: string;
  type?: string;
  createTime?: number;
  updateTime?: number;
  [key: string]: any;
}

// 表记录
export interface TableRecord {
  _id: string;
  tableId: string;
  data: Record<string, any>;
  createTime?: number;
  updateTime?: number;
  [key: string]: any;
}

// 属性点
export interface Tag {
  _id: string;
  name: string;
  deviceId: string;
  dataType: string;
  unit?: string;
  description?: string;
  [key: string]: any;
}

// 时序数据
export interface TimeSeriesData {
  deviceId: string;
  tagId: string;
  time: number;
  value: any;
  quality?: string;
}

// API 响应
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

// 分页响应
export interface PageResponse<T = any> {
  list: T[];
  total: number;
  limit: number;
  skip: number;
}

// AIRIOT 配置
export interface AiriotConfig {
  baseUrl: string;
  projectId: string;
  token?: string;
  username?: string;
  password?: string;
}
