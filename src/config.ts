import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { AiriotConfig } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 配置文件格式
 */
export interface AiriotRcConfig {
  baseUrl?: string;
  projectId?: string;
  token?: string;
  username?: string;
  password?: string;
  timeout?: number;
  // 扩展配置
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  retries?: number;
}

/**
 * 查找配置文件
 * 从当前目录向上递归查找，直到找到配置文件或到达根目录
 */
async function findConfigFile(startDir: string = process.cwd()): Promise<string | null> {
  const configFileName = '.airiotrc.json';
  let currentDir = startDir;

  while (currentDir !== path.parse(currentDir).root) {
    const configPath = path.join(currentDir, configFileName);

    try {
      await fs.access(configPath);
      return configPath;
    } catch {
      // 文件不存在，继续向上查找
      currentDir = path.dirname(currentDir);
    }
  }

  // 检查根目录
  const rootConfigPath = path.join(path.parse(currentDir).root, configFileName);
  try {
    await fs.access(rootConfigPath);
    return rootConfigPath;
  } catch {
    return null;
  }
}

/**
 * 读取配置文件
 */
async function readConfigFile(configPath: string): Promise<AiriotRcConfig> {
  try {
    const content = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(content);
  } catch (error: any) {
    throw new Error(`Failed to read config file ${configPath}: ${error.message}`);
  }
}

/**
 * 加载配置
 * 优先级: 环境变量 > 配置文件
 */
export async function loadConfig(): Promise<AiriotConfig & { logLevel?: string; retries?: number }> {
  const config: AiriotConfig & { logLevel?: string; retries?: number } = {
    baseUrl: '',
    projectId: '',
  };

  // 1. 尝试从配置文件读取
  const configFilePath = await findConfigFile();
  if (configFilePath) {
    try {
      const rcConfig = await readConfigFile(configFilePath);

      config.baseUrl = rcConfig.baseUrl || '';
      config.projectId = rcConfig.projectId || '';
      config.token = rcConfig.token;
      config.username = rcConfig.username;
      config.password = rcConfig.password;
      config.logLevel = rcConfig.logLevel;
      config.retries = rcConfig.retries;

      console.error(`Loaded config from: ${configFilePath}`);
    } catch (error: any) {
      console.error(`Warning: Failed to load config file: ${error.message}`);
    }
  }

  // 2. 环境变量覆盖配置文件
  if (process.env.AIRIOT_BASE_URL) {
    config.baseUrl = process.env.AIRIOT_BASE_URL;
  }
  if (process.env.AIRIOT_PROJECT_ID) {
    config.projectId = process.env.AIRIOT_PROJECT_ID;
  }
  if (process.env.AIRIOT_TOKEN) {
    config.token = process.env.AIRIOT_TOKEN;
  }
  if (process.env.AIRIOT_USERNAME) {
    config.username = process.env.AIRIOT_USERNAME;
  }
  if (process.env.AIRIOT_PASSWORD) {
    config.password = process.env.AIRIOT_PASSWORD;
  }
  if (process.env.AIRIOT_LOG_LEVEL) {
    config.logLevel = process.env.AIRIOT_LOG_LEVEL;
  }
  if (process.env.AIRIOT_RETRIES) {
    config.retries = parseInt(process.env.AIRIOT_RETRIES, 10);
  }

  return config;
}

/**
 * 验证配置
 */
export function validateConfig(config: Partial<AiriotConfig>): void {
  if (!config.baseUrl) {
    throw new Error('配置错误: baseUrl 未设置。请设置 AIRIOT_BASE_URL 环境变量或在 .airiotrc.json 中配置');
  }

  if (!config.projectId) {
    throw new Error('配置错误: projectId 未设置。请设置 AIRIOT_PROJECT_ID 环境变量或在 .airiotrc.json 中配置');
  }

  if (!config.token && !(config.username && config.password)) {
    throw new Error('配置错误: 未设置认证信息。请设置 AIRIOT_TOKEN 或 (AIRIOT_USERNAME + AIRIOT_PASSWORD) 环境变量，或在 .airiotrc.json 中配置');
  }
}

/**
 * 创建示例配置文件
 */
export async function createExampleConfig(targetDir: string = process.cwd()): Promise<void> {
  const exampleConfig: AiriotRcConfig = {
    baseUrl: 'https://your-airiot-server.com',
    projectId: 'your-project-id',
    token: 'your-token-here',
    // 或者使用用户名密码登录
    // username: 'your-username',
    // password: 'your-password',
    timeout: 30000,
    logLevel: 'info',
    retries: 3,
  };

  const configPath = path.join(targetDir, '.airiotrc.json.example');

  try {
    await fs.writeFile(
      configPath,
      JSON.stringify(exampleConfig, null, 2),
      'utf-8'
    );
    console.error(`Example config created at: ${configPath}`);
    console.error('Rename it to .airiotrc.json and update with your values.');
  } catch (error: any) {
    throw new Error(`Failed to create example config: ${error.message}`);
  }
}
