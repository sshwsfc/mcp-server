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

// ==================== 表结构相关类型 ====================

// 字段属性定义
export interface FieldProperty {
  type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';
  key: string;
  title: string;
  title_en?: string;
  fieldType?: string;
  config?: string;
  descriptionType?: string;
  listFields?: boolean;
  createShow?: boolean;
  editShow?: boolean;
  need?: boolean;
  unique?: boolean;
  disabled?: boolean;
  displayForm?: string;
  editableFields?: boolean;
  batchChangeFields?: boolean;
  canOrder?: boolean;
  fixedField?: boolean;
  invalid?: boolean;
  isShowField?: boolean;
  textContent?: string;
  textType?: string;
  field?: Record<string, any>;
  // 日期字段特有
  format?: string;
  createForm?: string;
  [key: string]: any;
}

// 表Schema定义
export interface TableSchemaDefinition {
  form: string[];
  key: string;
  listFields: string[];
  name: string;
  properties: Record<string, FieldProperty>;
  required: string[];
  title: string;
  type: 'object';
}

// 表结构（创建/更新）
export interface TableSchemaInput {
  id: string;           // 表ID（必填）
  title: string;        // 表标题（必填）
  showField?: string;   // 显示字段
  formschema?: Record<string, any>;  // 表单模式
  schema: TableSchemaDefinition;      // 表结构定义（必填）
  [key: string]: any;
}

