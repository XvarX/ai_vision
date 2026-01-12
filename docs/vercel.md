# Vercel 部署指南

本指南介绍如何将 AI Vision 前端部署到 Vercel。

## 部署方式

### 方式 1：通过 Vercel CLI（推荐）

#### 1. 安装 Vercel CLI

```bash
npm install -g vercel
```

#### 2. 登录 Vercel

```bash
vercel login
```

#### 3. 部署

```bash
cd frontend

# 第一次部署（预览）
vercel

# 生产环境部署
vercel --prod
```

#### 4. 配置环境变量

在部署时或部署后，在 Vercel 控制台设置环境变量：

1. 访问 https://vercel.com/dashboard
2. 选择你的项目
3. 进入 Settings → Environment Variables
4. 添加以下变量：

```
名称: NEXT_PUBLIC_API_URL
值: https://your-backend.railway.app
环境: Production, Preview, Development
```

---

### 方式 2：通过 GitHub 集成（推荐用于自动部署）

#### 1. 连接 GitHub

1. 访问 https://vercel.com/new
2. 选择 "Import Git Repository"
3. 授权 Vercel 访问你的 GitHub
4. 选择 `ai_vision` 项目

#### 2. 配置项目

**Root Directory**: 设置为 `frontend`

**Framework Preset**: Next.js

**Environment Variables**:
```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

#### 3. 部署

点击 "Deploy" 按钮。

以后每次 push 到 main 分支，Vercel 会自动部署。

---

## 配置文件说明

### vercel.json

```json
{
  "version": 2,
  "name": "ai-vision-frontend",
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/"
    }
  ],
  "env": {
    "NEXT_PUBLIC_API_URL": "@backend-api-url"
  },
  "build": {
    "env": {
      "NEXT_PUBLIC_API_URL": "@backend-api-url"
    }
  },
  "regions": ["hkg1", "sin1"]
}
```

**配置说明**：
- `regions`: 部署到香港和新加坡区域（亚洲用户访问更快）
- `routes`: 所有路由重定向到 index.html（Next.js 处理）
- `env`: 引用 Vercel 环境变量 `@backend-api-url`

---

## 环境变量配置

### 在 Vercel 控制台配置

1. 进入项目设置
2. 选择 "Environment Variables"
3. 添加以下变量：

| 变量名 | 值 | 环境 |
|--------|-----|------|
| `NEXT_PUBLIC_API_URL` | 你的后端 API 地址 | Production, Preview, Development |

**后端 API 地址示例**：
- Railway: `https://your-backend.railway.app`
- Render: `https://your-backend.onrender.com`
- 自建: `https://api.yourdomain.com`

---

## 自定义域名

### 1. 在 Vercel 添加域名

1. 进入项目设置 → Domains
2. 添加域名：`www.yourdomain.com`
3. Vercel 会显示 DNS 配置

### 2. 配置 DNS

在你的域名服务商（阿里云/GoDaddy/Cloudflare）添加：

```
类型: CNAME
名称: www
值: cname.vercel-dns.com
```

### 3. 验证

等待 DNS 生效（通常 5-30 分钟），访问 `https://www.yourdomain.com`

---

## 部署命令

```bash
# 本地开发
vercel dev

# 部署到预览环境
vercel

# 部署到生产环境
vercel --prod

# 查看部署列表
vercel list

# 查看项目信息
vercel inspect

# 删除某个部署
vercel rm <deployment-url>
```

---

## 性能优化

Vercel 自动优化：
- ✅ 自动 CDN 分发（Edge Network）
- ✅ 自动 HTTPS
- ✅ 自动压缩（Gzip/Brotli）
- ✅ 图片优化（Next.js Image）
- ✅ 静态资源缓存

### 自定义缓存

```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 's-maxage=60, stale-while-revalidate'
          }
        ]
      }
    ];
  }
};
```

---

## 监控和日志

### 查看日志

```bash
# 查看最近的部署日志
vercel logs

# 实时查看日志
vercel logs --follow
```

### 在控制台查看

1. 访问 Vercel Dashboard
2. 选择项目
3. 点击 "Deployments"
4. 选择某个部署，查看：
   - Build Logs
   - Function Logs
   - Deployment Logs

---

## 故障排查

### 构建失败

**检查 package.json**：
```json
{
  "scripts": {
    "build": "next build"  // 确保有这个命令
  }
}
```

**查看构建日志**：
```bash
vercel logs <deployment-url>
```

### 环境变量未生效

**确保以 `NEXT_PUBLIC_` 开头**：
```
NEXT_PUBLIC_API_URL  ✅ 会被暴露到浏览器
API_URL             ❌ 不会暴露，仅在服务端可用
```

### API 请求失败

**检查 CORS 配置**（后端）：
```python
# backend/app/main.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://yourdomain.vercel.app",
        "https://www.yourdomain.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 成本

| 计划 | 价格 | 限制 |
|------|------|------|
| **Hobby** | 免费 | 100GB 带宽/月，100 次构建/月 |
| **Pro** | $20/月 | 1TB 带宽/月，无限构建 |
| **Enterprise** | 联系 | 定制化 |

大部分个人项目免费计划足够。

---

## 最佳实践

1. **使用 Preview 部署**
   - 每次 PR 都会生成预览链接
   - 合并前可以预览和测试

2. **配置多个环境**
   - Production: `www.yourdomain.com`
   - Staging: `staging.yourdomain.com`

3. **启用 Analytics**
   - Vercel Analytics 提供访问统计

4. **保护敏感信息**
   - 不要在前端代码中硬编码密钥
   - 所有敏感信息通过环境变量传递

5. **监控性能**
   - 使用 Vercel Speed Insights
   - 优化 Core Web Vitals

---

## 更新部署

### 自动更新（推荐）

连接 GitHub 后，每次 push 到 main 分支自动部署。

### 手动更新

```bash
# 修改代码后
git add .
git commit -m "Update frontend"
git push

# 或手动触发部署
vercel --prod
```

---

## 与后端集成示例

### 后端在 Railway

```bash
# 前端环境变量
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

### 后端在 Render

```bash
# 前端环境变量
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

### 后端自建（K8s + Nginx）

```bash
# 前端环境变量
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

---

## 支持

- [Vercel 文档](https://vercel.com/docs)
- [Next.js 部署文档](https://nextjs.org/docs/deployment)
- [Vercel 社区](https://github.com/vercel/vercel/discussions)
