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
- [表管理](#表管理)
- [表记录管理](#表记录管理)
- [属性点查询](#属性点查询)
- [时序数据查询](#时序数据查询)
- [统计功能](#统计功能)
- [文件管理](#文件管理)
- [设备控制](#设备控制)
- [报表管理](#报表管理)
- [用户管理](#用户管理)
- [报警规则管理](#报警规则管理)
- [报警管理](#报警管理)

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

## 表管理

### 查询数据表列表

**命令：**

```bash
airiot tables [选项]
```

**选项：**

| 选项 | 简写 | 描述 | 默认值 |
|------|------|------|--------|
| `--filter <json>` | `-f` | 过滤条件，JSON 格式 | - |
| `--sort <json>` | `-s` | 排序条件，JSON 格式 | - |
| `--limit <number>` | `-l` | 返回数量限制 | 50 |
| `--skip <number>` | - | 跳过数量（分页） | 0 |
| `--with-count` | - | 返回总数 | - |

**filter 参数格式：**

```json
{
  "name": "设备表",
  "type": 1,
  "createTime": { "$gte": 1704067200000 }
}
```

支持的过滤操作符：
- `$eq` - 等于
- `$ne` - 不等于
- `$gt` - 大于
- `$gte` - 大于等于
- `$lt` - 小于
- `$lte` - 小于等于
- `$regex` - 正则表达式匹配
- `$in` - 在数组中
- `$or` - 或条件

**sort 参数格式：**

```json
{
  "createTime": -1,
  "name": 1
}
```

值为 1 表示升序，-1 表示降序。

**示例：**

```bash
# 查询所有表
airiot tables

# 查询名称包含"设备"的表
airiot tables --filter '{"name": {"$regex": "设备", "$options": "i"}}'

# 按创建时间倒序，返回前 10 条
airiot tables --sort '{"createTime": -1}' --limit 10

# 分页查询，跳过前 20 条，返回 10 条
airiot tables --skip 20 --limit 10

### 获取单个表详情

**命令：**

```bash
airiot table <table-id>
```

**参数：**

- `table-id`：表的 ID（必填）

**示例：**

```bash
airiot table tbl-001
airiot table tbl-001 -o json
```

### 创建数据表

**命令：**

```bash
airiot table-create [选项]
```

**选项：**

| 选项 | 描述 |
|------|------|
| `--file <path>` | 从 JSON 文件读取表定义 |
| `--json <json>` | JSON 格式的表定义数据 |

**表定义 JSON 格式：**

```json
{
  "id": "modelProperties",
  "title": "设备模型",
  "showField": "name",
  "schema": {
    "key": "modelProperties",
    "name": "模型属性",
    "type": "object",
    "properties": {
      "name": {
        "key": "name",
        "type": "string",
        "title": "名称",
        "fieldType": "input",
        "listFields": true,
        "createShow": true,
        "editShow": true,
        "need": true,
        "unique": true
      },
      "type": {
        "key": "type",
        "type": "string",
        "title": "类型",
        "fieldType": "select",
        "listFields": true,
        "createShow": true,
        "editShow": true,
        "options": [
          { "label": "传感器", "value": "sensor" },
          { "label": "控制器", "value": "controller" }
        ]
      },
      "status": {
        "key": "status",
        "type": "boolean",
        "title": "状态",
        "fieldType": "boolean",
        "listFields": true,
        "createShow": false,
        "editShow": false,
        "disabled": true
      }
    },
    "required": ["name"],
    "form": ["name", "type", "status"],
    "listFields": ["name", "type", "status"]
  }
}
```

**字段说明：**

| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| `id` | string | 是 | 表的唯一标识符 |
| `title` | string | 是 | 表的显示名称 |
| `showField` | string | 否 | 用于列表展示的默认字段 |
| `schema` | object | 是 | 表的结构定义，是基于标准的 JSON Schema 的扩展结构|
| `schema.key` | string | 是 | 内部使用的键名 |
| `schema.name` | string | 是 | 表的显示名称 |
| `schema.type` | string | 是 | 固定值 "object" |
| `schema.properties` | object | 是 | 字段定义对象, JSON Schema property |
| `schema.required` | array | 是 | 必填字段列表 |
| `schema.form` | array | 是 | 表单显示的字段顺序 |
| `schema.listFields` | array | 是 | 列表显示的字段 |

**字段属性说明：**

| 属性 | 类型 | 描述 |
|------|------|------|
| `key` | string | 字段唯一标识 |
| `type` | string | 数据类型(JSON Schema property type)：string/number/boolean/object/array |
| `title` | string | 字段显示名称 |
| `fieldType` | string | 表单控件类型：input/select/boolean/datePicker/number/file 等 |
| `listFields` | boolean | 是否在列表中显示 |
| `createShow` | boolean | 创建时是否显示 |
| `editShow` | boolean | 编辑时是否显示 |
| `disabled` | boolean | 是否禁用 |
| `need` | boolean | 是否必填 |
| `unique` | boolean | 是否唯一 |
| `options` | array | 选项列表（仅 select 类型） |

**示例表定义文件：**

```json
{
  "id": "devices",
  "title": "设备管理",
  "showField": "name",
  "schema": {
    "key": "devices",
    "name": "设备管理",
    "type": "object",
    "properties": {
      "name": {
        "key": "name",
        "type": "string",
        "title": "设备名称",
        "fieldType": "input",
        "listFields": true,
        "createShow": true,
        "editShow": true,
        "need": true,
        "unique": true
      },
      "code": {
        "key": "code",
        "type": "string",
        "title": "设备编码",
        "fieldType": "input",
        "listFields": true,
        "createShow": true,
        "editShow": true,
        "need": true
      },
      "ip": {
        "key": "ip",
        "type": "string",
        "title": "IP地址",
        "fieldType": "input",
        "listFields": true,
        "createShow": true,
        "editShow": true
      },
      "port": {
        "key": "port",
        "type": "number",
        "title": "端口号",
        "fieldType": "number",
        "listFields": true,
        "createShow": true,
        "editShow": true
      },
      "online": {
        "key": "online",
        "type": "boolean",
        "title": "在线状态",
        "fieldType": "boolean",
        "listFields": true,
        "createShow": false,
        "editShow": false,
        "disabled": true
      },
      "location": {
        "key": "location",
        "type": "string",
        "title": "位置",
        "fieldType": "input",
        "listFields": true,
        "createShow": true,
        "editShow": true
      }
    },
    "required": ["name", "code"],
    "form": ["name", "code", "ip", "port", "location"],
    "listFields": ["name", "code", "ip", "port", "online", "location"]
  }
}
```

**使用示例：**

```bash
# 从文件创建表
airiot table-create --file table-definition.json

# 使用 JSON 参数直接创建表
airiot table-create --json '{"id": "devices", "title": "设备管理", "schema": {"key": "devices", "name": "设备管理", "type": "object", "properties": {"name": {"key": "name", "type": "string", "title": "设备名称", "fieldType": "input", "listFields": true, "createShow": true, "editShow": true, "need": true}}, "required": ["name"], "form": ["name"], "listFields": ["name"]}}'
```

### 更新数据表

**命令：**

```bash
airiot table-update <table-id> [选项]
```

**选项：**

| 选项 | 描述 |
|------|------|
| `--name <name>` | 表名称 |
| `--description <desc>` | 表描述 |

**示例：**

```bash
airiot table-update tbl-001 --name "新表名"
airiot table-update tbl-001 --description "更新后的描述"
```

### 删除数据表

**命令：**

```bash
airiot table-delete <table-id>
```

**参数：**

- `table-id`：要删除的表 ID

**示例：**

```bash
airiot table-delete tbl-001
```

---

## 表记录管理

### 查询表记录

**命令：**

```bash
airiot records <table> [选项]
```

**选项：**

| 选项 | 简写 | 描述 | 默认值 |
|------|------|------|--------|
| `--filter <json>` | `-f` | 过滤条件，JSON 格式 | - |
| `--sort <json>` | `-s` | 排序条件，JSON 格式 | - |
| `--limit <number>` | `-l` | 返回数量限制 | 50 |
| `--skip <number>` | - | 跳过数量 | 0 |
| `--with-count` | - | 返回总数 | - |

**filter 参数详细说明：**

支持多种查询模式：

1. **完全匹配：**
```json
{
  "status": "online",
  "type": "sensor"
}
```

2. **模糊搜索：**
```json
{
  "name": {
    "$regex": "设备",
    "$options": "i"
  }
}
```

3. **或条件：**
```json
{
  "$or": [
    {"status": "online"},
    {"type": "sensor"}
  ]
}
```

4. **组合查询：**
```json
{
  "status": "online",
  "$or": [
    {"type": "sensor"},
    {"type": "controller"}
  ]
}
```

**sort 参数详细说明：**

```json
{
  "createTime": -1,
  "name": 1
}
```

- `1`：升序（从小到大）
- `-1`：降序（从大到小）
- 支持多字段排序，按字段顺序优先级排序

**示例：**

```bash
# 查询表的所有记录
airiot records devices

# 查询在线的传感器设备
airiot records devices --filter '{"status": "online", "type": "sensor"}'

# 模糊搜索名称包含"温度"的记录
airiot records devices --filter '{"name": {"$regex": "温度"}}'

# 按创建时间倒序，返回前 20 条
airiot records devices --sort '{"createTime": -1}' --limit 20

# 分页查询
airiot records devices --skip 40 --limit 20
```

### 获取单条记录

**命令：**

```bash
airiot record <table> <id>
```

**参数：**

- `table`：表名称（不是 ID）
- `id`：记录 ID

**示例：**

```bash
airiot record devices rec-001
airiot record devices rec-001 -o json
```

### 创建记录

**命令：**

```bash
airiot record-create <table> [选项]
```

**选项：**

| 选项 | 描述 |
|------|------|
| `--file <path>` | 从 JSON 文件读取数据 |
| `--json <json>` | JSON 格式的数据 |
| `--data <json>` | JSON 格式的数据（别名） |
| `--upsert` | 如果记录存在则更新 |

**数据格式：**

```json
{
  "name": "设备001",
  "code": "DEV-001",
  "ip": "192.168.1.100",
  "port": 8080,
  "location": "机房A",
  "type": "sensor"
}
```

**示例：**

```bash
# 从文件创建记录
airiot record-create devices --file record-data.json

# 直接指定 JSON 数据
airiot record-create devices --json '{"name": "设备001", "code": "DEV-001"}'

# 使用 upsert，记录存在则更新
airiot record-create devices --json '{"_id": "rec-001", "status": "offline"}' --upsert
```

### 更新记录

**命令：**

```bash
airiot record-update <table> <id> [选项]
```

**选项：**

| 选项 | 描述 |
|------|------|
| `--file <path>` | 从 JSON 文件读取数据 |
| `--json <json>` | JSON 格式的数据 |
| `--data <json>` | JSON 格式的数据（别名） |

**示例：**

```bash
# 更新指定字段
airiot record-update devices rec-001 --json '{"status": "offline", "ip": "192.168.1.200"}'

# 从文件读取更新数据
airiot record-update devices rec-001 --file update-data.json
```

### 删除记录

**命令：**

```bash
airiot record-delete <table> <id> [选项]
```

**选项：**

| 选项 | 描述 |
|------|------|
| `--attachment` | 级联删除附件 |

**示例：**

```bash
# 删除记录
airiot record-delete devices rec-001

# 删除记录并级联删除附件
airiot record-delete devices rec-001 --attachment
```

### 批量删除记录

**命令：**

```bash
airiot records-batch-delete <table> <ids...>
```

**参数：**

- `table`：表名称
- `ids`：记录 ID 列表，可以指定多个

**示例：**

```bash
# 删除单条记录
airiot records-batch-delete devices rec-001

# 批量删除多条记录
airiot records-batch-delete devices rec-001 rec-002 rec-003

# 配合其他命令使用（如 xargs）
airiot records devices -o json | jq '.[].id' | xargs airiot records-batch-delete devices
```

---

## 属性点查询

### 查询表的属性点定义

**命令：**

```bash
airiot tags <tableId>
```

**参数：**

- `tableId`：表 ID

**返回内容包括：**
- 属性点 ID
- 属性点名称
- 数据类型
- 单位
- 是否可写
- 描述信息

**示例：**

```bash
airiot tags tbl-001
airiot tags tbl-001 -o json
```

### 查询记录的属性点数据

**命令：**

```bash
airiot record-tags <table> <recordId>
```

**参数：**

- `table`：表名称（不是 ID）
- `recordId`：记录 ID

**示例：**

```bash
airiot record-tags devices rec-001
airiot record-tags devices rec-001 -o json
```

---

## 时序数据查询

### 查询最新数据

**命令：**

```bash
airiot data-latest [选项]
```

**选项：**

| 选项 | 描述 |
|------|------|
| `--device <id>` | 设备 ID |
| `--tag <id>` | 属性点 ID |
| `--file <path>` | 从 JSON 文件读取设备-属性点对 |
| `--json <json>` | JSON 格式的设备-属性点对 |

**设备-属性点对格式：**

```json
[
  {
    "deviceId": "device-001",
    "tagId": "tag-001"
  },
  {
    "deviceId": "device-001",
    "tagId": "tag-002"
  },
  {
    "deviceId": "device-002",
    "tagId": "tag-001"
  }
]
```

**示例：**

```bash
# 查询单个设备的单个属性点
airiot data-latest --device device-001 --tag temp-001

# 从 JSON 文件读取多个查询
airiot data-latest --file device-tags.json

# 直接指定 JSON
airiot data-latest --json '[{"deviceId": "device-001", "tagId": "temp-001"}]'
```

### 查询历史数据

**命令：**

```bash
airiot data-history [选项]
```

**必填选项：**

| 选项 | 描述 |
|------|------|
| `--start <timestamp>` | 开始时间戳（毫秒） |
| `--end <timestamp>` | 结束时间戳（毫秒） |

**可选选项：**

| 选项 | 描述 | 默认值 |
|------|------|--------|
| `--device <id>` | 设备 ID | - |
| `--tag <id>` | 属性点 ID | - |
| `--file <path>` | 从 JSON 文件读取设备-属性点对 | - |
| `--json <json>` | JSON 格式的设备-属性点对 | - |
| `--limit <number>` | 返回数量限制 | 1000 |

**时间戳获取方法：**

```bash
# 获取当前时间戳（毫秒）
date +%s%3N

# 获取指定时间的时间戳
date -j "2024-01-01 00:00:00" +%s%3N
```

**查询参数格式：**

```json
[
  {
    "deviceId": "device-001",
    "tagId": "tag-001",
    "start": 1609459200000,
    "end": 1609545600000
  }
]
```

**示例：**

```bash
# 查询最近1小时的数据
END=$(date +%s%3N)
START=$((END - 3600000))
airiot data-history --device device-001 --tag temp-001 --start $START --end $END

# 查询昨天全天数据
yesterday=$(date -v-1d +%Y-%m-%d)
start=$(date -j "$yesterday 00:00:00" +%s%3N)
end=$(date -j "$yesterday 23:59:59" +%s%3N)
airiot data-history --device device-001 --tag temp-001 --start $start --end $end

# 限制返回 100 条
airiot data-history --device device-001 --tag temp-001 --start 1609459200000 --end 1609545600000 --limit 100

# 从文件读取
airiot data-history --file history-params.json
```

**history-params.json 格式：**

```json
[
  {
    "deviceId": "device-001",
    "tagId": "temp-001",
    "start": 1609459200000,
    "end": 1609545600000,
    "limit": 100
  }
]
```

---

## 统计功能

### 设备在线状态统计

**命令：**

```bash
airiot stats-online <tableIds...>
```

**参数：**

- `tableIds`：表 ID 列表，可以指定多个

**返回内容包括：**
- 各表的设备总数
- 在线设备数
- 离线设备数
- 在线率

**示例：**

```bash
# 统计单个表的设备状态
airiot stats-online tbl-001

# 统计多个表的设备状态
airiot stats-online tbl-001 tbl-002 tbl-003
```

---

## 文件管理

### 上传文件

**命令：**

```bash
airiot file-upload <filePath> [选项]
```

**选项：**

| 选项 | 描述 |
|------|------|
| `--name <name>` | 文件名（默认使用原文件名） |
| `--mime <type>` | MIME 类型 |

**常用 MIME 类型：**

| 文件类型 | MIME 类型 |
|----------|-----------|
| PDF | application/pdf |
| JPEG 图片 | image/jpeg |
| PNG 图片 | image/png |
| JSON | application/json |
| 文本文件 | text/plain |
| Excel | application/vnd.openxmlformats-officedocument.spreadsheetml.sheet |

**示例：**

```bash
# 上传文件（使用原文件名）
airiot file-upload ./report.pdf

# 上传并指定新文件名
airiot file-upload ./data.json --name config.json

# 指定 MIME 类型
airiot file-upload ./image.jpg --mime image/jpeg
```

### 获取文件信息

**命令：**

```bash
airiot file-info <id>
```

**参数：**

- `id`：文件 ID

**示例：**

```bash
airiot file-info file-001
airiot file-info file-001 -o json
```

### 删除文件

**命令：**

```bash
airiot file-delete <id>
```

**参数：**

- `id`：文件 ID

**示例：**

```bash
airiot file-delete file-001
```

---

## 设备控制

### 发送控制命令

**命令：**

```bash
airiot control-send [选项]
```

**必填选项：**

| 选项 | 描述 |
|------|------|
| `--device <id>` | 设备 ID |
| `--tag <name>` | 属性点名称 |
| `--value <value>` | 控制值 |

**可选选项：**

| 选项 | 描述 | 默认值 |
|------|------|--------|
| `--timeout <seconds>` | 超时时间（秒） | 30 |

**控制值类型：**

- 数字：`--value 25`
- 字符串：`--value "on"`
- 布尔：`--value true`
- JSON 对象：`--value '{"param1": "value1"}'`

**示例：**

```bash
# 发送数字控制值
airiot control-send --device device-001 --tag temperature --value 25

# 发送开关控制
airiot control-send --device device-001 --tag switch --value "on"

# 设置超时时间为 60 秒
airiot control-send --device device-001 --tag command --value '{"action": "start"}' --timeout 60
```

### 批量发送控制命令

**命令：**

```bash
airiot control-batch [选项]
```

**选项：**

| 选项 | 描述 |
|------|------|
| `--file <path>` | 从 JSON 文件读取命令 |
| `--json <json>` | JSON 格式的命令数组 |

**命令数组格式：**

```json
[
  {
    "deviceId": "device-001",
    "tagName": "temp1",
    "value": 25,
    "timeout": 30
  },
  {
    "deviceId": "device-001",
    "tagName": "temp2",
    "value": 30,
    "timeout": 30
  },
  {
    "deviceId": "device-002",
    "tagName": "switch",
    "value": "on"
  }
]
```

**示例：**

```bash
# 从文件读取批量命令
airiot control-batch --file commands.json

# 直接指定 JSON 数组
airiot control-batch --json '[{"deviceId": "device-001", "tagName": "temp", "value": 25}]'
```

---

## 报表管理

### 查询报表列表

**命令：**

```bash
airiot reports [选项]
```

**选项：**

| 选项 | 描述 | 默认值 |
|------|------|--------|
| `--filter <json>` | 过滤条件，JSON 格式 | - |
| `--limit <number>` | 返回数量限制 | 50 |

**示例：**

```bash
# 查询所有报表
airiot reports

# 查询特定类型的报表
airiot reports --filter '{"type": "daily"}'

# 返回前 20 条
airiot reports --limit 20
```

### 获取报表详情

**命令：**

```bash
airiot report <id>
```

**参数：**

- `id`：报表 ID

**示例：**

```bash
airiot report report-001
airiot report report-001 -o json
```

### 执行报表

**命令：**

```bash
airiot report-execute <id> [选项]
```

**选项：**

| 选项 | 描述 |
|------|------|
| `--file <path>` | 从 JSON 文件读取参数 |
| `--json <json>` | JSON 格式的参数 |

**参数格式：**

```json
{
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "deviceIds": ["device-001", "device-002"],
  "format": "pdf"
}
```

**示例：**

```bash
# 执行报表（无参数）
airiot report-execute report-001

# 从文件读取参数
airiot report-execute report-001 --file params.json

# 直接指定参数
airiot report-execute report-001 --json '{"startDate": "2024-01-01", "endDate": "2024-12-31"}'
```

### 创建报表

**命令：**

```bash
airiot report-create [选项]
```

**必填选项：**

| 选项 | 描述 |
|------|------|
| `--name <name>` | 报表名称 |
| `--type <type>` | 报表类型 |

**可选选项：**

| 选项 | 描述 |
|------|------|
| `--file <path>` | 从 JSON 文件读取报表定义 |
| `--description <desc>` | 报表描述 |
| `--config <json>` | 报表配置（JSON 格式） |

**报表类型常见值：**
- `daily` - 日报
- `weekly` - 周报
- `monthly` - 月报
- `custom` - 自定义

**报表配置格式：**

```json
{
  "template": "default",
  "columns": ["device", "avgValue", "maxValue", "minValue"],
  "groupBy": "device",
  "charts": [
    {
      "type": "line",
      "title": "温度趋势图",
      "xAxis": "time",
      "yAxis": "value"
    }
  ]
}
```

**示例：**

```bash
# 创建基本报表
airiot report-create --name "设备日报" --type daily

# 创建带描述的报表
airiot report-create --name "温度统计报表" --type custom --description "温度数据统计报表"

# 创建带配置的报表
airiot report-create --name "设备运行报表" --type custom --config '{"template": "default"}'

# 从文件创建报表
airiot report-create --file report-definition.json
```

### 更新报表

**命令：**

```bash
airiot report-update <id> [选项]
```

**选项：**

| 选项 | 描述 |
|------|------|
| `--name <name>` | 报表名称 |
| `--description <desc>` | 报表描述 |
| `--config <json>` | 报表配置（JSON 格式）|

**示例：**

```bash
# 更新报表名称
airiot report-update report-001 --name "新报表名称"

# 更新报表描述和配置
airiot report-update report-001 --description "更新后的描述" --config '{"template": "new"}'
```

### 删除报表

**命令：**

```bash
airiot report-delete <id>
```

**参数：**

- `id`：报表 ID

**示例：**

```bash
airiot report-delete report-001
```

---

## 用户管理

### 获取当前用户信息

**命令：**

```bash
airiot user
```

**返回内容包括：**
- 用户 ID
- 用户名
- 昵称
- 邮箱
- 角色
- 权限

**示例：**

```bash
airiot user
airiot user -o json
```

### 获取用户列表

**命令：**

```bash
airiot users [选项]
```

**选项：**

| 选项 | 描述 | 默认值 |
|------|------|--------|
| `--filter <json>` | 过滤条件，JSON 格式 | - |
| `--limit <number>` | 返回数量限制 | 50 |

**filter 参数示例：**

```json
{
  "role": "admin",
  "status": "active"
}
```

**示例：**

```bash
# 查询所有用户
airiot users

# 查询管理员用户
airiot users --filter '{"role": "admin"}'

# 返回前 20 条
airiot users --limit 20
```

---

## 报警规则管理

### 查询报警规则列表

**命令：**

```bash
airiot rules list [选项]
```

**选项：**

| 选项 | 简写 | 描述 | 默认值 |
|------|------|------|--------|
| `--filter <json>` | `-f` | 过滤条件，JSON 格式 | - |
| `--sort <json>` | `-s` | 排序条件，JSON 格式 | - |
| `--limit <number>` | `-l` | 返回数量限制 | 50 |
| `--skip <number>` | - | 跳过数量 | 0 |
| `--with-count` | - | 返回总数 | - |

**示例：**

```bash
# 查询所有启用的规则
airiot rules list --filter '{"enable": true}'

# 查询紧急级别的规则
airiot rules list --filter '{"level": 4}'

# 按创建时间倒序
airiot rules list --sort '{"createTime": -1}'
```

### 获取单个报警规则

**命令：**

```bash
airiot rules get <id>
```

**参数：**

- `id`：规则 ID

**示例：**

```bash
airiot rules get rule-001
```

### 创建报警规则

**命令：**

```bash
airiot rules create [选项]
```

**必填选项：**

| 选项 | 描述 |
|------|------|
| `--name <name>` | 规则名称 |
| `--level <number>` | 报警级别：1-提示, 2-一般, 3-重要, 4-紧急 |

**可选选项：**

| 选项 | 描述 | 默认值 |
|------|------|--------|
| `--enable <boolean>` | 是否启用 | true |
| `--description <text>` | 规则描述 | - |

**报警级别说明：**
- `1` - 提示
- `2` - 一般
- `3` - 重要
- `4` - 紧急

**示例：**

```bash
# 创建基本规则
airiot rules create --name "高温报警" --level 3

# 创建禁用的规则
airiot rules create --name "低温报警" --level 2 --enable false

# 创建带描述的规则
airiot rules create --name "设备离线报警" --level 3 --description "检测到设备离线时触发"
```

### 更新报警规则

**命令：**

```bash
airiot rules update <id> [选项]
```

**选项：**

| 选项 | 描述 |
|------|------|
| `--name <name>` | 规则名称 |
| `--level <number>` | 报警级别 |
| `--enable <boolean>` | 是否启用 |
| `--description <text>` | 规则描述 |

**示例：**

```bash
# 启用规则
airiot rules update rule-001 --enable true

# 更新规则名称和级别
airiot rules update rule-001 --name "新规则名" --level 4

# 禁用规则
airiot rules update rule-001 --enable false
```

### 删除报警规则

**命令：**

```bash
airiot rules delete <id>
```

**参数：**

- `id`：规则 ID

**示例：**

```bash
airiot rules delete rule-001
```

---

## 报警管理

### 查询报警列表

**命令：**

```bash
airiot warnings list [选项]
airiot warnings ls [选项]  # 别名
```

**选项：**

| 选项 | 简写 | 描述 | 默认值 |
|------|------|------|--------|
| `--filter <json>` | `-f` | 过滤条件，JSON 格式 | - |
| `--sort <json>` | `-s` | 排序条件，JSON 格式 | - |
| `--limit <number>` | `-l` | 返回数量限制 | 50 |
| `--skip <number>` | - | 跳过数量 | 0 |
| `--with-count` | - | 返回总数 | - |
| `--level <number>` | - | 报警级别：1-提示, 2-一般, 3-重要, 4-紧急 | - |
| `--status <number>` | - | 报警状态：0-未确认, 1-已确认, 2-已恢复, 3-已归档 | - |
| `--rule-id <id>` | - | 规则 ID | - |
| `--device-id <id>` | - | 设备 ID | - |
| `--tag-id <id>` | - | 属性点 ID | - |
| `--keyword <text>` | - | 关键词搜索 | - |

**报警级别说明：**
- `1` - 提示
- `2` - 一般
- `3` - 重要
- `4` - 紧急

**报警状态说明：**
- `0` - 未确认
- `1` - 已确认
- `2` - 已恢复
- `3` - 已归档

**示例：**

```bash
# 查询所有未确认的紧急报警
airiot warnings list --level 4 --status 0

# 查询特定设备的报警
airiot warnings list --device-id device-001

# 查询最近 24 小时的报警
airiot warnings list --sort '{"occurTime": -1}' --limit 100

# 关键词搜索
airiot warnings list --keyword "温度"
```

### 获取单个报警详情

**命令：**

```bash
airiot warnings get <id>
```

**参数：**

- `id`：报警 ID

**示例：**

```bash
airiot warnings get warning-001
```

### 确认报警

**命令：**

```bash
airiot warnings confirm <id> [选项]
```

**选项：**

| 选项 | 描述 |
|------|------|
| `-n, --note <text>` | 确认备注 |
| `--user-id <id>` | 确认人 ID |

**示例：**

```bash
# 基本确认
airiot warnings confirm warning-001

# 带备注确认
airiot warnings confirm warning-001 --note "已检查设备正常"

# 指定确认人
airiot warnings confirm warning-001 --user-id user-001 --note "已处理"
```

### 解决/恢复报警

**命令：**

```bash
airiot warnings resolve <id> [选项]
airiot warnings rv <id> [选项]  # 别名
```

**选项：**

| 选项 | 描述 |
|------|------|
| `-n, --note <text>` | 恢复备注 |

**示例：**

```bash
# 标记报警为已恢复
airiot warnings resolve warning-001

# 带备注的恢复
airiot warnings resolve warning-001 --note "设备已恢复正常"
```

### 获取报警统计

**命令：**

```bash
airiot warnings stats [选项]
```

**返回内容包括：**
- 总报警数
- 各级别报警数量
- 各状态报警数量
- 今日/本周/本月统计

**示例：**

```bash
airiot warnings stats
airiot warnings stats -o json
```

### 获取最新报警

**命令：**

```bash
airiot warnings latest [选项]
```

**选项：**

| 选项 | 描述 | 默认值 |
|------|------|--------|
| `-l, --limit <number>` | 返回数量 | 10 |

**示例：**

```bash
# 获取最新 10 条报警
airiot warnings latest

# 获取最新 20 条报警
airiot warnings latest --limit 20
```

### 批量确认报警

**命令：**

```bash
airiot warnings batch-confirm <ids...>
```

**参数：**

- `ids`：报警 ID 列表，可以指定多个

**选项：**

| 选项 | 描述 |
|------|------|
| `-n, --note <text>` | 确认备注 |
| `--user-id <id>` | 确认人 ID |

**示例：**

```bash
# 确认单个报警
airiot warnings batch-confirm warning-001

# 批量确认多个报警
airiot warnings batch-confirm warning-001 warning-002 warning-003

# 带备注的批量确认
airiot warnings batch-confirm warning-001 warning-002 --note "批量确认" --user-id user-001
```

---

## 高级用法

### 组合命令

```bash
# 查询所有表，然后逐个获取记录
for table in $(airiot tables -o json | jq -r '.[].id'); do
  echo "=== 表: $table ==="
  airiot records $table --limit 5
done

# 查询所有离线设备
airiot records devices --filter '{"online": false}' | jq '.[] | .id'

# 批量处理离线设备
airiot records devices --filter '{"online": false}' -o json | jq -r '.[] | .id' | \
  xargs -I {} airiot control-send --device {} --tag switch --value "off"
```

### 导出和导入

```bash
# 导出表数据到 JSON
airiot records devices -o json > devices-backup.json

# 导出特定时间范围的数据
START=$(date -j "2024-01-01 00:00:00" +%s%3N)
END=$(date -j "2024-12-31 23:59:59" +%s%3N)
airiot data-history --device device-001 --tag temp --start $START --end $END -o json > temp-2024.json
```

### 定时任务

```bash
#!/bin/bash
# 每小时检查最新报警
while true; do
  airiot warnings latest --limit 5
  sleep 3600
done

# 每天生成报表
#!/bin/bash
REPORT_ID="daily-report-001"
airiot report-execute $REPORT_ID --json '{"endDate": "'$(date +%Y-%m-%d)'"}'
```

---

## 常见问题排查

### 认证错误

**错误信息：** `未配置 API 信息，请先运行 airiot login`

**解决方案：**

```bash
# 检查配置
airiot config

# 重新登录
airiot login --url <your-url> --project <project-id>
```

### 文件格式错误

**错误信息：** `Unexpected token in JSON at position X`

**解决方案：**

```bash
# 验证 JSON 格式
cat your-file.json | jq .

# 使用在线工具验证
# https://jsonlint.com/
```

### 参数格式问题

**提示：** 使用 `-f` 或 `--filter` 时，确保 JSON 格式正确

**正确格式：**

```bash
airiot tables --filter '{"name": "设备表"}'

# 错误格式（会失败）
airiot tables --filter {name: "设备表"}
airiot tables --filter '{name: "设备表"}'
```

### 时间戳问题

**提示：** 时间戳必须是毫秒级的 13 位数字

**转换方法：**

```bash
# 秒转毫秒（乘以 1000）
date +%s | awk '{print $1 * 1000}'

# 毫秒转秒（除以 1000）
echo 1609459200000 | awk '{print $1 / 1000}'
```

---

## 附录：数据类型映射

### 字段类型对照表

| 类型值 | fieldType | 说明 |
|-------|-----------|------|
| string | input | 单行文本输入 |
| text | textarea | 多行文本输入 |
| number | number | 数字输入 |
| boolean | boolean | 布尔选择 |
| date | datePicker | 日期选择器 |
| time | timePicker | 时间选择器 |
| datetime | dateTimePicker | 日期时间选择器 |
| select | select | 下拉选择 |
| select | select | 下拉选择（自定义选项） |
| file | file | 文件上传 |
| image | image | 图片上传 |
| location | location | 地点选择 |

### 报警级别对照表

| 级别值 | 名称 | 颜色建议 |
|-------|------|----------|
| 1 | 提示 | 蓝色 |
| 2 | 一般 | 黄色 |
| 3 | 重要 | 橙色 |
| 4 | 紧急 | 红色 |

### 报警状态对照表

| 状态值 | 名称 | 操作建议 |
|-------|------|----------|
| 0 | 未确认 | 需要处理 |
| 1 | 已确认 | 持续关注 |
| 2 | 已恢复 | 可以归档 |
| 3 | 已归档 | 已完结 |
