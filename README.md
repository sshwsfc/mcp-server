# AIRIOT MCP Server

基于 Model Context Protocol (MCP) 的 AIRIOT IoT 平台服务器，为 AI 助手提供完整的 AIRIOT 平台访问能力。

## 功能特性

### 核心能力
- 📊 **数据表管理**: 查询、创建、更新、删除数据表
- 📝 **记录操作**: 对表记录进行 CRUD 操作（含批量）
- 🏷️ **属性点查询**: 查询表和记录的属性点定义
- 📈 **时序数据**: 查询设备最新数据和历史数据
- 📊 **统计分析**: 设备在线状态统计

### MCP 能力支持
- 🔧 **Tools**: 30+ 工具接口
- 📁 **Resources**: 10+ 资源端点，支持直接读取平台数据作为上下文
- 💬 **Prompts**: 12+ 预定义提示词模板

### 新增功能
- 🚨 **告警管理**: 查询、确认、解除告警
- 📁 **文件管理**: 上传、下载、删除文件
- 🎮 **设备控制**: 发送控制命令
- 📄 **报表管理**: 创建、执行、管理报表
- 👤 **用户管理**: 查询用户信息

### 开发体验
- ⚙️ **配置文件**: 支持 `.airiotrc.json` 配置文件
- 📝 **日志系统**: 分级日志，便于调试
- 🛡️ **错误处理**: 完善的错误类型和错误恢复机制

## 安装

```bash
cd airiot-mcp-server
npm install
npm run build
```

## 配置

### 方式一：配置文件（推荐）

在项目根目录创建 `.airiotrc.json` 文件：

```json
{
  "baseUrl": "https://your-airiot-server.com",
  "projectId": "your-project-id",
  "token": "your-api-token",
  "timeout": 30000,
  "logLevel": "info",
  "retries": 3
}
```

可参考 [`.airiotrc.json.example`](.airiotrc.json.example) 文件。

### 方式二：环境变量

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

# 日志级别（可选）
export AIRIOT_LOG_LEVEL="info"
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

## MCP 能力

### Resources（资源）

AI 可以直接读取以下资源作为上下文：

| URI | 描述 |
|-----|------|
| `airiot://tables` | 数据表列表 |
| `airiot://tables/{id}` | 数据表详情 |
| `airiot://table/{tableName}/records` | 表记录列表 |
| `airiot://devices` | 设备列表 |
| `airiot://device/{id}` | 设备详情 |
| `airiot://device/{deviceId}/tag/{tagId}/latest` | 最新数据 |
| `airiot://stats/online` | 在线统计 |

### Prompts（提示词模板）

预定义的常用查询模板：

| 模板名 | 描述 |
|--------|------|
| `list_tables` | 列出数据表 |
| `describe_table` | 获取表结构 |
| `query_devices` | 查询设备列表 |
| `get_realtime_data` | 获取实时数据 |
| `get_history_trend` | 获取历史趋势 |
| `device_online_summary` | 设备在线摘要 |
| `query_alarms` | 查询告警 |
| `create_device` | 创建设备 |
| `update_device_status` | 更新设备状态 |

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

### 告警管理

| 工具名 | 描述 |
|--------|------|
| `get_alarms` | 查询告警列表 |
| `get_alarm_by_id` | 查询告警详情 |
| `acknowledge_alarm` | 确认告警 |
| `resolve_alarm` | 解除告警 |

### 文件管理

| 工具名 | 描述 |
|--------|------|
| `upload_file` | 上传文件 |
| `get_file_info` | 获取文件信息 |
| `delete_file` | 删除文件 |

### 设备控制

| 工具名 | 描述 |
|--------|------|
| `send_control_command` | 发送控制命令 |
| `send_batch_control_commands` | 批量发送控制命令 |

### 报表管理

| 工具名 | 描述 |
|--------|------|
| `get_reports` | 查询报表列表 |
| `get_report_by_id` | 查询报表详情 |
| `execute_report` | 执行报表生成 |
| `create_report` | 创建报表 |
| `update_report` | 更新报表 |
| `delete_report` | 删除报表 |

### 用户管理

