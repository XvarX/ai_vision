# Docker 单独部署指南

本指南介绍如何单独部署后端 Docker 容器（适用于 Vercel 前端 + Docker 后端的场景）。

## 场景

- 前端部署在 Vercel
- 后端单独运行 Docker 容器（在自己的服务器或云平台）

## 快速开始

### 方式 1：使用 Docker Run

#### 1. 构建镜像

```bash
cd backend
docker build -t ai-vision-backend:latest .
```

#### 2. 运行容器

```bash
docker run -d \
  --name ai-vision-backend \
  -p 8000:8000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  -e SECRET_KEY="your-secret-key" \
  -v ai-vision-db:/app/data \
  ai-vision-backend:latest
```

#### 3. 查看日志

```bash
docker logs -f ai-vision-backend
```

---

### 方式 2：使用 Docker Compose（推荐）

#### 1. 创建 docker-compose.standalone.yml

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    container_name: ai_vision_backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - SECRET_KEY=${SECRET_KEY}
      - ALGORITHM=HS256
      - ACCESS_TOKEN_EXPIRE_MINUTES=10080
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/docs"]
      interval: 30s
      timeout: 10s
      retries: 3
```

#### 2. 创建 .env 文件

```env
DATABASE_URL=postgresql://aivision:password@localhost:5432/aivision
SECRET_KEY=your-very-secure-secret-key
```

#### 3. 启动

```bash
docker-compose -f docker-compose.standalone.yml up -d
```

---

### 方式 3：部署到云平台

#### Docker Hub

```bash
# 1. 登录
docker login

# 2. 打标签
docker tag ai-vision-backend:latest yourusername/ai-vision-backend:latest

# 3. 推送
docker push yourusername/ai-vision-backend:latest

# 4. 在任何地方拉取运行
docker run -d -p 8000:8000 yourusername/ai-vision-backend:latest
```

#### 阿里云容器镜像服务

```bash
# 1. 登录阿里云镜像仓库
docker login --username=yourusername registry.cn-hangzhou.aliyuncs.com

# 2. 打标签
docker tag ai-vision-backend:latest registry.cn-hangzhou.aliyuncs.com/yournamespace/ai-vision-backend:latest

# 3. 推送
docker push registry.cn-hangzhou.aliyuncs.com/yournamespace/ai-vision-backend:latest

# 4. 拉取运行
docker run -d -p 8000:8000 registry.cn-hangzhou.aliyuncs.com/yournamespace/ai-vision-backend:latest
```

---

## 配置说明

### 环境变量

| 变量名 | 说明 | 示例 | 必填 |
|--------|------|------|------|
| `DATABASE_URL` | 数据库连接字符串 | `postgresql://user:pass@host:5432/db` | ✅ |
| `SECRET_KEY` | JWT 密钥 | `your-secret-key` | ✅ |
| `ALGORITHM` | JWT 算法 | `HS256` | 否 |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token 过期时间（分钟） | `10080` | 否 |

### 数据库配置

#### 使用 PostgreSQL（推荐）

```bash
# 使用云数据库（推荐）
DATABASE_URL=postgresql://user:pass@your-db.railway.app:5432/db

# 或使用自己的 PostgreSQL
DATABASE_URL=postgresql://user:pass@localhost:5432/aivision
```

#### 使用 SQLite（不推荐生产环境）

```bash
DATABASE_URL=sqlite:///./data/ai_vision.db

# 需要挂载卷
docker run -v ai-vision-data:/app/data ...
```

---

## 网络配置

### 场景 1：本地开发

```bash
# 前端访问 http://localhost:8000
docker run -p 8000:8000 ai-vision-backend:latest
```

### 场景 2：Vercel 前端 + Docker 后端

```bash
# 1. 后端需要公网 IP 或域名
# 假设你的服务器 IP 是 1.2.3.4

# 2. 启动容器
docker run -d -p 8000:8000 ai-vision-backend:latest

# 3. 配置 Nginx 反向代理（可选）
# 将 api.yourdomain.com 指向 1.2.3.4:8000

# 4. Vercel 前端配置
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### 场景 3：内网穿透（开发测试）

#### 使用 Ngrok

```bash
# 1. 安装 ngrok
# https://ngrok.com

# 2. 启动后端
docker run -p 8000:8000 ai-vision-backend:latest

# 3. 启动 ngrok
ngrok http 8000

# 4. 获得 https://xxxx.ngrok.io
# 配置前端: NEXT_PUBLIC_API_URL=https://xxxx.ngrok.io
```

#### 使用 Cloudflare Tunnel

```bash
# 1. 安装 cloudflared
# https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/

# 2. 创建隧道
cloudflared tunnel --url http://localhost:8000

# 3. 获得 https://xxx.trycloudflare.com
```

---

## 使用 Nginx 反向代理

如果需要域名和 HTTPS：

### 1. 安装 Nginx

```bash
sudo apt update
sudo apt install nginx
```

### 2. 配置 Nginx

```nginx
# /etc/nginx/sites-available/ai-vision-api

server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # 超时配置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

### 3. 启用配置

```bash
sudo ln -s /etc/nginx/sites-available/ai-vision-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. 配置 HTTPS（使用 Let's Encrypt）

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

---

## 容器管理

### 查看日志

```bash
# 查看所有日志
docker logs ai-vision-backend

# 实时查看
docker logs -f ai-vision-backend

