#!/bin/bash

echo "========================================="
echo "AIRIOT MCP Server 安装脚本"
echo "========================================="
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到 Node.js"
    echo "请先安装 Node.js: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js 版本: $(node --version)"
echo "✅ npm 版本: $(npm --version)"
echo ""

# 安装依赖
echo "📦 安装依赖包..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败"
    exit 1
fi

echo ""
echo "✅ 依赖安装完成"
echo ""

# 构建项目
echo "🔨 构建项目..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 构建失败"
    exit 1
fi

echo ""
echo "✅ 构建完成"
echo ""

# 创建 .env 文件
if [ ! -f .env ]; then
    echo "📝 创建 .env 配置文件..."
    cp .env.example .env
    echo "✅ 已创建 .env 文件"
    echo ""
    echo "⚠️  请编辑 .env 文件，填入您的 AIRIOT 服务器配置"
    echo ""
    echo "需要配置的参数："
    echo "  - AIRIOT_BASE_URL: AIRIOT 服务器地址"
    echo "  - AIRIOT_PROJECT_ID: 项目ID"
    echo "  - AIRIOT_TOKEN: API Token (或使用用户名密码)"
    echo ""
else
    echo "⚠️  .env 文件已存在，跳过创建"
fi

echo ""
echo "========================================="
echo "✅ 安装完成！"
echo "========================================="
echo ""
echo "下一步操作："
echo "1. 编辑 .env 文件，填入配置"
echo "2. 运行测试: npm start"
echo "3. 在 Claude Desktop 中配置 MCP 服务器"
echo ""
echo "详细使用说明请查看 README.md 和 EXAMPLES.md"
echo ""