// 表结构（查询返回）
export interface TableSchema {
  _id: string;
  id: string;
  title: string;
  name: string;
  description?: string;
  projectId: string;
  type?: string;
  showField?: string;
  formschema?: Record<string, any>;
  schema?: TableSchemaDefinition;
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

// ==================== 认证相关类型 ====================

// 登录请求
export interface LoginInput {
  username: string;
  password: string;
  code?: string;  // 验证码
}

// 登录响应
export interface LoginOutput {
  token: string;
  id: string;
  username: string;
  email?: string;
  isSuper: boolean;
  dashboard?: string;
  mainmenu?: string;
  permissions: string[];
  roles: string[];
  departmentIDList?: Record<string, any>;
  nodeInUser?: Array<{
    all: boolean;
    data: Array<{ id: string }>;
    tableId: string;
  }>;
}

// ==================== 报警模块相关类型 ====================

// --------------------
// 报警规则管理 (/warning/rule)
// --------------------

// 报警级别
export type WarningLevel = 1 | 2 | 3 | 4;  // 1-提示 2-一般 3-重要 4-紧急

// 报警规则标签
export interface RuleTag {
  id: string;           // 属性点ID
  name: string;         // 属性点名称
  unit?: string;        // 单位
  deviceId?: string;    // 设备ID
  deviceName?: string;  // 设备名称
  tableName?: string;   // 表名称
  tableId?: string;     // 表ID
}

// 应用范围
export interface ApplyRange {
  type?: 'all' | 'device' | 'tag';  // 应用范围类型
  deviceIds?: string[];             // 设备ID列表
  tagIds?: string[];                // 属性点ID列表
  tableIds?: string[];              // 表ID列表
}

// 报警规则
export interface WarningRule {
  _id?: string;
  id?: string;
  name: string;                    // 规则名称
  level: WarningLevel;             // 报警级别
  enable?: boolean;                // 是否启用
  description?: string;            // 规则描述
  tags?: RuleTag[];                // 关联属性点
  applyRange?: ApplyRange;         // 应用范围
  conditions?: RuleCondition[];    // 触发条件
  actions?: RuleAction[];          // 触发动作
  createTime?: number;             // 创建时间
  updateTime?: number;             // 更新时间
  creator?: string;                // 创建人
  [key: string]: any;
}

// 规则触发条件
export interface RuleCondition {
  type: 'threshold' | 'change' | 'offline' | 'formula';  // 条件类型
  tagId: string;                   // 属性点ID
  operator?: '>' | '<' | '=' | '>=' | '<=' | '!=';  // 比较运算符
  threshold?: number;              // 阈值
  duration?: number;               // 持续时间(秒)
  formula?: string;                // 公式
  [key: string]: any;
}

// 规则触发动作
export interface RuleAction {
  type: 'email' | 'sms' | 'webhook' | 'log';  // 动作类型
  config?: Record<string, any>;                // 动作配置
  enabled?: boolean;                           // 是否启用
  [key: string]: any;
}

// 创建/更新报警规则
export interface RuleDetailAddOrUpdate {
  name: string;
  level: WarningLevel;
  enable?: boolean;
  description?: string;
  tags?: RuleTag[];
  applyRange?: ApplyRange;
  conditions?: RuleCondition[];
  actions?: RuleAction[];
  [key: string]: any;
}

// --------------------
// 报警管理 (/warning/warning)
// --------------------

// 报警状态
export type WarningStatus = 0 | 1 | 2 | 3;  // 0-未确认 1-已确认 2-已恢复 3-已归档

// 报警数据
export interface Warning {
  _id?: string;
  id?: string;
  ruleId?: string;              // 规则ID
  ruleName?: string;            // 规则名称
  level: WarningLevel;          // 报警级别
  status: WarningStatus;        // 报警状态
  title?: string;               // 报警标题
  content?: string;             // 报警内容
  deviceId?: string;            // 设备ID
  deviceName?: string;          // 设备名称
  tagId?: string;               // 属性点ID
  tagName?: string;             // 属性点名称
  tagValue?: any;               // 当前值
  threshold?: any;              // 阈值
  occurTime: number;            // 发生时间
  confirmTime?: number;         // 确认时间
  recoverTime?: number;         // 恢复时间
  archiveTime?: number;         // 归档时间
  confirmUser?: string;         // 确认人
  confirmNote?: string;         // 确认备注
  recoverNote?: string;         // 恢复备注
  projectId?: string;           // 项目ID
  [key: string]: any;
}

// 报警查询参数
export interface WarningQueryParams extends QueryParams {
  level?: WarningLevel;
  status?: WarningStatus;
  ruleId?: string;
  deviceId?: string;
  tagId?: string;
  startTime?: number;
  endTime?: number;
  keyword?: string;
}

// 批量确认请求
export interface BatchConfirmRequest {
  ids: string[];                 // 报警ID列表
  note?: string;                 // 确认备注
  userId?: string;               // 操作用户ID
}

// 报警归档
export interface WarningArchive {
  _id?: string;
  warningId: string;             // 原报警ID
  archiveTime: number;           // 归档时间
  archiveReason?: string;        // 归档原因
  archiveUser?: string;          // 归档人
  warning: Warning;              // 报警详情
  [key: string]: any;
}

// 归档设置
export interface ArchiveSetting {
  _id?: string;
  id?: string;
  enable?: boolean;              // 是否启用自动归档
  archiveDays?: number;          // 归档天数
  archiveStatus?: WarningStatus; // 归档条件状态
  createTime?: number;
  updateTime?: number;
  [key: string]: any;
}

// 报警统计
export interface WarningStatistics {
  total: number;                 // 总数
  active: number;                // 未确认数
  confirmed: number;             // 已确认数
  recovered: number;             // 已恢复数
  archived: number;              // 已归档数
  level1: number;                // 提示级
  level2: number;                // 一般级
  level3: number;                // 重要级
  level4: number;                // 紧急级
}

// 报警时间线
export interface WarningTimeline {
  time: number;                  // 时间点
  count: number;                 // 数量
  level?: WarningLevel;
}

// --------------------
// 报警清除管理 (/warning/warningclean)
// --------------------

// 清除规则
export interface WarningClean {
  _id?: string;
  id?: string;
  name: string;                  // 清除规则名称
  enable?: boolean;              // 是否启用
  cleanType: 'archive' | 'delete';  // 清除类型：归档或删除
  cleanCondition: CleanCondition; // 清除条件
  lastExecuteTime?: number;      // 最后执行时间
  createTime?: number;
  updateTime?: number;
  creator?: string;
  [key: string]: any;
}

// 清除条件
export interface CleanCondition {
  status?: WarningStatus;        // 报警状态
  beforeDays?: number;           // 多久之前的报警(天)
  level?: WarningLevel;          // 报警级别
}

// 创建/更新清除规则
export interface CleanAddOrUpdate {
  name: string;
  enable?: boolean;
  cleanType: 'archive' | 'delete';
  cleanCondition: CleanCondition;
}

// 执行清除结果
export interface CleanExecuteResult {
  success: boolean;
  cleanedCount?: number;         // 清除数量
  message?: string;
}

// --------------------
// 兼容旧接口的类型别名
// --------------------

// @deprecated 请使用 Warning 替代
export interface Alarm extends Warning {}

// @deprecated 请使用 WarningQueryParams 替代
export interface AlarmQueryParams extends WarningQueryParams {}

// ==================== 文件相关类型 ====================
export interface FileInfo {
  _id: string;
  name: string;
  size: number;
  mimeType: string;
  path: string;
  uploader?: string;
  createTime?: number;
  [key: string]: any;
}

export interface UploadResult {
  fileId: string;
  path: string;
  url?: string;
}

// ==================== 设备控制相关类型 ====================
export interface ControlCommand {
  deviceId: string;
  tagName: string;
  value: any;
  timeout?: number;
}

export interface ControlResult {
  success: boolean;
  deviceId: string;
  tagName: string;
  value: any;
  message?: string;
  timestamp?: number;
}

// ==================== 报表相关类型 ====================
export interface Report {
  _id: string;
  name: string;
  description?: string;
  type: string;
  config: Record<string, any>;
  createTime?: number;
  updateTime?: number;
  [key: string]: any;
}

export interface ReportData {
  reportId: string;
  data: Record<string, any>;
  generateTime?: number;
}
