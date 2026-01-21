# AIRIOT MCP Server

基于 Model Context Protocol (MCP) 的 AIRIOT IoT 平台服务器，为 AI 助手提供对 AIRIOT 数据表、记录、属性点和时序数据的访问能力。

## 功能特性

- 📊 **数据表管理**: 查询、创建、更新、删除数据表
- 📝 **记录操作**: 对表记录进行 CRUD 操作
- 🏷️ **属性点查询**: 查询表和记录的属性点定义
- 📈 **时序数据**: 查询设备最新数据和历史数据
- 📊 **统计分析**: 设备在线状态统计

## 安装

```bash
cd airiot-mcp-server
npm install
npm run build
```

## 配置

### 环境变量

创建 `.env` 文件或设置以下环境变量：

```bash
# AIRIOT 服务器地址（必填）
export AIRIOT_BASE_URL="https://your-airiot-server.com"

# 项目ID（必填）
export AIRIOT_PROJECT_ID="your-project-id"

# 认证方式1: 使用Token（推荐）
export AIRIOT_TOKEN="your-api-token"

# 认证方式2: 使用用户名密码
export AIRIOT_USERNAME="your-username"
export AIRIOT_PASSWORD="your-password"
```

### MCP 配置

在 Claude Desktop 配置文件中添加：

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "airiot": {
      "command": "node",
      "args": [
        "/path/to/airiot-mcp-server/dist/index.js"
      ],
      "env": {
        "AIRIOT_BASE_URL": "https://your-airiot-server.com",
        "AIRIOT_PROJECT_ID": "your-project-id",
        "AIRIOT_TOKEN": "your-api-token"
      }
    }
  }
}
```

## 可用工具

### 表管理

| 工具名 | 描述 |
|--------|------|
| `get_tables` | 查询数据表列表 |
| `get_table_by_id` | 根据ID查询单个表 |
| `create_table` | 创建新数据表 |
| `update_table` | 更新表信息 |
| `delete_table` | 删除数据表 |

### 记录管理

| 工具名 | 描述 |
|--------|------|
| `get_table_records` | 查询表记录列表 |
| `get_record_by_id` | 根据ID查询单条记录 |
| `create_record` | 创建新记录 |
| `update_record` | 更新记录 |
| `delete_record` | 删除单条记录 |
| `batch_delete_records` | 批量删除记录 |

### 属性点查询

| 工具名 | 描述 |
|--------|------|
| `get_table_tags` | 查询表的属性点定义 |
| `get_record_tags` | 查询记录的属性点 |

### 时序数据

| 工具名 | 描述 |
|--------|------|
| `get_latest_data` | 查询最新数据 |
| `get_history_data` | 查询历史时序数据 |

### 统计

| 工具名 | 描述 |
|--------|------|
| `get_online_stats` | 统计设备在线状态 |

## 使用示例

### 查询所有数据表

```
调用 get_tables 工具，参数：
{
  "limit": 50,
  "sort": { "createTime": -1 }
}
```

### 查询特定表的记录

```
1. 先调用 get_tables 查找表ID
2. 调用 get_table_records 工具，参数：
{
  "tableId": "表ID",
  "filter": { "status": "online" },
  "limit": 100
}
```

### 创建新记录

```
调用 create_record 工具，参数：
{
  "tableId": "表ID",
  "data": {
    "name": "设备名称",
    "status": "online",
    "location": "位置信息"
  }
}
```

### 查询设备最新数据

```
调用 get_latest_data 工具，参数：
{
  "deviceTagPairs": [
    { "deviceId": "设备ID", "tagId": "属性点ID" }
  ]
}
```

### 查询历史数据

```
调用 get_history_data 工具，参数：
{
  "deviceTagPairs": [
    { "deviceId": "设备ID", "tagId": "属性点ID" }
  ],
  "startTime": 1704067200000,
  "endTime": 1704153600000,
  "limit": 1000
}
```

## 开发

```bash
# 安装依赖
npm install

# 开发模式（自动编译）
npm run dev

# 构建
npm run build

# 运行
npm start
```

## API 文档

本服务器基于 [AIRIOT API 4.0](https://airiot.apifox.cn/llms.txt) 文档实现。

主要接口包括：

- **表管理**: `/api/core/table/*`
- **表记录管理**: `/api/core/table-record/*`
- **属性点管理**: `/api/core/table/{id}/tags`
- **时序数据**: `/api/core/time-series/*`
- **统计**: `/api/core/table/online-stats`

## 注意事项

1. **认证**: 建议使用 Token 认证，避免频繁登录
2. **权限**: 确保账号有相应的数据访问权限
3. **性能**: 大数据量查询时注意使用 `limit` 和 `skip` 参数
4. **错误处理**: 所有工具调用都会返回详细错误信息

## 许可证

MIT

## 贡献

欢迎提交 Issue 和 Pull Request！