| 工具名 | 描述 |
|--------|------|
| `get_current_user` | 获取当前用户信息 |
| `get_users` | 获取用户列表 |

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
调用 get_table_records 工具，参数：
{
  "tableName": "device",
  "filter": { "status": "online" },
  "limit": 100
}
```

### 创建新表

创建表需要提供完整的 schema 定义：

```
调用 create_table 工具，参数：
{
  "id": "my_table",
  "title": "我的数据表",
  "showField": "name",
  "schema": {
    "form": ["name", "status", "createTime"],
    "key": "myTable",
    "listFields": ["name", "status", "createTime"],
    "name": "myTable",
    "properties": {
      "name": {
        "type": "string",
        "key": "name",
        "title": "名称",
        "fieldType": "input",
        "listFields": true,
        "createShow": true,
        "editShow": true,
        "need": true,
        "unique": true
      },
      "status": {
        "type": "string",
        "key": "status",
        "title": "状态",
        "fieldType": "input",
        "listFields": true,
        "createShow": true,
        "editShow": true,
        "need": false
      },
      "createTime": {
        "type": "string",
        "key": "createTime",
        "title": "创建时间",
        "fieldType": "datePicker",
        "listFields": true,
        "createShow": false,
        "editShow": false,
        "disabled": true,
        "format": "datetime"
      }
    },
    "required": ["name"],
    "title": "我的表",
    "type": "object"
  }
}
```

### 查询告警

```
调用 get_alarms 工具，参数：
{
  "level": "critical",
  "status": "active",
  "limit": 50
}
```

### 发送设备控制命令

```
调用 send_control_command 工具，参数：
{
  "deviceId": "设备ID",
  "tagName": "control_tag",
  "value": 1
}
```

### 执行报表

```
调用 execute_report 工具，参数：
{
  "id": "报表ID",
  "parameters": {
    "startDate": "2024-01-01",
    "endDate": "2024-12-31"
  }
}
```

## CLI 使用

项目同时提供 CLI 工具 `airiot`，用于命令行操作 AIRIOT 平台。

### 安装

```bash
npm install -g .
# 或使用 npx
npx @airiot/mcp-server
```

### 配置

首次使用需要登录：

```bash
airiot login --url https://your-airiot-server.com --project your-project-id
```

或使用 Token：

```bash
airiot login --url https://your-airiot-server.com --project your-project-id --token your-token
```

### 常用命令

```bash
# 查看帮助
airiot --help

# 查询数据表
airiot tables
airiot table <table-id>

# 查询记录
airiot records <table-id>
airiot record <table-id> <record-id>

# 查询报警
airiot warnings
airiot warnings confirm <warning-id>
airiot warnings resolve <warning-id>

# 查询最新数据
airiot data-latest --device <device-id> --tag <tag-id>

# 查询历史数据
airiot data-history --device <device-id> --tag <tag-id> --start <timestamp> --end <timestamp>

# 设备控制
airiot control-send --device <device-id> --tag <tag-name> --value <value>

# 查看配置
airiot config

# 登出
airiot logout
```

更多命令请查看 `airiot --help`。

## 测试

项目包含完整的测试套件，使用 Vitest 进行测试。

```bash
# 运行所有测试
npm test

# 运行测试并监听文件变化
npm test -- --watch

# 运行测试并生成覆盖率报告
npm run test:coverage

# 运行测试一次（不监听）
npm run test:run
```

测试覆盖范围：
- ✅ 所有 CLI 命令功能测试
- ✅ 工具函数测试
- ✅ 配置管理测试
- ✅ API 客户端 mock 测试

## 开发

```bash
# 安装依赖
npm install

# 开发模式（自动编译）
npm run dev

# 构建
npm run build

# 运行 MCP 服务器
npm start

# 运行 CLI
npm run cli
```

## 项目结构

```
mcp-server/
├── src/
│   ├── index.ts           # MCP 服务器入口
│   ├── airiot-api.ts      # AIRIOT API 客户端
│   ├── types.ts           # 类型定义
│   ├── config.ts          # 配置管理
│   ├── logger.ts          # 日志系统
│   ├── errors.ts          # 错误处理
│   ├── tools/             # MCP 工具
│   ├── resources/         # MCP 资源
│   ├── prompts/           # MCP 提示词
│   └── cli/               # CLI 工具
│       ├── index.ts       # CLI 入口
│       ├── config.ts      # CLI 配置管理
│       ├── formatter.ts   # 输出格式化
│       ├── utils.ts       # CLI 工具函数
│       ├── commands/      # CLI 命令模块
│       │   ├── warning.ts # 报警管理命令
│       │   ├── tables.ts  # 表管理命令
│       │   ├── records.ts # 记录管理命令
│       │   ├── tags.ts    # 属性点查询命令
│       │   ├── data.ts    # 时序数据命令
│       │   ├── stats.ts   # 统计命令
│       │   ├── files.ts   # 文件管理命令
│       │   ├── control.ts # 设备控制命令
│       │   ├── reports.ts # 报表管理命令
│       │   └── users.ts   # 用户管理命令
│       └── tests/         # 测试工具
├── dist/                  # 编译输出
├── .airiotrc.json.example # 配置示例
├── vitest.config.ts       # 测试配置
└── package.json
```

## API 文档

本服务器基于 [AIRIOT API 4.0](https://airiot.apifox.cn/llms.txt) 文档实现。

主要接口包括：

- **表管理**: `/core/t/schema/*`
- **表记录管理**: `/core/t/{table}/d/*`
- **属性点管理**: `/core/t/schema/tag/*`
- **时序数据**: `/api/core/time-series/*`
- **告警管理**: `/api/alarms/*`
- **文件管理**: `/api/files/*`
- **设备控制**: `/api/control/*`
- **报表管理**: `/api/reports/*`

## 错误处理

服务器实现了完善的错误处理机制：

- **NetworkError**: 网络连接错误
- **AuthError**: 认证失败（401）
- **NotFoundError**: 资源不存在（404）
- **ApiError**: API 请求错误（4xx/5xx）
- **ValidationError**: 参数验证错误

所有错误都会返回详细的错误信息，包括错误代码和详情。

## 许可证

MIT

## 贡献

欢迎提交 Issue 和 Pull Request！
