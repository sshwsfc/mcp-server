---
name: airiot-cli
description: AIRIOT 物联网平台 CLI 工具 - 用于连接和操作 AIRIOT 平台的命令行接口。当用户需要连接和操作 AIRIOT 物联网平台时，请使用本 CLI 工具。AIRIOT 是一个物联网设备管理和数据采集平台。当用户提到以下需求时，应考虑使用此工具：

- 📡 **连接 AIRIOT 服务器** - 需要访问 AIRIOT 平台的数据和设备
- 📊 **查询数据表** - 获取表结构、记录数据
- 🏷️ **属性点管理** - 查询设备属性点和实时数据
- 📈 **时序数据查询** - 获取设备历史数据、趋势分析
- 🎛️ **设备控制** - 发送控制命令到设备
- 🚨 **报警管理** - 查询、确认报警信息
- 📑 **报表管理** - 生成和执行报表
- 👥 **用户管理** - 管理平台用户
- 📁 **文件管理** - 上传、下载平台文件

keywords: AIRIOT, 物联网平台, 设备管理, 数据采集, 表管理, 属性点, 时序数据, 设备控制, 报警管理, 报表管理, 用户管理, 文件管理, CLI工具
---

## CLI 基本用法

```bash
# 安装 CLI, 应首先检测是否已安装 Node.js 和 npm，如果未安装，请先安装 Node.js（建议版本 20 及以上），然后检测airiot命令是否可用，如果不可用则提示安装。
npm install -g @airiot/tools

# 登录连接平台
airiot login --url https://your-airiot-server.com --project your-project-id

# 查看帮助
airiot --help
airiot <command> --help
```

## 目录

- [环境配置](#环境配置)
- [输出格式](#输出格式)
- [功能模块文档](#功能模块文档)
- [高级用法](#高级用法)
- [常见问题排查](#常见问题排查)
- [附录：数据类型映射](#附录：数据类型映射)

---

## 环境配置

### 首次使用

在使用 CLI 之前，必须先登录配置认证信息：

```bash
airiot login --url https://your-airiot-server.com --project your-project-id
```

**参数说明：**
- `--url`: AIRIOT 服务器地址（必填）
- `--project`: 项目ID（必填）
- `-u, --username`: 用户名（可选，用于用户名密码登录）
- `-p, --password`: 密码（可选，用于用户名密码登录）
- `-t, --token`: API Token（可选，直接使用 Token 跳过登录）

**示例：**

```bash
# 使用用户名密码登录
airiot login --url https://demo.airiot.cn --project prj-001 --username admin --password admin123

# 直接使用 Token
airiot login --url https://demo.airiot.cn --project prj-001 --token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 配置文件优先级

CLI 支持两种配置方式，优先级从高到低：

1. **项目级配置**：当前目录的 `.airiotrc.json`
2. **全局配置**：`~/.airiot/config.json`

**创建项目级配置示例：**

```bash
# 在项目根目录创建 .airiotrc.json
cat > .airiotrc.json << 'EOF'
{
  "baseUrl": "https://your-airiot-server.com",
  "projectId": "your-project-id",
  "token": "your-token-here"
}
EOF
```

**配置文件格式：**

```json
{
  "baseUrl": "https://your-airiot-server.com",
  "projectId": "your-project-id",
  "token": "your-api-token",
  "username": "optional-username",
  "password": "optional-password",
  "timeout": 30000,
  "logLevel": "info",
  "retries": 3
}
```

### 查看当前配置

```bash
airiot config
```

### 登出

```bash
airiot logout
```

---

## 输出格式

所有命令都支持 `-o, --output` 选项来指定输出格式：

- `json` - JSON 格式输出，适合程序处理
- `table` - 表格格式输出，适合人类阅读（默认）
- `plain` - 纯文本格式

**示例：**

```bash
airiot tables -o json    # JSON 格式
airiot tables -o table    # 表格格式（默认）
airiot tables -o plain    # 纯文本格式
```

---

## 功能模块文档

详细的命令说明和示例请查看独立的模块文档：

| 模块 | 文档 | 说明 |
|------|------|------|
| 表管理 | [docs/01-表管理.md](docs/01-表管理.md) | 数据表的查询、创建、更新和删除，包含完整的表结构定义和20种字段类型说明 |
| 表记录管理 | [docs/02-表记录管理.md](docs/02-表记录管理.md) | 表记录的增删改查操作，支持复杂查询条件和批量操作 |
| 属性点查询 | [docs/03-属性点查询.md](docs/03-属性点查询.md) | 设备属性点信息查询功能 |
| 时序数据查询 | [docs/04-时序数据查询.md](docs/04-时序数据查询.md) | 设备历史时序数据查询，支持时间范围、聚合等多种查询方式 |
| 统计功能 | [docs/05-统计功能.md](docs/05-统计功能.md) | 表数据统计分析功能 |
| 文件管理 | [docs/06-文件管理.md](docs/06-文件管理.md) | 文件上传、下载、删除操作 |
| 设备控制 | [docs/07-设备控制.md](docs/07-设备控制.md) | 向设备发送控制命令 |
| 报表管理 | [docs/08-报表管理.md](docs/08-报表管理.md) | 报表查询、执行和导出功能 |
| 用户管理 | [docs/09-用户管理.md](docs/09-用户管理.md) | 平台用户信息查询和管理 |
| 报警规则管理 | [docs/10-报警规则管理.md](docs/10-报警规则管理.md) | 报警规则的创建、查询、更新和删除 |
| 报警管理 | [docs/11-报警管理.md](docs/11-报警管理.md) | 报警信息查询和管理功能 |

---

## 快速参考

### 常用命令速查

```bash
# 表操作
airiot tables                           # 查询所有表
airiot table <table-id>                 # 获取表详情
airiot table-create --file schema.json  # 创建表
airiot table-update <id> --file schema.json  # 更新表
airiot table-delete <id>                # 删除表

# 记录操作
airiot records <table>                  # 查询表记录
airiot record <table> <id>              # 获取单条记录
airiot record-create <table> --json '{...}'  # 创建记录
airiot record-update <table> <id> --json '{...}'  # 更新记录
airiot record-delete <table> <id>       # 删除记录

# 属性点和时序数据
airiot tags <tableId>                   # 查询表属性点
airiot record-tags <table> <recordId>   # 查询记录属性点
airiot data-latest --device <id> --tag <tag>  # 查询最新数据
airiot data-history --device <id> --tag <tag> --start <ts> --end <ts>  # 查询历史数据

# 设备控制
airiot control-send --device <id> --tag <tag> --value <val>  # 发送控制命令
airiot control-batch --file commands.json  # 批量发送控制

# 报警管理
airiot warnings list                    # 查询报警列表
airiot warnings confirm <id>            # 确认报警
airiot warnings resolve <id>            # 解决报警
airiot rules list                       # 查询报警规则
```

---

## 高级用法

组合命令、导出导入、定时任务等高级使用场景，请查看：[docs/12-高级用法.md](docs/12-高级用法.md)

---

## 常见问题排查

认证错误、文件格式错误、参数格式问题、时间戳问题等常见问题的解决方案，请查看：[docs/13-常见问题排查.md](docs/13-常见问题排查.md)

---

## 附录：数据类型映射

字段类型对照表、报警级别对照表、报警状态对照表等数据类型映射，请查看：[docs/14-附录数据类型映射.md](docs/14-附录数据类型映射.md)

---

**完整文档索引：** 请查看 [docs](docs/) 目录下的各模块文档
