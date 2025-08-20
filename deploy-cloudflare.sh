#!/bin/bash

# Cloudflare Pages 部署脚本
# 使用 Wrangler CLI 部署到 Cloudflare Pages

set -e

echo "🚀 开始部署到 Cloudflare Pages..."

# 检查是否安装了 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 请先安装 Node.js 18 或更高版本"
    exit 1
fi

# 检查是否安装了 npm
if ! command -v npm &> /dev/null; then
    echo "❌ 错误: 请先安装 npm"
    exit 1
fi

# 安装依赖
echo "📦 安装项目依赖..."
npm install

# 运行构建
echo "🔨 构建项目..."
npm run build

# 检查 wrangler 是否已安装
if ! command -v wrangler &> /dev/null; then
    echo "📥 安装 Wrangler CLI..."
    npm install -g wrangler
fi

# 检查是否已登录 Cloudflare
echo "🔐 检查 Cloudflare 登录状态..."
if ! wrangler whoami &> /dev/null; then
    echo "请登录 Cloudflare 账户："
    wrangler login
fi

# 部署到 Cloudflare Pages
echo "🚀 部署到 Cloudflare Pages..."
wrangler pages deploy dist --project-name=gemini-app --compatibility-date=2025-08-20

echo "✅ 部署完成！"
echo "📱 你的应用已部署到 Cloudflare Pages"
echo "🌐 可通过 Cloudflare Dashboard 查看部署状态和域名"