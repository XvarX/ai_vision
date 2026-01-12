# 生产环境部署指南

本文档介绍如何将 AI Vision 部署到生产环境。

## 📋 目录

- [部署方案对比](#部署方案对比)
- [Docker 部署（推荐）](#docker-部署推荐)
- [传统服务器部署](#传统服务器部署)
- [云平台部署](#云平台部署)
- [性能优化](#性能优化)
- [安全配置](#安全配置)
- [监控和日志](#监控和日志)

## 部署方案对比

| 方案 | 难度 | 成本 | 适用场景 |
|------|------|------|----------|
| **Docker** | ⭐⭐ | 低 | 推荐方案，适合大多数场景 |
| **云平台** | ⭐ | 中-高 | 快速上线，无需管理服务器 |
| **传统部署** | ⭐⭐⭐ | 低 | 有现成服务器的情况 |

## Docker 部署（推荐）

### 1. 准备工作

```bash
# 克隆代码
git clone https://github.com/yourusername/ai_vision.git
cd ai_vision

# 复制环境变量文件
cp .env.example .env

# 编辑环境变量
nano .env
```

**重要：修改 `.env` 中的以下配置：**
```env
# 使用强密码
POSTGRES_PASSWORD=use_a_very_strong_password_here

# 使用随机生成的密钥（至少32位）
SECRET_KEY=use_a_random_32_character_or_longer_secret_key_here
```

### 2. 启动服务

```bash
# 构建并启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 查看服务状态
docker-compose ps
```

### 3. 初始化数据库

```bash
# 进入后端容器
docker-compose exec backend bash

# 运行数据库迁移（如果有 Alembic）
# alembic upgrade head

# 创建初始数据（可选）
# python scripts/init_db.py

exit
```

### 4. 验证部署

访问以下地址验证：
- 前端：http://localhost:3000
- 后端 API：http://localhost:8000/docs
- 健康检查：http://localhost/health

### 5. 使用 Nginx 反向代理

Docker Compose 已包含 Nginx 配置，直接启动即可：

```bash
docker-compose up -d nginx
```

访问 http://localhost 即可。

## 传统服务器部署

### 1. 系统要求

- Ubuntu 20.04+ / CentOS 8+
- Python 3.8+
- Node.js 18+
- PostgreSQL 13+（推荐）或 SQLite

### 2. 安装依赖

**安装 Python 和 pip：**
```bash
sudo apt update
sudo apt install python3 python3-pip python3-venv
```

**安装 Node.js：**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

**安装 PostgreSQL（可选）：**
```bash
sudo apt install postgresql postgresql-contrib
```

### 3. 部署后端

```bash
# 创建虚拟环境
cd backend
python3 -m venv venv
source venv/bin/activate

# 安装依赖
pip install -r requirements-prod.txt

# 配置环境变量
cp .env.example .env
nano .env  # 编辑配置

# 测试运行
gunicorn app.main:app -c gunicorn.conf.py
```

### 4. 使用 Supervisor 管理进程

**安装 Supervisor：**
```bash
sudo apt install supervisor
```

**创建配置文件：**
```bash
sudo nano /etc/supervisor/conf.d/ai_vision.conf
```

**配置内容：**
```ini
[program:ai_vision]
command=/path/to/backend/venv/bin/gunicorn app.main:app -c gunicorn.conf.py
directory=/path/to/backend
user=www-data
autostart=true
autorestart=true
stderr_logfile=/var/log/ai_vision.err.log
stdout_logfile=/var/log/ai_vision.out.log
environment=DATABASE_URL="postgresql://user:pass@localhost/aivision"
```

**启动服务：**
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start ai_vision
```

### 5. 部署前端

```bash
cd frontend

# 安装依赖
npm install

# 构建生产版本
npm run build

# 使用 PM2 管理
npm install -g pm2
pm2 start npm --name "ai-vision-frontend" -- start
pm2 save
pm2 startup
```

## 云平台部署

### Render

1. **连接 GitHub 账号**：https://render.com
2. **创建新的 Web Service**
3. **配置：**
   - Build Command: `pip install -r requirements-prod.txt`
   - Start Command: `gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT`
   - Environment Variables: 从 `.env` 复制

### Railway

1. **连接 GitHub 账号**：https://railway.app
2. **新建项目**
3. **添加 PostgreSQL 数据库**
4. **添加后端服务**
5. **添加前端服务**
6. **配置环境变量**

### Vercel（仅前端）

```bash
# 安装 Vercel CLI
npm install -g vercel

# 部署
cd frontend
vercel
```

## 性能优化

### 1. 数据库优化

**使用连接池：**
```python
# backend/app/core/database.py
from sqlalchemy.pool import QueuePool

engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=20,
    max_overflow=40,
    pool_pre_ping=True,
    echo=False
)
```

**添加索引：**
```python
# 在模型中添加复合索引
class Chapter(Base):
    __tablename__ = "chapters"
    __table_args__ = (
        Index('idx_novel_branch', 'novel_id', 'branch_type'),
        Index('idx_parent_branch', 'parent_chapter_id', 'branch_type'),
    )
```

### 2. 缓存

**使用 Redis 缓存：**
```bash
# docker-compose.yml 添加
redis:
  image: redis:alpine
  ports:
    - "6379:6379"
```

```python
# backend/app/core/cache.py
from redis import Redis
import json

redis = Redis(host='redis', port=6379, decode_responses=True)

def cache_get(key):
    data = redis.get(key)
    return json.loads(data) if data else None

def cache_set(key, value, ttl=3600):
    redis.setex(key, ttl, json.dumps(value))
```

### 3. CDN

- 静态资源使用 CDN
- 图片上传到云存储（如 OSS、S3）

## 安全配置

### 1. HTTPS

**使用 Let's Encrypt 免费证书：**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### 2. 防火墙

```bash
# 配置 UFW
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### 3. 环境变量

**不要在代码中硬编码敏感信息！**
- ✅ 使用环境变量
- ✅ 使用密钥管理服务（AWS Secrets Manager、Vault）
- ❌ 不要提交 `.env` 到 Git

## 监控和日志

### 1. 应用监控

**Sentry（错误追踪）：**
```python
# backend/app/main.py
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

sentry_sdk.init(
    dsn="your-sentry-dsn",
    integrations=[FastApiIntegration()],
    traces_sample_rate=1.0,
)
```

### 2. 日志管理

**使用 ELK Stack（可选）：**
- Elasticsearch
- Logstash
- Kibana

### 3. 性能监控

**Prometheus + Grafana：**
```bash
# docker-compose.yml 添加
prometheus:
  image: prom/prometheus
  ports:
    - "9090:9090"

grafana:
  image: grafana/grafana
  ports:
    - "3001:3000"
```

## 备份策略

### 数据库备份

```bash
# 每日自动备份
0 2 * * * pg_dump -U aivision aivision | gzip > /backup/aivision_$(date +\%Y\%m\%d).sql.gz

# 保留最近30天的备份
0 3 * * * find /backup -name "aivision_*.sql.gz" -mtime +30 -delete
```

## 更新部署

```bash
# 拉取最新代码
git pull

# 重建并启动
docker-compose up -d --build

# 数据库迁移（如果有）
docker-compose exec backend alembic upgrade head
```

## 故障排查

### 常见问题

1. **服务无法启动**
   ```bash
   # 查看日志
   docker-compose logs backend
   docker-compose logs frontend
   ```

2. **数据库连接失败**
   ```bash
   # 检查数据库状态
   docker-compose exec db pg_isready
   ```

3. **内存不足**
   ```bash
   # 减少 worker 数量
   # 编辑 gunicorn.conf.py
   workers = 2
   ```

## 支持

如有问题，请：
- 提交 GitHub Issue
- 查看日志文件
- 检查健康检查端点
