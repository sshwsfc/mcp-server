#!/usr/bin/env node

import dotenv from 'dotenv';
dotenv.config();

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { AiriotApiClient } from './airiot-api.js';
import { airiotTools, executeTool } from './tools/index.js';
import { listResources, readResource } from './resources/index.js';
import { airiotPrompts, getPromptMessage } from './prompts/index.js';
import { loadConfig, validateConfig } from './config.js';
import { initLogger, logger } from './logger.js';
import { ErrorHandler } from './errors.js';
import type { AiriotConfig } from './types.js';

/**
 * AIRIOT MCP Server
 *
 * 提供对AIRIOT IoT平台数据表、记录、属性点和时序数据的访问
 */

class AiriotMcpServer {
  private server: Server;
  private apiClient: AiriotApiClient;

  constructor(config: AiriotConfig & { logLevel?: string }) {
    // 初始化日志系统
    if (config.logLevel) {
      initLogger(config.logLevel as any);
    } else {
      initLogger();
    }

    logger.info('Initializing AIRIOT MCP Server', { baseUrl: config.baseUrl, projectId: config.projectId });

    // 初始化API客户端
    this.apiClient = new AiriotApiClient(config);

    // 如果提供了用户名密码，自动登录
    if (config.username && config.password) {
      this.apiClient.login(config.username, config.password).catch((err) => {
        logger.error('登录失败', err.message);
      });
    }

    // 创建MCP Server
    this.server = new Server(
      {
        name: 'airiot-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
          prompts: {},
        },
      }
    );

    // 注册处理器
    this.setupHandlers();
  }

  /**
   * 设置MCP协议处理器
   */
  private setupHandlers(): void {
    // ==================== Resources 处理器 ====================
    // 列出可用资源
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: listResources(),
      };
    });

    // 读取资源内容
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      try {
        const content = await readResource(uri, this.apiClient);

        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: content,
            },
          ],
        };
      } catch (error: any) {
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(
                {
                  error: error.message || '读取资源失败',
                },
                null,
                2
              ),
            },
          ],
        };
      }
    });

    // ==================== Prompts 处理器 ====================
    // 列出可用提示词
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
      return {
        prompts: airiotPrompts,
      };
    });

    // 获取提示词内容
    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      const message = getPromptMessage(name, args);

      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: message,
            },
          },
        ],
      };
    });

    // ==================== Tools 处理器 ====================
    // 列出可用工具
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: airiotTools,
      };
    });

    // 执行工具调用
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      logger.debug('Tool called', { name, args });

      try {
        const result = await executeTool(name, args || {}, this.apiClient);

        logger.debug('Tool result', { name, success: true });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        logger.error('Tool execution failed', { name, error: error instanceof Error ? error.message : String(error) });
        return ErrorHandler.toMcpResponse(error);
      }
    });
  }

  /**
   * 启动服务器
   */
  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    logger.info('AIRIOT MCP Server running successfully');
  }
}

/**
 * 主函数
 */
async function main() {
  // 加载配置（支持配置文件和环境变量）
  const config = await loadConfig();

  // 验证必要配置
  validateConfig(config);

  // 启动服务器
  const server = new AiriotMcpServer(config);
  await server.start();
}

// 启动服务器
main().catch((err) => {
  logger.error('Fatal error during startup', err);
  process.exit(1);
});
