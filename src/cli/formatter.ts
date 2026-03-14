/**
 * 输出格式化工具
 */

export type OutputFormat = 'json' | 'table' | 'plain';

/**
 * 格式化输出
 */
export function formatOutput(data: any, format: OutputFormat = 'table'): string {
  switch (format) {
    case 'json':
      return formatJson(data);
    case 'table':
      return formatTable(data);
    case 'plain':
      return formatPlain(data);
    default:
      return formatTable(data);
  }
}

/**
 * JSON 格式输出
 */
function formatJson(data: any): string {
  return JSON.stringify(data, null, 2);
}

/**
 * 表格格式输出
 */
function formatTable(data: any): string {
  // 如果是数组且有数据，渲染成表格
  if (Array.isArray(data) && data.length > 0) {
    return renderTable(data);
  }

  // 如果是单个对象且有 list 属性（分页响应）
  if (data?.list && Array.isArray(data.list)) {
    const result = renderTable(data.list);
    if (data.total !== undefined) {
      return `${result}\n\n总计: ${data.total} 条`;
    }
    return result;
  }

  // 其他情况，使用 JSON 格式
  return formatJson(data);
}

/**
 * 渲染表格
 */
function renderTable(items: any[]): string {
  if (items.length === 0) {
    return '(无数据)';
  }

  // 获取所有可能的字段
  const fields = new Set<string>();
  for (const item of items) {
    if (item && typeof item === 'object') {
      Object.keys(item).forEach(key => fields.add(key));
    }
  }

  // 过滤掉复杂对象（嵌套对象/数组）
  const simpleFields = [...fields].filter(field => {
    for (const item of items) {
      const value = item[field];
      if (value !== null && value !== undefined && typeof value === 'object') {
        return false;
      }
    }
    return true;
  });

  // 如果没有简单字段，使用 JSON
  if (simpleFields.length === 0) {
    return formatJson(items);
  }

  // 计算每列的最大宽度
  const colWidths: Record<string, number> = {};
  simpleFields.forEach(field => {
    colWidths[field] = field.length;
    items.forEach(item => {
      const value = formatValue(item[field]);
      colWidths[field] = Math.max(colWidths[field], value.length);
    });
  });

  // 生成表头
  const header = simpleFields.map(field => {
    return padRight(field, colWidths[field]);
  }).join(' | ');

  // 生成分隔线
  const separator = simpleFields.map(field => {
    return '-'.repeat(colWidths[field]);
  }).join('-+-');

  // 生成数据行
  const rows = items.map(item => {
    return simpleFields.map(field => {
      const value = formatValue(item[field]);
      return padRight(value, colWidths[field]);
    }).join(' | ');
  });

  return [header, separator, ...rows].join('\n');
}

/**
 * 纯文本格式输出
 */
function formatPlain(data: any): string {
  if (Array.isArray(data) && data.length > 0) {
    return data.map(item => formatObject(item)).join('\n\n' + '-'.repeat(50) + '\n\n');
  }

  if (data?.list && Array.isArray(data.list)) {
    const result = data.list.map((item: any) => formatObject(item)).join('\n\n' + '-'.repeat(50) + '\n\n');
    if (data.total !== undefined) {
      return result + `\n总计: ${data.total} 条`;
    }
    return result;
  }

  return formatObject(data);
}

/**
 * 格式化单个对象
 */
function formatObject(obj: any): string {
  if (obj === null || obj === undefined) {
    return '(空)';
  }

  if (typeof obj !== 'object') {
    return String(obj);
  }

  const lines: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && value !== undefined && typeof value !== 'object') {
      lines.push(`${key}: ${value}`);
    }
  }

  return lines.join('\n') || '(空对象)';
}

/**
 * 格式化值
 */
function formatValue(value: any): string {
  if (value === null || value === undefined) {
    return '-';
  }

  if (typeof value === 'boolean') {
    return value ? '✓' : '✗';
  }

  if (typeof value === 'number') {
    // 格式化时间戳
    if (value > 1000000000000) {
      const date = new Date(value);
      return date.toLocaleString('zh-CN');
    }
    return String(value);
  }

  return String(value);
}

/**
 * 右对齐填充
 */
function padRight(str: string, len: number): string {
  return str.padEnd(len);
}

/**
 * 格式化错误输出
 */
export function formatError(error: any): string {
  if (error instanceof Error) {
    return `错误: ${error.message}`;
  }
  return `错误: ${String(error)}`;
}

/**
 * 格式化成功消息
 */
export function formatSuccess(message: string): string {
  return `✓ ${message}`;
}

/**
 * 格式化警告消息
 */
export function formatWarning(message: string): string {
  return `⚠ ${message}`;
}
