import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

/**
 * CLI 配置文件路径
 */
const CONFIG_DIR = path.join(os.homedir(), '.airiot');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

/**
 * 项目级配置文件路径（当前目录）
 */
const PROJECT_CONFIG_FILE = path.join(process.cwd(), '.airiotrc.json');

/**
 * CLI 配置接口
 */
export interface CliConfig {
  baseUrl: string;
  projectId: string;
  token?: string;
  username?: string;
  password?: string;
  // 输出格式
  output?: 'json' | 'table' | 'plain';
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: Partial<CliConfig> = {
  output: 'table',
};

/**
 * 确保配置目录存在
 */
async function ensureConfigDir(): Promise<void> {
  try {
    await fs.mkdir(CONFIG_DIR, { recursive: true });
  } catch (error) {
    // 忽略已存在的错误
  }
}

/**
 * 读取配置文件
 * 优先级：项目级配置 (.airiotrc.json) > 全局配置 (~/.airiot/config.json)
 */
export async function readConfig(): Promise<CliConfig | null> {
  let globalConfig: Partial<CliConfig> = {};
  let projectConfig: Partial<CliConfig> = {};

  // 尝试读取全局配置
  try {
    const content = await fs.readFile(CONFIG_FILE, 'utf-8');
    globalConfig = JSON.parse(content);
  } catch (error) {
    // 忽略文件不存在或读取错误
  }

  // 尝试读取项目级配置
  try {
    const content = await fs.readFile(PROJECT_CONFIG_FILE, 'utf-8');
    projectConfig = JSON.parse(content);
  } catch (error) {
    // 忽略文件不存在或读取错误
  }

  // 合并配置（项目级配置覆盖全局配置）
  const merged = { ...DEFAULT_CONFIG, ...globalConfig, ...projectConfig };

  // 如果没有任何有效配置，返回 null
  if (!merged.baseUrl || !merged.projectId) {
    return null;
  }

  return merged as CliConfig;
}

/**
 * 写入配置文件
 */
export async function writeConfig(config: Partial<CliConfig>): Promise<void> {
  await ensureConfigDir();
  const existing = await readConfig();
  const merged = { ...existing, ...config };
  await fs.writeFile(CONFIG_FILE, JSON.stringify(merged, null, 2), 'utf-8');
}

/**
 * 清除配置
 */
export async function clearConfig(): Promise<void> {
  try {
    await fs.unlink(CONFIG_FILE);
  } catch (error) {
    // 忽略文件不存在的错误
  }
}

/**
 * 获取 API 配置（用于创建 API 客户端）
 */
export async function getApiConfig(): Promise<CliConfig | null> {
  const config = await readConfig();
  if (!config || !config.baseUrl || !config.projectId) {
    return null;
  }
  return config;
}
