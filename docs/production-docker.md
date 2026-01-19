# Docker 部署指南

本文档介绍如何使用 Docker 和 Docker Compose 部署 AI Vision 到生产环境。

## 目录

- [前置要求](#前置要求)
- [快速开始](#快速开始)
- [Docker 安装指南](#docker-安装指南)
- [配置说明](#配置说明)
- [服务访问](#服务访问)
- [数据管理](#数据管理)
- [日志管理](#日志管理)
- [常见问题](#常见问题)
- [生产优化](#生产优化)

---

## 前置要求

### 硬件要求

- **CPU**: 2 核心或以上
- **内存**: 4GB 或以上
- **磁盘**: 20GB 或以上

### 软件要求

- **操作系统**: Linux、macOS 或 Windows
- **Docker**: 20.10 或更高版本
- **Docker Compose**: 2.0 或更高版本

### 网络要求

- 开放的端口：80（HTTP）、8080（后端 API）、可选 443（HTTPS）

---

## 快速开始

如果你已经安装了 Docker，只需 3 步即可完成部署：

```bash
# 1. 克隆项目
git clone <your-repo-url>
cd ai_vision

# 2. 配置环境变量
cp deployconfig/docker/.env.docker.example deployconfig/docker/.env
nano deployconfig/docker/.env  # ⚠️ 必须修改密码和密钥

# 3. 启动服务
cd deployconfig/docker
docker compose up -d

# 查看状态
docker compose ps
```

**首次启动时间**：需要构建镜像，约 5-10 分钟。

**访问应用**：
- 前端：http://localhost
- 后端 API：http://localhost:8080/api/
- API 文档：http://localhost:8080/docs

---

## Docker 安装指南

如果你还没有安装 Docker，请根据操作系统选择安装方式：

### Ubuntu/Debian

```bash
# 更新包索引
sudo apt update

# 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 安装 Docker Compose
sudo apt install docker-compose-plugin

# 添加当前用户到 docker 组（可选）
sudo usermod -aG docker $USER

# 验证安装
docker --version
docker compose version
```

### Windows

1. 下载 [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/)
2. 运行安装程序
3. 重启计算机
4. 验证安装：
   ```powershell
   docker --version
   docker compose version
   ```

### macOS

1. 下载 [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop/)
2. 安装并启动 Docker Desktop
3. 验证安装：
   ```bash
   docker --version
   docker compose version
   ```

---

## 配置说明

### Docker Compose 服务架构

项目使用 4 个容器：

```
┌─────────────────────────────────────────┐
│              Nginx (80/8080)            │
│         反向代理 + 负载均衡              │
└────────┬────────────────────┬───────────┘
         │                    │
         │                    │
    ┌────▼─────┐        ┌────▼─────┐
    │ Frontend │        │ Backend  │
    │  (3000)  │        │  (8000)  │
    └──────────┘        └────┬─────┘
                             │
                        ┌────▼─────┐
                        │    DB    │
                        │  (5432)  │
                        │PostgreSQL│
                        └──────────┘
```

### 服务说明

| 服务 | 容器名 | 端口 | 说明 |
|------|--------|------|------|
| **Nginx** | ai_vision_nginx | 80, 8080 | 反向代理，统一入口 |
| **Frontend** | ai_vision_frontend | 3000 | Next.js 前端应用 |
| **Backend** | ai_vision_backend | 8000 | FastAPI 后端 API |
| **Database** | ai_vision_db | 5432 | PostgreSQL 数据库 |

### 端口映射

- **80** → Nginx → Frontend (前端访问)
- **8080** → Nginx → Backend (后端 API 访问)
- **443** → Nginx → HTTPS (可选)
- **3000** → Frontend (内部通信，可选)
- **8000** → Backend (内部通信，可选)
- **5432** → PostgreSQL (内部通信)

### 网络配置

所有容器运行在 `ai_vision_network` 桥接网络中，可以互相通信。

### 健康检查

- **PostgreSQL**: 每 10s 检查一次
- **Backend**: 每 30s 检查一次 `/health` 端点
- **Frontend**: 依赖 Backend 健康后启动
- **Nginx**: 依赖 Backend 和 Frontend 健康后启动

---

## 服务访问

### 本地访问

- **前端**: http://localhost
- **后端 API**: http://localhost:8080/api/
- **API 文档**: http://localhost:8080/docs

### 局域网访问

```bash
# 查看服务器 IP
ip addr show  # Linux
ipconfig     # Windows
ifconfig     # macOS
```

局域网内其他设备访问：

- **前端**: http://YOUR_SERVER_IP
- **后端 API**: http://YOUR_SERVER_IP:8080/api/

### 外网访问（需要域名）

1. 配置 DNS 解析到服务器 IP
2. 修改 [nginx.conf](nginx.conf:19) 中的 `server_name`
3. 配置防火墙开放 80、443 端口
4. （推荐）配置 HTTPS 证书

---

## 数据管理

### 数据持久化

PostgreSQL 数据存储在 Docker volume `postgres_data` 中：

```bash
# 查看卷
docker volume ls | grep postgres

# 查看卷详情
docker volume inspect deployconfig_docker_postgres_data
```

### 数据备份

```bash
# 备份数据库
docker compose exec db pg_dump -U aivision aivision > backup_$(date +%Y%m%d).sql

# 恢复数据库
docker compose exec -T db psql -U aivision aivision < backup_20240101.sql
```

### 自动备份脚本

创建 `backup.sh`:

```bash
#!/bin/bash
# 每天凌晨 2 点备份数据库
BACKUP_DIR="/path/to/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.sql"

mkdir -p $BACKUP_DIR
docker compose exec -T db pg_dump -U aivision aivision > $BACKUP_FILE

# 保留最近 7 天的备份
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
```

设置定时任务：

```bash
# 编辑 crontab
crontab -e

# 添加定时任务（每天凌晨 2 点）
0 2 * * * /path/to/backup.sh
```

---

## 日志管理

### 查看日志

```bash
# 查看所有服务日志
docker compose logs

# 查看特定服务日志
docker compose logs backend
docker compose logs frontend
docker compose logs nginx
docker compose logs db

# 实时跟踪日志
docker compose logs -f

# 查看最近 100 行
docker compose logs --tail=100
```

### 日志配置

Nginx 日志已配置在容器内，可以通过以下方式查看：

```bash
# 查看 Nginx 访问日志
docker compose exec nginx tail -f /var/log/nginx/access.log

# 查看 Nginx 错误日志
docker compose exec nginx tail -f /var/log/nginx/error.log
```

### 日志轮转

Docker 默认日志配置可能导致日志文件过大，建议在 `docker-compose.yml` 中添加：

```yaml
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

---

## 常见问题

### Q1: 端口被占用

**问题**：启动失败，提示端口已被使用。

**解决方案**：

```bash
# 查看占用端口的进程
sudo lsof -i :80
sudo lsof -i :8080

# 或
sudo netstat -tulpn | grep :80

# 停止占用端口的服务
sudo systemctl stop nginx  # 如果是系统 Nginx

# 或修改 docker-compose.yml 中的端口映射
```

### Q2: 容器启动失败

**问题**：容器状态为 `Exited` 或 `Restarting`。

**解决方案**：

```bash
# 查看容器状态
docker compose ps

# 查看详细日志
docker compose logs backend
docker compose logs frontend

# 检查配置文件
docker compose config

# 重新构建镜像
docker compose build --no-cache

# 重启服务
docker compose restart
```

### Q3: 数据库连接失败

**问题**：后端无法连接到数据库。

**解决方案**：

```bash
# 检查数据库容器状态
docker compose ps db

# 查看数据库日志
docker compose logs db

# 等待数据库健康检查通过
docker compose ps

# 手动测试连接
docker compose exec backend python -c "from app.database import engine; print(engine)"
```

### Q4: 前端无法访问后端

**问题**：前端报错 "Network Error" 或 CORS 错误。

**解决方案**：

1. 检查后端是否健康：
   ```bash
   curl http://localhost:8080/health
   ```

2. 检查 Nginx 配置：
   ```bash
   docker compose exec nginx nginx -t
   ```

3. 查看后端日志：
   ```bash
   docker compose logs backend
   ```

### Q5: 内存不足

**问题**：容器被 OOM Killer 杀死。

**解决方案**：

```bash
# 限制容器内存使用（在 docker-compose.yml 中添加）
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M
```

### Q6: 镜像构建失败

**问题**：构建时网络错误或依赖下载失败。

**解决方案**：

```bash
# 使用国内镜像源（已配置）
# 检查网络连接
ping docker.m.daocloud.io

# 清理缓存重新构建
docker compose build --no-cache

# 或使用代理
export HTTP_PROXY=http://proxy.example.com:8080
docker compose build
```

### Q7: 如何进入容器调试

```bash
# 进入后端容器
docker compose exec backend bash

# 进入前端容器
docker compose exec frontend sh

# 进入数据库容器
docker compose exec db psql -U aivision -d aivision

# 进入 Nginx 容器
docker compose exec nginx sh
```

---

## 生产优化

### 1. 配置 HTTPS

#### 使用 Let's Encrypt（免费）

```bash
# 安装 Certbot
sudo apt install certbot

# 获取证书
sudo certbot certonly --standalone -d yourdomain.com

# 证书路径
# /etc/letsencrypt/live/yourdomain.com/fullchain.pem
# /etc/letsencrypt/live/yourdomain.com/privkey.pem

# 复制证书到项目
mkdir -p deployconfig/docker/ssl
sudo cp /etc/letsencrypt/live/yourdomain.com/*.pem deployconfig/docker/ssl/

# 修改 nginx.conf，取消注释 HTTPS 配置
```

#### 自签名证书（测试用）

```bash
# 生成自签名证书
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout deployconfig/docker/ssl/key.pem \
  -out deployconfig/docker/ssl/cert.pem

# 修改 nginx.conf，取消注释 HTTPS 配置
```

### 2. 限制资源使用

在 `docker-compose.yml` 中添加资源限制：

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M

  frontend:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M

  db:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### 3. 配置自动重启

所有服务已配置 `restart: unless-stopped`，确保容器异常退出后自动重启。

### 4. 日志管理

```yaml
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### 5. 监控告警

#### 使用 Portainer（Docker 可视化管理）

```bash
# 安装 Portainer
docker volume create portainer_data
docker run -d -p 9000:9000 \
  --name portainer \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  docker.m.daocloud.io/portainer/portainer-ce

# 访问 http://localhost:9000
```

#### 健康检查监控

```bash
# 检查所有容器健康状态
docker compose ps

# 检查容器资源使用
docker stats
```

### 6. 备份策略

```bash
# 数据库备份（每天）
0 2 * * * /path/to/backup.sh

# 配置文件备份（每周）
0 3 * * 0 tar -czf config_backup_$(date +%Y%m%d).tar.gz deployconfig/docker/
```

### 7. 安全加固

#### 修改默认端口

在 `docker-compose.yml` 中修改端口映射：

```yaml
services:
  nginx:
    ports:
      - "8081:80"  # 使用 8081 端口
```

#### 配置防火墙

```bash
# Ubuntu (UFW)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable

# 只允许特定 IP 访问后端
sudo ufw allow from 192.168.1.0/24 to any port 8080
```

#### 最小权限原则

- 数据库使用独立用户（已配置）
- 容器使用非 root 用户运行（前端已配置）
- 限制容器的 `--cap-add` 和 `--privileged`

---

## 更新和维护

### 更新应用

```bash
# 拉取最新代码
git pull

# 重新构建镜像
docker compose build

# 重启服务
docker compose up -d

# 清理旧镜像
docker image prune -a
```

### 完全重置

```bash
# 停止并删除容器
docker compose down

# 删除数据卷（⚠️ 会删除数据库数据）
docker volume rm deployconfig_docker_postgres_data

# 重新启动
docker compose up -d
```

### 查看资源使用

```bash
# 实时查看容器资源使用
docker stats

# 查看磁盘使用
docker system df

# 清理未使用的资源
docker system prune -a --volumes
```

---

## 服务管理命令

### 常用命令

```bash
# 启动服务
docker compose up -d

# 停止服务
docker compose stop

# 重启服务
docker compose restart

# 查看状态
docker compose ps

# 查看日志
docker compose logs -f

# 停止并删除容器
docker compose down

# 停止并删除容器、网络、卷
docker compose down -v

# 重新构建并启动
docker compose up -d --build

# 扩展服务（多实例）
docker compose up -d --scale backend=3
```

### 单独管理服务

```bash
# 重启后端
docker compose restart backend

# 查看后端日志
docker compose logs backend

# 进入后端容器
docker compose exec backend bash

# 重新构建后端
docker compose build backend

# 只启动后端和数据库
docker compose up -d backend db
```

---

## 故障排查

### 检查清单

1. **检查 Docker 版本**
   ```bash
   docker --version
   docker compose version
   ```

2. **检查容器状态**
   ```bash
   docker compose ps
   ```

3. **检查日志**
   ```bash
   docker compose logs
   ```

4. **检查网络**
   ```bash
   docker network ls
   docker network inspect deployconfig_docker_ai_vision_network
   ```

5. **检查卷**
   ```bash
   docker volume ls
   docker volume inspect deployconfig_docker_postgres_data
   ```

6. **检查端口**
   ```bash
   sudo lsof -i :80
   sudo lsof -i :8080
   ```

### 调试模式

```bash
# 使用调试配置启动
docker compose --env-file .env.debug up -d

# 查看详细日志
docker compose logs --tail=100 -f

# 使用 docker-compose.yml 中的命令覆盖
docker compose run --rm backend python -m pytest
```

---

## 成本估算

### 云服务器配置建议

| 配置 | 月成本 | 适用规模 |
|------|--------|---------|
| 1核 2GB | ¥50-100 | 100-500 日活 |
| 2核 4GB | ¥100-200 | 500-2000 日活 |
| 4核 8GB | ¥200-400 | 2000-5000 日活 |

### 推荐配置

**小型项目**（< 500 日活）：
- CPU: 1-2 核
- 内存: 2-4GB
- 数据库: PostgreSQL 容器

**中型项目**（500-2000 日活）：
- CPU: 2-4 核
- 内存: 4-8GB
- 数据库: 独立 PostgreSQL 实例（推荐云数据库）

---

## 下一步

部署完成后，建议：

1. ✅ 配置 HTTPS 证书
2. ✅ 设置定期备份
3. ✅ 配置监控告警（Prometheus + Grafana）
4. ✅ 使用 CI/CD 自动化部署
5. ✅ 配置 CDN 加速静态资源
6. ✅ 制定灾难恢复计划

更多部署方案（开发环境/本地生产/K8s/云平台），请参考 [部署中心](./DEPLOYMENT_INDEX.md)。

---

## 参考资源

- [Docker 官方文档](https://docs.docker.com/)
- [Docker Compose 文档](https://docs.docker.com/compose/)
- [PostgreSQL Docker 镜像](https://hub.docker.com/_/postgres)
- [Nginx Docker 镜像](https://hub.docker.com/_/nginx)
