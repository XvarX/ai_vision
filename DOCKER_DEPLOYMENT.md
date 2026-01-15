# Docker 部署指南

本项目支持使用 Docker 和 Docker Compose 进行部署。

## 前置要求

- Docker (20.10+)
- Docker Compose (2.0+)

## 快速开始

### 1. 配置环境变量

首先复制并修改环境变量文件：

```bash
cp deployconfig/.env.example .env
```

编辑 `.env` 文件，修改以下重要配置：

```env
# PostgreSQL 配置
POSTGRES_USER=aivision
POSTGRES_PASSWORD=your_secure_password_here  # 修改为强密码
POSTGRES_DB=aivision

# FastAPI 后端配置
SECRET_KEY=your-very-secure-secret-key-change-this-in-production  # 修改为强密钥
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
```

**重要：在生产环境中务必修改默认密码和密钥！**

### 2. 启动服务

在项目根目录执行：

```bash
cd deployconfig/docker
docker-compose up -d
```

这将启动以下服务：
- **PostgreSQL 数据库** (端口 5432)
- **FastAPI 后端** (端口 8000)
- **Next.js 前端** (端口 3000)
- **Nginx 反向代理** (端口 80/443)

### 3. 查看服务状态

```bash
docker-compose ps
```

### 4. 查看日志

```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### 5. 访问应用

- **前端**: http://localhost:3000
- **后端 API 文档**: http://localhost:8000/docs
- **后端健康检查**: http://localhost:8000/health
- **Nginx**: http://localhost (如果已启用)

## 常用命令

### 停止服务

```bash
docker-compose stop
```

### 启动服务

```bash
docker-compose start
```

### 重启服务

```bash
docker-compose restart
```

### 停止并删除容器

```bash
docker-compose down
```

### 停止并删除容器、卷（会删除数据库数据）

```bash
docker-compose down -v
```

### 重新构建镜像

```bash
docker-compose build --no-cache
```

### 重新构建并启动

```bash
docker-compose up -d --build
```

## 生产环境部署

### 1. 修改 CORS 配置

编辑 [backend/app/main.py](../backend/app/main.py)，添加生产环境的域名：

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "https://your-domain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 2. 配置 Nginx

编辑 [deployconfig/docker/nginx.conf](nginx.conf) 设置正确的反向代理规则。

### 3. 使用环境变量

创建生产环境专用的 `.env` 文件：

```bash
cp deployconfig/.env.example .env.prod
```

使用生产环境配置启动：

```bash
docker-compose --env-file ../../.env.prod up -d
```

### 4. 数据库备份

定期备份 PostgreSQL 数据：

```bash
# 备份
docker-compose exec db pg_dump -U aivision aivision > backup.sql

# 恢复
docker-compose exec -T db psql -U aivision aivision < backup.sql
```

### 5. 数据持久化

PostgreSQL 数据存储在 Docker 卷 `postgres_data` 中。即使容器被删除，数据也会保留。

## 故障排除

### 1. 容器启动失败

查看容器日志：

```bash
docker-compose logs backend
docker-compose logs frontend
```

### 2. 数据库连接失败

确保数据库容器已启动且健康：

```bash
docker-compose ps db
```

检查数据库连接：

```bash
docker-compose exec backend python -c "from app.core.database import engine; print(engine.url)"
```

### 3. 前端无法访问后端

检查网络配置：

```bash
docker network inspect ai_vision_ai_vision_network
```

确保容器在同一网络中。

### 4. 端口冲突

如果端口已被占用，修改 [docker-compose.yml](docker-compose.yml) 中的端口映射：

```yaml
ports:
  - "8001:8000"  # 将宿主机端口改为 8001
```

### 5. 重新构建问题

如果遇到缓存问题，强制重新构建：

```bash
docker-compose build --no-cache backend frontend
docker-compose up -d
```

## 性能优化

### 1. 限制资源使用

在 [docker-compose.yml](docker-compose.yml) 中添加资源限制：

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
```

### 2. 数据库优化

调整 PostgreSQL 配置以适应生产环境负载。

### 3. 启用 Nginx 缓存

配置 Nginx 缓存静态资源以提高性能。

## 安全建议

1. **修改默认密码**: 务必修改 `.env` 中的默认密码
2. **使用强密钥**: 生成强随机密钥用于 JWT 签名
3. **限制端口访问**: 在防火墙中只开放必要的端口
4. **启用 HTTPS**: 在生产环境中配置 SSL/TLS 证书
5. **定期更新**: 保持 Docker 镜像和依赖项更新
6. **监控日志**: 定期检查应用和系统日志
7. **数据库备份**: 设置自动备份计划

## 更新部署

当更新代码后：

```bash
# 1. 拉取最新代码
git pull

# 2. 重新构建并启动
docker-compose up -d --build

# 3. 清理旧镜像（可选）
docker image prune -f
```

## 支持

如有问题，请查看：
- 项目文档: [../README.md](../README.md)
- Backend 配置: [../backend/deployconfig/README.md](../backend/deployconfig/README.md)
- Frontend 配置: [../frontend/deployconfig/README.md](../frontend/deployconfig/README.md)
