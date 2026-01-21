# 项目结构说明

```
airiot-mcp-server/
├── src/                          # 源代码目录
│   ├── index.ts                  # MCP Server 主入口
│   ├── types.ts                  # TypeScript 类型定义
│   ├── airiot-api.ts             # AIRIOT API 客户端
│   └── tools/                    # MCP 工具定义
│       └── index.ts              # 工具列表和执行逻辑
│
├── dist/                         # 编译输出目录（自动生成）
│   ├── index.js
│   ├── index.d.ts
│   └── ...
│
├── node_modules/                 # 依赖包（自动生成）
│
├── .env                          # 环境变量配置文件（需创建）
├── .env.example                  # 环境变量示例
├── .gitignore                    # Git 忽略文件
│
├── package.json                  # 项目配置和依赖
├── tsconfig.json                 # TypeScript 配置
│
├── install.sh                    # 安装脚本
├── README.md                     # 项目说明
├── EXAMPLES.md                   # 使用示例
└── PROJECT_STRUCTURE.md          # 本文件
```

## 核心文件说明

### 1. src/index.ts
MCP Server 的主入口文件，负责：
- 初始化 AIRIOT API 客户端
- 创建 MCP Server 实例
- 注册工具处理器
- 启动 stdio 通信

### 2. src/types.ts
TypeScript 类型定义，包含：
- API 请求/响应类型
- 数据模型类型（Table、Record、Tag 等）
- 配置类型

### 3. src/airiot-api.ts
AIRIOT API 客户端类，提供：
- HTTP 请求封装
- 认证管理
- 表管理 API
- 表记录管理 API
- 属性点查询 API
- 时序数据查询 API
- 统计 API

### 4. src/tools/index.ts
MCP 工具定义和执行逻辑：
- 定义所有可用的 MCP 工具
- 实现工具调用路由
- 参数验证和结果处理

## 架构设计

```
┌─────────────────────────────────────────────────┐
│          Claude Desktop (或其他 AI 客户端)       │
└─────────────────┬───────────────────────────────┘
                  │ MCP Protocol (stdio)
                  ▼
┌─────────────────────────────────────────────────┐
│            MCP Server (src/index.ts)            │
│  - Server 初始化                                │
│  - 工具注册                                      │
│  - 请求/响应处理                                 │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│         Tools Layer (src/tools/index.ts)        │
│  - 工具定义                                      │
│  - 参数验证                                      │
│  - 结果格式化                                    │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│      API Client (src/airiot-api.ts)             │
│  - HTTP 请求                                     │
│  - 认证管理                                      │
│  - 错误处理                                      │
└─────────────────┬───────────────────────────────┘
                  │ HTTP/HTTPS
                  ▼
┌─────────────────────────────────────────────────┐
│           AIRIOT Platform API                   │
│  - 表管理接口                                    │
│  - 记录管理接口                                  │
│  - 时序数据接口                                  │
│  - 统计接口                                      │
└─────────────────────────────────────────────────┘
```

## 数据流

### 请求流程
```
1. 用户通过 Claude Desktop 发送请求
2. MCP Server 接收 stdio 输入
3. 解析工具名称和参数
4. 调用对应的工具执行器
5. API Client 发送 HTTP 请求到 AIRIOT
6. 接收响应并格式化
7. 通过 stdio 返回给 Claude Desktop
```

### 响应流程
```
1. API Client 接收 AIRIOT 响应
2. 检查响应状态和错误
3. 格式化为 MCP 响应格式
4. 通过 stdio 发送给 Claude Desktop
5. Claude 展示给用户
```

## 扩展开发

### 添加新工具

1. 在 `src/tools/index.ts` 中添加工具定义：
```typescript
{
  name: 'your_new_tool',
  description: '工具描述',
  inputSchema: {
    type: 'object',
    properties: { ... },
    required: [ ... ]
  }
}
```

2. 在 `executeTool` 函数中添加处理逻辑：
```typescript
case 'your_new_tool':
  return await apiClient.yourMethod(args);
```

3. 在 `src/airiot-api.ts` 中实现 API 方法：
```typescript
async yourMethod(params: any): Promise<any> {
  // 实现逻辑
}
```

### 添加新类型

在 `src/types.ts` 中添加类型定义：
```typescript
export interface YourNewType {
  id: string;
  name: string;
  // ...
}
```

## 依赖说明

### 生产依赖
- `@modelcontextprotocol/sdk`: MCP SDK
- `axios`: HTTP 客户端

### 开发依赖
- `@types/node`: Node.js 类型定义
- `typescript`: TypeScript 编译器

## 环境变量

| 变量名 | 必填 | 说明 |
|--------|------|------|
| AIRIOT_BASE_URL | 是 | AIRIOT 服务器地址 |
| AIRIOT_PROJECT_ID | 是 | 项目ID |
| AIRIOT_TOKEN | 条件 | API Token（二选一） |
| AIRIOT_USERNAME | 条件 | 用户名（二选一） |
| AIRIOT_PASSWORD | 条件 | 密码（与用户名配套） |

## 编译和运行

### 开发模式
```bash
npm run dev
```
自动监听文件变化并重新编译。

### 构建
```bash
npm run build
```
生成 `dist/` 目录。

### 运行
```bash
npm start
```
运行编译后的服务器。

## 调试

服务器会将调试信息输出到 stderr：
```bash
node dist/index.js 2> debug.log
```

查看日志：
```bash
tail -f debug.log
```

## 性能优化

1. **连接复用**: Axios 实例会自动复用 HTTP 连接
2. **请求拦截**: 统一处理认证和错误
3. **分页查询**: 大数据量使用 limit/skip 参数
4. **并发控制**: 合理控制并发请求数量

## 安全考虑

1. **Token 保护**: Token 存储在内存中，不会写入日志
2. **输入验证**: 所有工具参数都进行类型检查
3. **错误信息**: 敏感信息不会暴露在错误消息中
4. **HTTPS**: 生产环境建议使用 HTTPS 连接
