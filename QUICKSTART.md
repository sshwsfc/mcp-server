# AIRIOT MCP Server - 快速开始指南

## 📋 项目概述

本项目实现了基于 Model Context Protocol (MCP) 的 AIRIOT IoT 平台服务器，使 AI 助手（如 Claude Desktop）能够直接访问和操作 AIRIOT 平台的数据。

## ✨ 主要功能

✅ **表管理** - 查询、创建、更新、删除数据表
✅ **记录操作** - 完整的 CRUD 操作
✅ **属性点查询** - 获取表和记录的属性点定义
✅ **时序数据** - 查询最新和历史数据
✅ **统计分析** - 设备在线状态统计
✅ **批量操作** - 支持批量删除等操作

## 🚀 5分钟快速开始

### 步骤1: 安装

```bash
cd /Users/tianmiao/workspaces/iotv4/airiot-mcp-server
bash install.sh
```

或手动安装：
```bash
npm install
npm run build
```

### 步骤2: 配置

复制环境变量模板：
```bash
cp .env.example .env
```

编辑 `.env` 文件，填入你的 AIRIOT 配置：

```bash
AIRIOT_BASE_URL=https://your-airiot-server.com
AIRIOT_PROJECT_ID=your-project-id
AIRIOT_TOKEN=your-api-token
```

### 步骤3: 配置 Claude Desktop

编辑 Claude Desktop 配置文件：

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

添加以下内容：
```json
{
  "mcpServers": {
    "airiot": {
      "command": "node",
      "args": [
        "/Users/tianmiao/workspaces/iotv4/airiot-mcp-server/dist/index.js"
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

### 步骤4: 重启 Claude Desktop

完全退出 Claude Desktop 并重新启动。

### 步骤5: 开始使用

在 Claude Desktop 中尝试以下对话：

**你**: "显示系统中有哪些数据表"

**Claude**: 会自动调用 `get_tables` 工具并显示结果

## 📚 可用工具清单

### 表管理 (5个工具)
- `get_tables` - 查询表列表
- `get_table_by_id` - 查询单个表
- `create_table` - 创建表
- `update_table` - 更新表
- `delete_table` - 删除表

### 记录管理 (6个工具)
- `get_table_records` - 查询记录列表
- `get_record_by_id` - 查询单条记录
- `create_record` - 创建记录
- `update_record` - 更新记录
- `delete_record` - 删除记录
- `batch_delete_records` - 批量删除

### 属性点 (2个工具)
- `get_table_tags` - 查询表属性点
- `get_record_tags` - 查询记录属性点

### 时序数据 (2个工具)
- `get_latest_data` - 查询最新数据
- `get_history_data` - 查询历史数据

### 统计 (1个工具)
- `get_online_stats` - 在线状态统计

## 💡 常用使用场景

### 场景1: 设备管理
```
"显示所有在线设备"
"在设备表中添加一个新设备，名称为'温度传感器1号'"
"将设备'Device001'的状态改为维护中"
```

### 场景2: 数据查询
```
"查询设备'Device001'的最新温度数据"
"查询过去24小时的所有温度数据"
"显示设备表的所有可测属性点"
```

### 场景3: 数据分析
```
"统计所有设备的在线状态"
"找出温度超过30度的所有设备"
"计算平均温度值"
```

## 📖 详细文档

- **[README.md](README.md)** - 完整的项目文档
- **[EXAMPLES.md](EXAMPLES.md)** - 详细使用示例
- **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** - 项目结构说明

## 🔧 开发命令

```bash
# 开发模式（自动编译）
npm run dev

# 构建项目
npm run build

# 运行服务器
npm start
```

## ⚠️ 注意事项

1. **认证**: 确保 Token 有足够的权限
2. **网络**: 确保能访问 AIRIOT 服务器
3. **性能**: 大数据量查询时使用 `limit` 参数
4. **调试**: 查看 stderr 输出获取调试信息

## 🆘 常见问题

### Q: Claude Desktop 找不到 MCP Server？
A: 检查配置文件路径和 JSON 格式是否正确

### Q: 提示认证失败？
A: 检查 Token 是否正确，或尝试使用用户名密码

### Q: 查询超时？
A: 减小 `limit` 参数，分批查询数据

### Q: 找不到某个表？
A: 先调用 `get_tables` 查看所有可用表

## 🎯 下一步

1. 阅读 [EXAMPLES.md](EXAMPLES.md) 了解更多使用示例
2. 根据需要修改和扩展工具
3. 集成到你的工作流程中

## 📞 支持

如有问题，请查看：
- 项目文档
- AIRIOT API 文档: https://airiot.apifox.cn/llms.txt
- MCP 协议文档

---

**项目位置**: `/Users/tianmiao/workspaces/iotv4/airiot-mcp-server`

**版本**: 1.0.0

**许可**: MIT
