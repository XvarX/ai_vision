# 本地生产环境部署指南

本文档介绍如何在本地服务器上部署 AI Vision 到生产环境（不使用 Docker/K8s/云平台）。

## 目录

- [前置要求](#前置要求)
- [后端部署](#后端部署)
- [Nginx 反向代理](#nginx-反向代理)
- [前端部署](#前端部署)
- [进程管理](#进程管理)
- [系统配置](#系统配置)
- [常见问题](#常见问题)

---

## 前置要求

### 硬件要求

- **CPU**: 2 核心或以上
- **内存**: 4GB 或以上
- **磁盘**: 20GB 或以上

### 软件要求

- **操作系统**: Linux（推荐 Ubuntu 20.04+）或 Windows Server
- **Python**: 3.8+
- **Node.js**: 18+
- **数据库**: PostgreSQL 13+ 或 SQLite
- **Web 服务器**: Nginx（推荐）

### 网络要求

- 固定的公网 IP 或域名
- 开放的端口：80（HTTP）、443（HTTPS）、可选 8000（后端直连）

---

## 后端部署

### 1. 准备虚拟环境

**重要**：生产环境也需要使用虚拟环境（venv），确保依赖隔离和环境一致性。

```bash
cd backend

# 创建虚拟环境（如果还没有）
python -m venv venv

# 激活虚拟环境
# Windows PowerShell:
venv\Scripts\Activate.ps1
# Windows CMD:
venv\Scripts\activate.bat
# Linux/Mac:
source venv/bin/activate
```

激活成功后，命令行提示符前会显示 `(venv)`。

### 2. 安装 Python 依赖

```bash
# 确保已激活虚拟环境（看到 (venv) 前缀）

# 安装生产依赖（包含 Gunicorn）
pip install -r deployconfig/requirements_prod.txt
```

**说明**：生产环境依赖包包括：
- `requirements.txt` 中的所有开发依赖
- `gunicorn` - 生产环境 WSGI 服务器
- `psycopg2-binary` - PostgreSQL 数据库驱动
- `sentry-sdk` - 错误监控（可选）

### 3. 配置环境变量

```bash
# 复制并编辑环境变量（本地生产环境）
cp deployconfig/.env.prodlocal.example deployconfig/.env
nano deployconfig/.env
```

**生产环境配置示例**：

```env
# 使用 PostgreSQL（推荐）
# 格式：postgresql://用户名:数据库密码@主机:端口/数据库名
DATABASE_URL=postgresql://aivision:strong_password@localhost:5432/aivision

# JWT 配置
SECRET_KEY=your-very-secure-random-secret-key-at-least-32-characters
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
```

**说明**：
- `aivision`: PostgreSQL 数据库用户名
- `strong_password`: PostgreSQL 数据库密码（**请修改为强密码**）
- `aivision`（最后一个）: PostgreSQL 数据库名

### 3. 安装和配置 PostgreSQL（可选）

如果使用 SQLite（小型项目），可以跳过此步骤。

#### Ubuntu 安装 PostgreSQL

```bash
# 安装
sudo apt update
sudo apt install postgresql postgresql-contrib

# 启动服务
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 创建数据库和用户
sudo -u postgres psql
```

```sql
-- 创建数据库用户（请修改 strong_password 为实际密码）
CREATE USER aivision WITH PASSWORD 'strong_password';

-- 创建数据库
CREATE DATABASE aivision OWNER aivision;

-- 授权
GRANT ALL PRIVILEGES ON DATABASE aivision TO aivision;

-- 退出
\q
```

#### Windows 安装 PostgreSQL

1. **下载安装程序**：
   - 访问 [PostgreSQL 官网](https://www.postgresql.org/download/windows/)
   - 下载最新版本的安装程序（推荐 PostgreSQL 16+）

2. **运行安装程序**：
   - 双击安装程序，默认端口为 `5432`
   - 设置 `postgres` 用户的密码（请记住此密码）
   - 完成安装

3. **打开 SQL Shell**：
   - 在开始菜单搜索 "SQL Shell (psql)"
   - 或者在命令行中运行：`psql -U postgres`

4. **创建数据库和用户**：

```sql
-- 创建数据库用户（请修改 strong_password 为实际密码）
CREATE USER aivision WITH PASSWORD 'strong_password';

-- 创建数据库
CREATE DATABASE aivision OWNER aivision;

-- 授权
GRANT ALL PRIVILEGES ON DATABASE aivision TO aivision;

-- 退出
\q
```

**注意**：这里的 `strong_password` 必须与上面 `.env` 文件中 `DATABASE_URL` 里的密码保持一致。

### 5. 测试后端

```bash
cd backend

# 确保已激活虚拟环境
venv\Scripts\Activate.ps1  # Windows PowerShell
source venv/bin/activate   # Linux/Mac

# 开发环境测试（使用 Uvicorn）
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

访问 http://your-server:8000/docs 确认后端正常工作。

### 6. 生产环境运行（使用 Gunicorn）

在生产环境中，应该使用 Gunicorn + Uvicorn workers 而不是直接使用 Uvicorn。

**重要**：以下所有命令都需要在虚拟环境中执行。

#### 使用 Gunicorn 启动

```bash
cd backend

# 激活虚拟环境
venv\Scripts\Activate.ps1  # Windows PowerShell
source venv/bin/activate   # Linux/Mac

# 直接启动
gunicorn app.main:app -c deployconfig/gunicorn.conf.py
```

**说明**：
- Gunicorn 必须在虚拟环境中才能使用
- 虚拟环境激活后，可以直接使用 `gunicorn` 命令
- 或者使用完整路径：`venv\Scripts\gunicorn.exe` (Windows) / `venv/bin/gunicorn` (Linux/Mac)

#### 配置说明

`deployconfig/gunicorn.conf.py` 配置文件说明：

```python
import multiprocessing

# Server socket - 监听地址和端口
bind = "0.0.0.0:8000"      # 监听所有网络接口的 8000 端口
backlog = 2048              # 连接队列大小

# Worker processes - Worker 进程配置
workers = multiprocessing.cpu_count() * 2 + 1  # Worker 进程数
worker_class = "uvicorn.workers.UvicornWorker"  # 使用 Uvicorn worker
worker_connections = 1000   # 每个 worker 的并发连接数

# 超时配置
timeout = 30                # 请求超时时间（秒）
keepalive = 2               # 保持连接时间（秒）

# Process naming - 进程名称
proc_name = "ai_vision"

# Logging - 日志配置
accesslog = "-"             # 访问日志输出到标准输出
errorlog = "-"              # 错误日志输出到标准错误
loglevel = "info"           # 日志级别

# Server mechanics - 服务器机制
daemon = False              # 是否以守护进程运行（PM2/systemd 管理时应设为 False）
pidfile = "/tmp/gunicorn.pid"  # PID 文件位置
umask = 007                 # 文件权限掩码
user = None                 # 运行用户（None 表示当前用户）

# Server hooks - 服务器钩子函数
def on_starting(server):
    """Server 启动时调用"""
    print("Starting AI Vision API server...")

def on_exit(server):
    """Server 关闭时调用"""
    print("Shutting down AI Vision API server...")
```

**关键配置说明**：

- `bind`: 监听地址，`0.0.0.0` 表示监听所有网络接口
- `workers`: 进程数，根据 CPU 核心数自动计算
- `worker_class`: 必须使用 `uvicorn.workers.UvicornWorker` 支持 FastAPI/ASGI
- `daemon`: 使用 PM2/systemd 时必须设为 `False`，让进程管理器来管理
- `timeout`: 请求超时时间，根据应用需求调整
- `loglevel`: 可选值 `debug`, `info`, `warning`, `error`, `critical`

#### 为什么使用 Gunicorn？

- **性能更好**：多进程处理并发请求
- **稳定性更高**：自动重启崩溃的 worker
- **进程管理**：支持热重载、优雅重启
- **生产标准**：Python Web 服务的生产环境标准

#### Uvicorn vs Gunicorn

| 特性 | Uvicorn | Gunicorn + Uvicorn |
|------|---------|-------------------|
| 适用场景 | 开发环境 | 生产环境 |
| 并发处理 | 单进程 | 多进程 |
| 稳定性 | 较低 | 高 |
| 自动重启 | 无 | 有 |
| 推荐使用 | 开发测试 | 生产部署 |

---

## Nginx 反向代理

使用 Nginx 作为反向代理，统一端口和域名。

### 1. 安装 Nginx

**Ubuntu**：

```bash
sudo apt install nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

**Windows**：下载 [Nginx for Windows](http://nginx.org/en/docs/windows.html)

### 2. 配置 Nginx

项目中已提供本地生产环境的 Nginx 配置文件：`deployconfig/nginx-local.conf`

**配置说明**：
- **前端**：监听 `80` 端口，代理到 `127.0.0.1:3000`
- **后端**：监听 `8080` 端口，代理到 `127.0.0.1:8000`
- **API 路径**：前端通过 `/api/` 路径访问后端（可选）

**Ubuntu 安装配置**：

```bash
# 复制配置文件
sudo cp deployconfig/nginx-local.conf /etc/nginx/sites-available/ai-vision

# 创建软链接
sudo ln -s /etc/nginx/sites-available/ai-vision /etc/nginx/sites-enabled/

# 删除默认配置（可选）
sudo rm /etc/nginx/sites-enabled/default

# 测试配置
sudo nginx -t

# 重载 Nginx
sudo systemctl reload nginx
```

**Windows 安装配置**：

1. 将 `deployconfig/nginx-local.conf` 内容复制到 `nginx.conf`
2. 或者在 `nginx.conf` 中添加：`include deployconfig/nginx-local.conf;`
3. 重启 Nginx

**访问地址**：
- 本机访问：`http://localhost`（前端）、`http://localhost:8080`（后端）
- 局域网访问：`http://YOUR_IP`（前端）、`http://YOUR_IP:8080`（后端）
  - 查看本机 IP：
    - Windows: `ipconfig`（查看 IPv4 地址）
    - Linux/Mac: `ip addr show` 或 `ifconfig`
- 统一入口：`http://localhost/api/`（通过前端 80 端口访问后端）

### 3. 启用配置

**Ubuntu**：

```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/ai-vision /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重载 Nginx
sudo systemctl reload nginx
```

**Windows**：将配置复制到 `nginx.conf` 并重启 Nginx

---

## 前端部署

### 1. 安装依赖

```bash
cd frontend
npm install
```

### 2. 配置环境变量

```bash
cp deployconfig/.env.local.example .env.local
nano .env.local
```

**本地生产环境配置（不使用 Nginx）**：

```env
# 后端 API 地址（直连后端）
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**本地生产环境配置（使用 Nginx）**：

```env
# 后端 API 地址（通过 Nginx 反向代理）
# 方案 1：使用 8080 端口（独立后端入口）
NEXT_PUBLIC_API_URL=http://localhost:8080

# 方案 2：使用 /api/ 路径（统一入口，前端 80 端口）
NEXT_PUBLIC_API_URL=http://localhost/api

# 局域网访问（使用你的机器 IP，请替换为实际 IP）
NEXT_PUBLIC_API_URL=http://YOUR_IP:8080
```

**说明**：
- **不使用 Nginx**：前端直连后端 8000 端口
- **使用 Nginx 方案 1**：前端通过 8080 端口访问后端（需要配置 Nginx）
- **使用 Nginx 方案 2**：前端通过 80 端口的 `/api/` 路径访问后端（需要配置 Nginx）
- **局域网访问**：将 `YOUR_IP` 替换为你的机器的实际 IP 地址

### 3. 构建前端

```bash
npm run build
npm run start
```

前端会运行在 http://localhost:3000

---

## 进程管理

使用进程管理工具确保服务持续运行。

### 方案 1：PM2（推荐）

#### 安装 PM2

```bash
npm install -g pm2
```

#### 创建后端启动文件

创建 `backend/ecosystem.config.cjs`：

```javascript
module.exports = {
  apps: [{
    name: 'ai-vision-backend',
    script: 'venv/Scripts/gunicorn.exe',  // Windows
    // script: 'venv/bin/gunicorn',     // Linux/Mac
    args: 'app.main:app -c deployconfig/gunicorn.conf.py',
    cwd: './backend',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
```

#### 启动后端

```bash
cd backend
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

#### 启动前端

```bash
cd frontend
pm2 start npm --name "ai-vision-frontend" -- start
pm2 save
```

#### 常用命令

```bash
# 查看状态
pm2 status

# 查看日志
pm2 logs

# 重启服务
pm2 restart all

# 停止服务
pm2 stop all
```

### 方案 2：Systemd（Linux 推荐）

创建 `/etc/systemd/system/ai-vision-backend.service`：

```ini
[Unit]
Description=AI Vision Backend
After=network.target postgresql.service

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/ai_vision/backend
Environment="PATH=/path/to/ai_vision/backend/venv/bin"
ExecStart=/path/to/ai_vision/backend/venv/bin/gunicorn app.main:app -c deployconfig/gunicorn.conf.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

启动服务：

```bash
sudo systemctl daemon-reload
sudo systemctl enable ai-vision-backend
sudo systemctl start ai-vision-backend
sudo systemctl status ai-vision-backend
```

---

## 系统配置

### 1. 配置防火墙

**Ubuntu (UFW)**：

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

**Windows**：在 Windows 防火墙中开放端口

### 2. 配置自动启动

#### PM2

```bash
pm2 startup
pm2 save
```

#### Systemd

```bash
sudo systemctl enable ai-vision-backend
```

### 3. 日志管理

```bash
# PM2 日志
pm2 logs

# Systemd 日志
journalctl -u ai-vision-backend -f

# Nginx 日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## HTTPS 配置（推荐）

### 使用 Let's Encrypt（免费 SSL 证书）

#### Ubuntu

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d www.yourdomain.com -d yourdomain.com

# 自动续期
sudo certbot renew --dry-run
```

证书会自动配置到 Nginx。

### 手动配置 SSL

如果已有证书，修改 Nginx 配置：

```nginx
server {
    listen 443 ssl http2;
    server_name www.yourdomain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://127.0.0.1:3000;
        # ... 其他配置
    }
}

# HTTP 自动跳转 HTTPS
server {
    listen 80;
    server_name www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

---

## 性能优化

### 1. 启用 Gzip（Nginx）

```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;
```

### 2. 静态资源缓存

```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. 后端工作进程数

编辑 `backend/deployconfig/gunicorn.conf.py`：

```python
workers = multiprocessing.cpu_count() * 2 + 1
```

---

## 监控和维护

### 1. 监控服务状态

```bash
# PM2 监控
pm2 monit

# 查看系统资源
htop
```

### 2. 日志轮转

创建 `/etc/logrotate.d/ai-vision`：

```
/home/user/.pm2/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 user user
}
```

### 3. 数据库备份

```bash
# PostgreSQL 备份脚本
pg_dump -U aivision aivision > backup_$(date +%Y%m%d).sql

# 定时备份（每天凌晨 2 点）
0 2 * * * /path/to/backup-script.sh
```

---

## 常见问题

### Q1: 端口被占用

```bash
# 查看占用端口的进程
netstat -ano | findstr :8000
lsof -i :8000

# 杀掉进程
taskkill /PID <pid> /F
kill -9 <pid>
```

### Q2: 权限错误

```bash
# Linux
sudo chown -R $USER:$USER /path/to/ai_vision

# Windows
# 以管理员身份运行命令提示符
```

### Q3: 服务无法启动

```bash
# 查看详细日志
pm2 logs
journalctl -u ai-vision-backend -n 50

# 检查端口
netstat -tuln | grep -E ':(3000|8000)'
```

### Q4: 数据库连接失败

```bash
# 检查 PostgreSQL 状态
sudo systemctl status postgresql

# 测试连接
psql -U aivision -h localhost -d aivision

# 检查防火墙
sudo ufw status
```

---

## 更新部署

### 1. 更新代码

```bash
cd /path/to/ai_vision
git pull
```

### 2. 更新后端

```bash
cd backend

# 更新依赖
pip install -r deployconfig/requirements_prod.txt

# 重启服务
pm2 restart ai-vision-backend
# 或
sudo systemctl restart ai-vision-backend
```

### 3. 更新前端

```bash
cd frontend

# 安装依赖
npm install

# 构建
npm run build

# 重启服务
pm2 restart ai-vision-frontend
```

---

## 安全建议

1. **使用强密码和密钥**
   ```python
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

2. **启用防火墙**
   - 只开放必要的端口（80, 443, 22）
   - 禁用 root 登录 SSH

3. **定期更新**
   ```bash
   sudo apt update && sudo apt upgrade
   pip list --outdated
   ```

4. **配置 CORS**
   - 后端只允许白名单域名访问

5. **启用 HTTPS**
   - 使用 Let's Encrypt 免费证书
   - 强制 HTTPS 重定向

---

## 成本估算

### VPS 配置建议

| 配置 | 月成本 | 适用规模 |
|------|--------|---------|
| 1核 2GB | ¥50-100 | 100-500 日活 |
| 2核 4GB | ¥100-200 | 500-2000 日活 |
| 4核 8GB | ¥200-400 | 2000-5000 日活 |

### 推荐配置

**小型项目**（< 500 日活）：
- CPU: 2 核
- 内存: 4GB
- 数据库: SQLite 或 PostgreSQL

**中型项目**（500-2000 日活）：
- CPU: 4 核
- 内存: 8GB
- 数据库: PostgreSQL

---

## 下一步

部署完成后，建议：

1. ✅ 配置监控告警
2. ✅ 设置定期备份
3. ✅ 配置日志收集
4. ✅ 压力测试
5. ✅ 制定恢复计划

更多部署方案（Docker/K8s/云平台），请参考 [部署中心](DEPLOYMENT_INDEX.md)。
