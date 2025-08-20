# Cloudflare Pages 部署配置

这个文档说明如何将 Gemini Chat Application 部署到 Cloudflare Pages。

## 快速部署

### 方法1: 一键部署按钮（推荐）

[![Deploy to Cloudflare Pages](https://deploy.cloud.run/button.svg)](https://dash.cloudflare.com/direct-upload)

1. 点击上方按钮
2. 登录你的 Cloudflare 账户
3. 上传项目的 `dist` 文件夹（需要先本地构建）

### 方法2: GitHub 集成部署

1. Fork 此项目到你的 GitHub 账户
2. 访问 [Cloudflare Pages](https://pages.cloudflare.com/)
3. 点击 "Create a project" → "Connect to Git"
4. 选择你的 GitHub 仓库
5. 配置构建设置：
   - **Framework preset**: None
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/`

### 方法3: 命令行部署

运行部署脚本：
```bash
./deploy-cloudflare.sh
```

或手动执行：
```bash
# 安装依赖和构建
npm install
npm run build

# 使用 Wrangler CLI 部署
npx wrangler pages deploy dist --project-name=gemini-app
```

## 环境变量配置

在 Cloudflare Pages 项目设置中添加以下环境变量：

### 必需的环境变量
- `VITE_GEMINI_API_KEYS`: Google Gemini API 密钥（多个用逗号分隔）

### 可选的环境变量
- `VITE_PROXY_URL`: 代理服务器地址（如果需要）
- `NODE_ENV`: 设置为 `production`

## 项目配置文件

### wrangler.toml
```toml
name = "gemini-app"
compatibility_date = "2025-08-20"

[build]
command = "npm run build"
publish = "dist"

[[redirects]]
from = "/*"
to = "/index.html"
status = 200
```

### public/_redirects
```
/* /index.html 200
```

## 域名配置

### 自定义域名
1. 在 Cloudflare Pages 项目中点击 "Custom domains"
2. 添加你的域名
3. 按照说明配置 DNS 记录

### 免费域名
Cloudflare Pages 会自动提供一个 `*.pages.dev` 域名

## 构建优化

### 构建命令
```bash
npm run build
```

### 输出目录
```
dist/
```

### 构建配置
- Node.js 版本: 18+
- 包管理器: npm
- 构建工具: Vite 7.1.2

## 性能优化

### CDN 缓存
- 静态资源自动缓存到全球 CDN
- 支持 HTTP/2 和 HTTP/3
- 自动 Gzip/Brotli 压缩

### 边缘计算
- 全球 200+ 数据中心
- 毫秒级响应时间
- 自动故障转移

## 监控和分析

### 内置分析
- 页面访问统计
- 性能指标
- 错误监控

### Web Vitals
- Core Web Vitals 监控
- 用户体验指标
- 性能建议

## 故障排除

### 常见问题

1. **构建失败**
   - 检查 Node.js 版本（需要 18+）
   - 确认 package.json 配置正确
   - 查看构建日志错误信息

2. **环境变量未生效**
   - 确保变量名以 `VITE_` 开头
   - 重新部署项目
   - 检查变量值是否正确

3. **路由问题**
   - 确认 `_redirects` 文件存在
   - 检查 SPA 路由配置
   - 验证 `wrangler.toml` 重定向规则

4. **API 调用失败**
   - 检查 CORS 配置
   - 验证 API 密钥有效性
   - 查看浏览器控制台错误

### 调试方法

1. **本地测试**
   ```bash
   npm run preview
   ```

2. **构建分析**
   ```bash
   npm run build:analyze
   ```

3. **查看日志**
   - Cloudflare Dashboard → Pages → 项目 → Deployment → Logs

## 联系支持

如果遇到部署问题：
1. 查看 [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
2. 在项目 GitHub Issues 中报告问题
3. 联系 Cloudflare 支持团队