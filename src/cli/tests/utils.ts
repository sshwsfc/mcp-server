/**
 * CLI 测试工具函数
 */

import { vi } from 'vitest';
import { AiriotApiClient } from '../../airiot-api.js';

/**
 * 创建模拟的 API 客户端
 */
export function createMockApiClient() {
  return {
    getWarningRules: vi.fn(),
    getWarningRuleById: vi.fn(),
    createWarningRule: vi.fn(),
    updateWarningRule: vi.fn(),
    deleteWarningRule: vi.fn(),
    getWarnings: vi.fn(),
    getWarningById: vi.fn(),
    updateWarning: vi.fn(),
    getWarningStatistics: vi.fn(),
    getLatestWarnings: vi.fn(),
    batchConfirmWarnings: vi.fn(),
    getTables: vi.fn(),
    getTableById: vi.fn(),
    createTable: vi.fn(),
    updateTable: vi.fn(),
    deleteTable: vi.fn(),
    getRecords: vi.fn(),
    getRecordById: vi.fn(),
    createRecord: vi.fn(),
    updateRecord: vi.fn(),
    deleteRecord: vi.fn(),
    batchDeleteRecords: vi.fn(),
    getTags: vi.fn(),
    getRecordTags: vi.fn(),
    getLatestData: vi.fn(),
    getHistoryData: vi.fn(),
    getOnlineStats: vi.fn(),
    uploadFile: vi.fn(),
    getFileInfo: vi.fn(),
    deleteFile: vi.fn(),
    sendControlCommand: vi.fn(),
    sendBatchControlCommands: vi.fn(),
    getReports: vi.fn(),
    getReportById: vi.fn(),
    executeReport: vi.fn(),
    createReport: vi.fn(),
    updateReport: vi.fn(),
    deleteReport: vi.fn(),
    getCurrentUser: vi.fn(),
    getUsers: vi.fn(),
    login: vi.fn(),
  } as unknown as AiriotApiClient;
}

/**
 * 模拟配置
 */
export const mockConfig = {
  baseUrl: 'https://test.airiot.com',
  projectId: 'test-project-id',
  token: 'test-token',
  username: 'test-user',
};

/**
 * 模拟 API 配置读取
 */
export function mockApiConfig() {
  return {
    baseUrl: mockConfig.baseUrl,
    projectId: mockConfig.projectId,
    token: mockConfig.token,
  };
}

/**
 * 模拟控制台输出
 */
export function mockConsole() {
  return {
    log: vi.spyOn(console, 'log').mockImplementation(() => {}),
    error: vi.spyOn(console, 'error').mockImplementation(() => {}),
    warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
  };
}

/**
 * 清理模拟
 */
export function cleanupMocks(mocks: ReturnType<typeof mockConsole>) {
  mocks.log.mockRestore();
  mocks.error.mockRestore();
  mocks.warn.mockRestore();
}

/**
 * 模拟数据样本
 */
export const mockData = {
  // 报警规则
  warningRule: {
    id: 'rule-1',
    name: '测试规则',
    level: 2,
    enable: true,
    description: '测试报警规则',
    createTime: 1640000000000,
    updateTime: 1640000000000,
  },

  // 报警
  warning: {
    id: 'warning-1',
    ruleId: 'rule-1',
    deviceId: 'device-1',
    tagId: 'tag-1',
    level: 2,
    status: 0,
    message: '测试报警',
    createTime: 1640000000000,
  },

  // 表
  table: {
    id: 'table-1',
    name: '测试表',
    description: '测试数据表',
    type: 1,
    createTime: 1640000000000,
  },

  // 记录
  record: {
    id: 'rec-1',
    name: '测试记录',
    createTime: 1640000000000,
  },

  // 属性点
  tag: {
    id: 'tag-1',
    name: '测试属性点',
    dataType: 1,
    unit: '°C',
  },

  // 用户
  user: {
    id: 'user-1',
    username: 'testuser',
    nickname: '测试用户',
    email: 'test@example.com',
  },

  // 报表
  report: {
    id: 'report-1',
    name: '测试报表',
    type: 1,
    description: '测试报表描述',
  },

  // 文件
  file: {
    id: 'file-1',
    filename: 'test.pdf',
    size: 1024,
    mimeType: 'application/pdf',
    url: 'https://test.com/file-1',
  },
};
