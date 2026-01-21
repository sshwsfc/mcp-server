# AIRIOT MCP Server 使用示例

本文档提供详细的使用场景示例，展示如何通过各种 AI 助手（如 Claude Desktop）使用 AIRIOT MCP Server。

## 场景1: 设备管理

### 查看所有数据表

**用户输入**: "显示所有可用的数据表"

**Claude 调用**:
```json
{
  "tool": "get_tables",
  "arguments": {
    "limit": 50,
    "sort": { "createTime": -1 }
  }
}
```

**返回结果**:
```json
{
  "list": [
    {
      "_id": "table001",
      "name": "设备表",
      "description": "存储设备基础信息",
      "projectId": "proj001",
      "createTime": 1704067200000
    },
    {
      "_id": "table002",
      "name": "传感器表",
      "description": "存储传感器数据",
      "projectId": "proj001",
      "createTime": 1704067300000
    }
  ],
  "total": 2
}
```

### 查看特定表的记录

**用户输入**: "显示设备表中的所有在线设备"

**Claude 调用**:
```json
{
  "tool": "get_table_records",
  "arguments": {
    "tableId": "table001",
    "filter": {
      "status": "online"
    },
    "limit": 100
  }
}
```

### 添加新设备

**用户输入**: "在设备表中添加一个新设备，名称为'温度传感器1号'，位置为'A区3号车间'"

**Claude 调用**:
```json
{
  "tool": "create_record",
  "arguments": {
    "tableId": "table001",
    "data": {
      "name": "温度传感器1号",
      "location": "A区3号车间",
      "status": "online",
      "type": "temperature"
    }
  }
}
```

## 场景2: 数据查询

### 查询设备最新数据

**用户输入**: "查询设备'Device001'的温度和湿度最新值"

**Claude 调用**:
```json
{
  "tool": "get_latest_data",
  "arguments": {
    "deviceTagPairs": [
      {
        "deviceId": "Device001",
        "tagId": "temperature"
      },
      {
        "deviceId": "Device001",
        "tagId": "humidity"
      }
    ]
  }
}
```

### 查询历史数据

**用户输入**: "查询设备'Device001'最近24小时的温度数据"

**Claude 调用**:
```json
{
  "tool": "get_history_data",
  "arguments": {
    "deviceTagPairs": [
      {
        "deviceId": "Device001",
        "tagId": "temperature"
      }
    ],
    "startTime": 1704067200000,
    "endTime": 1704153600000,
    "limit": 1000
  }
}
```

### 查询属性点定义

**用户输入**: "显示设备表的所有可测属性点"

**Claude 调用**:
```json
{
  "tool": "get_table_tags",
  "arguments": {
    "tableId": "table001"
  }
}
```

## 场景3: 数据分析

### 统计设备在线状态

**用户输入**: "统计所有设备表的设备在线情况"

**Claude 调用**:
```json
{
  "tool": "get_online_stats",
  "arguments": {
    "tableIds": ["table001", "table002"]
  }
}
```

**返回结果**:
```json
{
  "table001": {
    "total": 100,
    "online": 85,
    "offline": 15
  },
  "table002": {
    "total": 50,
    "online": 45,
    "offline": 5
  }
}
```

## 场景4: 批量操作

### 批量更新设备状态

**用户输入**: "将设备ID为'Device001', 'Device002', 'Device003'的状态都改为维护中"

**Claude 调用**:
```json
{
  "tool": "update_record",
  "arguments": {
    "id": "Device001",
    "data": {
      "status": "maintenance"
    }
  }
}
```
（重复调用3次）

### 批量删除记录

**用户输入**: "删除ID为'record001', 'record002', 'record003'的记录"

**Claude 调用**:
```json
{
  "tool": "batch_delete_records",
  "arguments": {
    "ids": ["record001", "record002", "record003"]
  }
}
```

## 场景5: 复杂查询

### 组合查询和数据分析

**用户输入**: "找出温度超过30度的所有设备，并显示它们的位置信息"

**Claude 调用步骤**:

1. 首先获取所有设备表
```json
{
  "tool": "get_tables",
  "arguments": {
    "filter": {
      "name": "温度传感器"
    }
  }
}
```

2. 获取该表的记录
```json
{
  "tool": "get_table_records",
  "arguments": {
    "tableId": "table001",
    "limit": 1000
  }
}
```

3. 对每个设备查询最新温度数据
```json
{
  "tool": "get_latest_data",
  "arguments": {
    "deviceTagPairs": [
      {
        "deviceId": "Device001",
        "tagId": "temperature"
      }
    ]
  }
}
```

## 最佳实践

### 1. 分页查询

对于大数据量的表，使用分页避免一次性加载过多数据：

```json
{
  "tool": "get_table_records",
  "arguments": {
    "tableId": "table001",
    "limit": 50,
    "skip": 0
  }
}
```

### 2. 精确过滤

使用 filter 参数减少不必要的数据传输：

```json
{
  "tool": "get_table_records",
  "arguments": {
    "tableId": "table001",
    "filter": {
      "status": "online",
      "type": "temperature"
    }
  }
}
```

### 3. 时间范围查询

查询历史数据时指定合理的时间范围：

```json
{
  "tool": "get_history_data",
  "arguments": {
    "deviceTagPairs": [...],
    "startTime": 起始时间戳,
    "endTime": 结束时间戳,
    "limit": 1000
  }
}
```

### 4. 错误处理

所有工具调用都可能返回错误，始终检查返回结果：

```json
{
  "error": "错误信息",
  "details": "详细错误信息"
}
```

## 提示词示例

你可以直接复制以下提示词到 Claude Desktop：

### 示例1: 快速查看设备状态
```
请帮我查看系统中有多少设备表，以及每个表的设备数量和在线状态
```

### 示例2: 数据分析
```
查询过去24小时内所有温度传感器的最高温度、最低温度和平均值
```

### 示例3: 设备管理
```
创建一个新设备记录，设备名称为"测试设备001"，类型为"压力传感器"，安装位置在"B区1号车间"
```

### 示例4: 监控告警
```
检查所有设备，找出温度超过80度的设备，并显示它们的设备名称、位置和当前温度值
```

## 故障排查

### 问题1: 认证失败
**错误**: "登录失败"
**解决**: 检查 AIRIOT_TOKEN 或用户名密码是否正确

### 问题2: 找不到表
**错误**: "表不存在"
**解决**: 先调用 get_tables 查看所有可用的表

### 问题3: 权限不足
**错误**: "无权限访问"
**解决**: 检查账号是否有相应的数据访问权限

### 问题4: 查询超时
**错误**: "请求超时"
**解决**: 减小 limit 参数，分批查询数据