# 查看最近 100 行
docker logs --tail 100 ai-vision-backend
```

### 进入容器

```bash
docker exec -it ai-vision-backend bash
```

### 停止和启动

```bash
# 停止
docker stop ai-vision-backend

# 启动
docker start ai-vision-backend

# 重启
docker restart ai-vision-backend

# 删除
docker rm ai-vision-backend
```

### 更新容器

```bash
# 1. 停止并删除旧容器
docker stop ai-vision-backend
docker rm ai-vision-backend

# 2. 构建新镜像
docker build -t ai-vision-backend:latest ./backend

# 3. 启动新容器
docker run -d --name ai-vision-backend -p 8000:8000 ai-vision-backend:latest
```

---

## 自动重启

### Docker 自动重启策略

```bash
# 容器挂了自动重启
docker run -d --restart on-failure ai-vision-backend:latest

# 总是重启（包括开机自启）
docker run -d --restart unless-stopped ai-vision-backend:latest
```

### 使用 Systemd（推荐生产环境）

创建 `/etc/systemd/system/ai-vision-backend.service`：

```ini
[Unit]
Description=AI Vision Backend Container
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/path/to/project
ExecStart=/usr/bin/docker-compose -f docker-compose.standalone.yml up -d
ExecStop=/usr/bin/docker-compose -f docker-compose.standalone.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

启动服务：

```bash
sudo systemctl enable ai-vision-backend
sudo systemctl start ai-vision-backend
sudo systemctl status ai-vision-backend
```

---

## 监控和健康检查

### 查看容器状态

```bash
docker ps
docker stats ai-vision-backend
```

### 健康检查端点

```bash
# 检查健康状态
curl http://localhost:8000/docs

# 或自定义的健康检查
curl http://localhost:8000/health
```

---

## 性能优化

### 资源限制

```bash
docker run -d \
  --name ai-vision-backend \
  --memory="512m" \
  --cpus="0.5" \
  -p 8000:8000 \
  ai-vision-backend:latest
```

### 使用多阶段构建优化镜像大小

已经在 `backend/Dockerfile` 中配置，构建的镜像约 200-300MB。

---

## 安全建议

1. **不要在镜像中硬编码密钥**
   - 使用环境变量或 Docker Secrets

2. **使用非 root 用户**
   - Dockerfile 中已配置

3. **定期更新镜像**
   ```bash
   docker pull yourusername/ai-vision-backend:latest
   ```

4. **扫描漏洞**
   ```bash
   docker scout cves ai-vision-backend:latest
   ```

5. **使用私有镜像仓库**
   - Docker Hub Private
   - 阿里云容器镜像服务
   - GitLab Container Registry

---

## 故障排查

### 容器无法启动

```bash
# 查看日志
docker logs ai-vision-backend

# 检查端口占用
sudo lsof -i :8000

# 检查环境变量
docker inspect ai-vision-backend | grep -A 10 Env
```

### 数据库连接失败

```bash
# 测试数据库连接
docker exec -it ai-vision-backend bash
ping db-host
telnet db-host 5432
```

### 内存不足

```bash
# 查看资源使用
docker stats

# 增加内存限制
docker run --memory="1g" ...
```

---

## 成本估算

### 自己的服务器

| 配置 | 价格 | 适用规模 |
|------|------|---------|
| 1核 1GB | ~¥50/月 | 100-500 日活 |
| 2核 4GB | ~¥150/月 | 500-2000 日活 |
| 4核 8GB | ~¥300/月 | 2000-5000 日活 |

### 云平台（阿里云/腾讯云）

- 容器服务：~¥100-500/月
- 负载均衡：~¥50/月
- 公网带宽：按流量或固定带宽

---

## 与 Vercel 前端集成

### 完整流程

1. **部署后端 Docker**
   ```bash
   docker run -d -p 8000:8000 ai-vision-backend:latest
   ```

2. **配置域名和 HTTPS**
   - 使用 Nginx 反向代理
   - 配置 Let's Encrypt 证书

3. **配置 Vercel 前端**
   ```bash
   # 在 Vercel 控制台设置环境变量
   NEXT_PUBLIC_API_URL=https://api.yourdomain.com
   ```

4. **测试连接**
   ```bash
   # 在前端
   curl https://api.yourdomain.com/api/novels
   ```

---

## 常见问题

### Q: 如何让后端支持跨域？

A: 在 `backend/app/main.py` 中已配置 CORS，修改允许的源：

```python
origins = [
    "https://yourdomain.vercel.app",
    "https://www.yourdomain.com"
]
```

### Q: 如何实现自动部署？

A: 使用 Webhook 或 CI/CD：

```yaml
# .github/workflows/deploy.yml
name: Deploy Backend
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build and push Docker image
        # ... 构建和推送镜像
      - name: Deploy to server
        # ... SSH 到服务器拉取镜像并重启容器
```

### Q: 如何备份数据？

A: 定期备份数据库：

```bash
# PostgreSQL 备份
pg_dump -U user dbname > backup.sql

# 或使用脚本
0 2 * * * /path/to/backup-script.sh
```

---

## 下一步

- [ ] 配置监控和告警（Prometheus + Grafana）
- [ ] 配置日志收集（ELK Stack）
- [ ] 配置自动备份
- [ ] 配置 CI/CD 自动部署
- [ ] 配置高可用（多实例 + 负载均衡）
