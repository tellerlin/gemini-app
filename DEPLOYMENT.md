# Gemini Chat App - 部署指南

## CORS问题解决方案

### 问题说明
前端应用直接调用Google Gemini API会遇到CORS（跨源资源共享）问题，浏览器会阻止这些请求。

### 解决方案

#### 1. 本地开发
本地开发时使用Vite代理，已在`vite.config.ts`中配置：

```typescript
proxy: {
  '/api/gemini': {
    target: 'https://generativelanguage.googleapis.com',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api\/gemini/, ''),
  }
}
```

#### 2. Cloudflare Pages部署

##### 步骤1：创建Cloudflare Worker

1. 登录Cloudflare控制台
2. 进入 "Workers & Pages" 
3. 点击 "Create Application" > "Create Worker"
4. 将以下代码复制到Worker编辑器：

```javascript
// Cloudflare Worker - 代理Gemini API请求
export default {
  async fetch(request, env, ctx) {
    // 处理CORS预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // 只允许POST请求
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      // 获取请求体
      const body = await request.text();
      const url = new URL(request.url);
      
      // 构建Gemini API URL
      const geminiPath = url.pathname.replace('/api/gemini', '');
      const geminiUrl = `https://generativelanguage.googleapis.com${geminiPath}${url.search}`;

      // 转发请求到Gemini API
      const geminiResponse = await fetch(geminiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': request.headers.get('x-goog-api-key') || request.headers.get('Authorization')?.replace('Bearer ', '') || '',
        },
        body: body
      });

      const responseData = await geminiResponse.text();

      // 返回响应，添加CORS头
      return new Response(responseData, {
        status: geminiResponse.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-goog-api-key',
        }
      });

    } catch (error) {
      return new Response(JSON.stringify({ error: 'Proxy error: ' + error.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  }
};
```

5. 点击 "Save and Deploy"
6. 记录Worker的URL，格式为：`https://your-worker-name.your-subdomain.workers.dev`

##### 步骤2：配置路由

**方法A：使用Worker路由（推荐）**

1. 在Cloudflare控制台中，进入你的域名设置
2. 点击 "Workers Routes"
3. 添加路由：
   - Route: `your-domain.com/api/gemini/*`
   - Worker: 选择上面创建的Worker

**方法B：使用环境变量**

在你的构建设置中添加环境变量：
```
VITE_GEMINI_PROXY_URL=https://your-worker-name.your-subdomain.workers.dev
```

##### 步骤3：部署前端应用

1. 连接你的GitHub仓库到Cloudflare Pages
2. 设置构建命令：`npm run build`
3. 设置输出目录：`dist`
4. 部署应用

#### 3. 验证部署

部署完成后，检查：

1. **控制台日志**：应该看到 `🌐 Using Gemini API proxy: https://your-domain.com/api/gemini`
2. **网络请求**：在开发者工具中确认API请求指向代理地址
3. **功能测试**：发送消息测试AI回复功能

#### 4. 故障排除

**常见问题：**

1. **Worker 500错误**：检查Worker代码和日志
2. **仍有CORS错误**：确认Worker路由配置正确
3. **API密钥错误**：检查密钥传递是否正确

**调试步骤：**

1. 查看Cloudflare Worker日志
2. 检查浏览器网络请求
3. 确认API密钥格式正确

### Cloudflare Insights问题

如果看到Cloudflare Insights的CORS错误，这些是正常的警告，不影响应用功能。已在`index.html`中添加CSP头来减少这些警告。

要完全禁用Cloudflare Insights：
1. 进入Cloudflare控制台
2. 导航到 "Analytics" > "Web Analytics"  
3. 禁用 "Cloudflare Web Analytics"

## 安全注意事项

1. **API密钥保护**：确保API密钥只在客户端使用，Worker不会记录密钥
2. **域名限制**：可以在Worker中添加域名白名单限制
3. **速率限制**：考虑在Worker中添加速率限制保护

## 监控和维护

1. 定期检查Worker使用情况和错误日志
2. 监控API配额使用情况  
3. 保持Worker代码更新