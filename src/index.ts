#!/usr/bin/env node

import dotenv from 'dotenv';
dotenv.config();

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { AiriotApiClient } from './airiot-api.js';
import { airiotTools, executeTool } from './tools/index.js';
import type { AiriotConfig } from './types.js';

/**
 * AIRIOT MCP Server
 *
 * 提供对AIRIOT IoT平台数据表、记录、属性点和时序数据的访问
 */

class AiriotMcpServer {
  private server: Server;
  private apiClient: AiriotApiClient;

  constructor(config: AiriotConfig) {
    // 初始化API客户端
    this.apiClient = new AiriotApiClient(config);

    // 如果提供了用户名密码，自动登录
    if (config.username && config.password) {
      this.apiClient.login(config.username, config.password).catch((err) => {
        console.error('登录失败:', err.message);
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
    // 列出可用工具
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: airiotTools,
      };
    });

    // 执行工具调用
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        const result = await executeTool(name, args || {}, this.apiClient);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  error: error.message || '执行失败',
                  details: error.response?.data || error.stack,
                },
                null,
                2
              ),
            },
          ],
          isError: true,
        };
      }
    });
  }

  /**
   * 启动服务器
   */
  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    console.error('AIRIOT MCP Server running');
  }
}

/**
 * 主函数
 */
async function main() {
  // 从环境变量读取配置
  const config: AiriotConfig = {
    baseUrl: process.env.AIRIOT_BASE_URL || '',
    projectId: process.env.AIRIOT_PROJECT_ID || '',
    token: process.env.AIRIOT_TOKEN,
    username: process.env.AIRIOT_USERNAME,
    password: process.env.AIRIOT_PASSWORD,
  };

  // 验证必要配置
  if (!config.baseUrl) {
    throw new Error('环境变量 AIRIOT_BASE_URL 未设置');
  }
  if (!config.projectId) {
    throw new Error('环境变量 AIRIOT_PROJECT_ID 未设置');
  }
  if (!config.token && !(config.username && config.password)) {
    throw new Error('必须设置 AIRIOT_TOKEN 或 (AIRIOT_USERNAME + AIRIOT_PASSWORD)');
  }

  // 启动服务器
  const server = new AiriotMcpServer(config);
  await server.start();
}

// 启动服务器
main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
