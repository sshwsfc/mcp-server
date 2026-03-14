# CLI 命令测试

本目录包含 AIRIOT CLI 的所有测试文件。

## 测试结构

```
cli/
├── tests/
│   ├── utils.ts          # 测试工具函数和 mock 数据
│   └── README.md         # 本文件
├── commands/
│   ├── warning.test.ts   # 报警规则和报警管理测试
│   ├── tables.test.ts    # 表管理测试
│   ├── records.test.ts   # 表记录管理测试
│   ├── tags.test.ts      # 属性点查询测试
│   ├── data.test.ts      # 时序数据查询测试
│   ├── stats.test.ts     # 统计功能测试
│   ├── files.test.ts     # 文件管理测试
│   ├── control.test.ts   # 设备控制测试
│   ├── reports.test.ts   # 报表管理测试
│   └── users.test.ts     # 用户管理测试
├── utils.test.ts         # 工具函数测试
└── config.test.ts        # 配置管理测试
```

## 运行测试

```bash
# 运行所有测试
npm test

# 运行测试并监听文件变化
npm run test -- --watch

# 运行测试并生成覆盖率报告
npm run test:coverage

# 运行测试一次（不监听）
npm run test:run
```

## 测试覆盖范围

### 报警管理 (warning.test.ts)
- ✅ 报警规则列表查询
- ✅ 单个报警规则获取
- ✅ 报警规则创建
- ✅ 报警规则更新
- ✅ 报警规则删除
- ✅ 报警列表查询
- ✅ 单个报警获取
- ✅ 报警确认
- ✅ 报警解决
- ✅ 报警统计
- ✅ 最新报警获取
- ✅ 批量确认报警

### 表管理 (tables.test.ts)
- ✅ 表列表查询
- ✅ 单个表获取
- ✅ 表创建（从文件）
- ✅ 表更新
- ✅ 表删除

### 表记录管理 (records.test.ts)
- ✅ 记录列表查询
- ✅ 单条记录获取
- ✅ 记录创建（从文件/JSON）
- ✅ 记录更新
- ✅ 记录删除（含级联删除附件）
- ✅ 批量删除记录

### 属性点查询 (tags.test.ts)
- ✅ 表属性点列表
- ✅ 记录属性点数据

### 时序数据查询 (data.test.ts)
- ✅ 最新数据查询
- ✅ 历史数据查询
- ✅ 支持从文件/JSON 读取设备-属性点对

### 统计功能 (stats.test.ts)
- ✅ 设备在线状态统计

### 文件管理 (files.test.ts)
- ✅ 文件上传
- ✅ 文件信息获取
- ✅ 文件删除

### 设备控制 (control.test.ts)
- ✅ 单个控制命令发送
- ✅ 批量控制命令发送
- ✅ 支持从文件读取命令

### 报表管理 (reports.test.ts)
- ✅ 报表列表查询
- ✅ 单个报表获取
- ✅ 报表执行
- ✅ 报表创建（从文件）
- ✅ 报表更新
- ✅ 报表删除

### 用户管理 (users.test.ts)
- ✅ 当前用户信息获取
- ✅ 用户列表查询

### 工具函数 (utils.test.ts)
- ✅ API 客户端获取
- ✅ 命令执行包装
- ✅ 选项标准化（数字、布尔、JSON）

### 配置管理 (config.test.ts)
- ✅ 配置读取（支持项目级和全局配置）
- ✅ 配置写入
- ✅ 配置清除
- ✅ API 配置获取

## Mock 策略

所有测试都使用 Vitest 的 mock 功能来模拟外部依赖：
- `getApiClient()` 和 `executeCommand()` 被 mock 以避免真实的 API 调用
- `formatOutput()`、`formatSuccess()`、`formatError()` 被 mock 以简化输出验证
- 文件系统操作 (`fs.promises`) 被 mock 以避免真实文件操作

## 测试数据

测试使用的 mock 数据定义在 `tests/utils.ts` 中，包括：
- 模拟的 API 客户端
- 模拟的配置
- 模拟的控制台输出
- 各类实体的样本数据（报警、表、记录、用户等）

## 添加新测试

当添加新的 CLI 命令时，请按以下步骤添加测试：

1. 在 `src/cli/commands/` 目录下创建 `命令名.test.ts` 文件
2. 模拟依赖（utils、formatter）
3. 编写测试用例覆盖所有功能
4. 确保测试命名清晰、描述准确
5. 在本文件中更新测试覆盖范围
