# Docker 负载均衡配置说明

本文档说明如何使用 Docker Compose 配置和管理多实例负载均衡。

## 目录

- [架构概览](#架构概览)
- [快速开始](#快速开始)
- [负载均衡策略](#负载均衡策略)
- [扩展实例](#扩展实例)
- [健康检查](#健康检查)
- [故障转移](#故障转移)
- [监控和调试](#监控和调试)

---

## 架构概览

### 默认架构（单实例）

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

### 多实例架构（2+2）

```
┌─────────────────────────────────────────┐
│              Nginx (80/8080)            │
│      负载均衡 + 会话保持 + 健康检查        │
└───┬─────────────┬─────────────┬─────────┘
    │             │             │
    │             │             │
┌───▼────┐   ┌───▼────┐   ┌───▼────┐   ┌─────┐
│Frontend│   │Frontend│   │Backend │   │ DB  │
│ (3000) │   │ (3000) │   │ (8000) │   │(5432)│
└────────┘   └────────┘   └────┬───┘   └─────┘
                                │
                            ┌───▼────┐
                            │Backend │
                            │ (8000) │
                            └────────┘
```

---

## 快速开始

### 1. 启动默认配置（1 前端 + 1 后端）

```bash
cd deployconfig/docker
docker compose up -d
```

### 2. 启动多实例配置（2 前端 + 2 后端）

```bash
cd deployconfig/docker
docker compose up -d --scale frontend=2 --scale backend=2
```

### 3. 验证实例数量

```bash
# 查看所有容器
docker compose ps

# 输出示例
# deployconfig-docker-backend-1   running
# deployconfig-docker-backend-2   running
# deployconfig-docker-frontend-1  running
# deployconfig-docker-frontend-2  running
```

---

## 负载均衡策略

### 后端负载均衡：IP 哈希（IP Hash）

**配置位置**：[nginx.conf](nginx.conf:10)

```nginx
upstream backend {
    ip_hash;  # IP 哈希策略
    server backend:8000 max_fails=3 fail_timeout=30s;
}
```

**特点**：
- ✅ **会话保持**：同一客户端 IP 的请求总是转发到同一个后端实例
- ✅ **简单高效**：无需额外配置
- ✅ **适合有状态应用**：如需要会话保持的场景

**工作原理**：
```
客户端 IP: 192.168.1.100 → 哈希计算 → Backend-1
客户端 IP: 192.168.1.100 → 哈希计算 → Backend-1（相同）
客户端 IP: 192.168.1.101 → 哈希计算 → Backend-2
```

### 前端负载均衡：最少连接（Least Connections）

**配置位置**：[nginx.conf](nginx.conf:23)

```nginx
upstream frontend {
    least_conn;  # 最少连接策略
    server frontend:3000 max_fails=3 fail_timeout=30s;
}
```

**特点**：
- ✅ **动态负载**：优先将请求发送到连接数最少的实例
- ✅ **适合无状态应用**：前端通常是静态资源，无状态
- ✅ **资源利用最优**：避免某个实例过载

---

## 扩展实例

### 方法 1：启动时指定实例数量

```bash
# 2 前端 + 2 后端
docker compose up -d --scale frontend=2 --scale backend=2

# 3 前端 + 3 后端
docker compose up -d --scale frontend=3 --scale backend=3

# 1 前端 + 3 后端（前端不扩展）
docker compose up -d --scale backend=3
```

### 方法 2：运行时动态扩展

```bash
# 从 1 个后端扩展到 3 个
docker compose up -d --scale backend=3

# 从 2 个前端扩展到 4 个
docker compose up -d --scale frontend=4
```

### 方法 3：缩容（减少实例）

```bash
# 从 3 个后端减少到 2 个
docker compose up -d --scale backend=2

# 注意：不能缩容到 0，至少保留 1 个实例
```

### 推荐配置

| 场景 | 前端实例 | 后端实例 | 说明 |
|------|---------|---------|------|
| **小型** | 1 | 1 | 测试/开发环境 |
| **中型** | 2 | 2 | 小型生产环境 |
| **大型** | 3 | 3 | 中型生产环境 |
| **高可用** | 3+ | 5+ | 大型生产环境 |

---

## 健康检查

### 被动健康检查

**配置位置**：[nginx.conf](nginx.conf:13)

```nginx
server backend:8000 max_fails=3 fail_timeout=30s;
```

**参数说明**：
- `max_fails=3`：连续失败 3 次后标记为不可用
- `fail_timeout=30s`：30 秒后重新尝试连接

**工作流程**：
```
1. Nginx 转发请求到 Backend-1
2. Backend-1 无响应（超时/错误）
3. Nginx 重试（最多 3 次）
4. 标记 Backend-1 为不可用
5. 后续请求转发到 Backend-2
6. 30 秒后重新尝试 Backend-1
```

### 容器健康检查

**配置位置**：[docker-compose.yml](docker-compose.yml:46)

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

**参数说明**：
- `interval`：每 30 秒检查一次
- `timeout`：单次检查超时时间 10 秒
- `retries`：连续失败 3 次标记为不健康
- `start_period`：启动后 40 秒才开始检查

---

## 故障转移

### 自动故障转移

当某个实例失败时：

1. **Nginx 层面**：
   - 检测到后端实例无响应
   - 自动将请求转发到其他健康实例
   - 用户无感知

2. **Docker 层面**：
   - 容器健康检查失败
   - 自动重启不健康的容器
   - 恢复后自动加入负载均衡池

### 测试故障转移

```bash
# 1. 启动 2 个后端实例
docker compose up -d --scale backend=2

# 2. 模拟一个后端实例故障
docker compose stop backend-1

# 3. 观察请求是否自动转发到 backend-2
curl http://localhost:8080/api/

# 4. 恢复实例
docker compose start backend-1

# 5. 验证实例自动重新加入负载均衡池
docker compose ps
```

---

## 监控和调试

### 查看实例状态

```bash
# 查看所有容器状态
docker compose ps

# 查看容器健康状态
docker inspect --format='{{.State.Health.Status}}' deployconfig-docker-backend-1

# 查看实时日志
docker compose logs -f backend
```

### 查看 Nginx 负载均衡状态

```bash
# 进入 Nginx 容器
docker compose exec nginx sh

# 查看 Nginx 错误日志（包含负载均衡信息）
cat /var/log/nginx/error.log

# 查看访问日志
cat /var/log/nginx/access.log
```

### 测试负载均衡

```bash
# 测试后端负载均衡（IP 哈希）
for i in {1..10}; do
  curl http://localhost:8080/api/health
done

# 测试前端负载均衡（最少连接）
for i in {1..10}; do
  curl http://localhost/
done
```

### 监控资源使用

```bash
# 查看所有容器资源使用
docker stats

# 查看特定服务资源使用
docker stats deployconfig-docker-backend-1 deployconfig-docker-backend-2
```

---

## 常见问题

### Q1: 扩展后新实例无法访问？

**检查项**：

```bash
# 1. 确认新容器已启动
docker compose ps

# 2. 确认新容器健康状态
docker inspect --format='{{.State.Health.Status}}' deployconfig-docker-backend-2

# 3. 查看 Nginx 是否已发现新实例
docker compose exec nginx cat /etc/hosts
```

**解决方案**：
- Docker Compose 使用内部 DNS，Nginx 会自动发现新实例
- 如果无法发现，重启 Nginx：`docker compose restart nginx`

### Q2: 会话丢失问题？

**原因**：默认使用 IP 哈希，应该不会丢失会话。

**检查项**：
```bash
# 确认后端负载均衡策略
docker compose exec nginx grep -A 5 "upstream backend" /etc/nginx/nginx.conf
```

**如果仍然丢失会话**：
- 检查后端是否使用了分布式会话存储（Redis）
- 检查 JWT Token 配置是否正确

### Q3: 某个实例负载过高？

**解决方案**：

```bash
# 1. 查看各实例资源使用
docker stats

# 2. 扩展更多实例
docker compose up -d --scale backend=4

# 3. 调整负载均衡策略（修改 nginx.conf）
# 从 ip_hash 改为 least_conn
```

### Q4: 如何优雅地停止实例？

```bash
# 优雅停止（等待当前请求完成）
docker compose stop backend-1

# 等待 10 秒后强制停止
docker compose stop -t 10 backend-1

# Nginx 会自动将请求转发到其他实例
```

---

## 高级配置

### 自定义负载均衡策略

编辑 [nginx.conf](nginx.conf:7-18)：

```nginx
upstream backend {
    # 轮询（默认）
    # 不添加任何指令

    # 最少连接
    least_conn;

    # IP 哈希
    ip_hash;

    # 加权轮询
    server backend:8000 weight=3;
    server backend-2:8000 weight=1;

    keepalive 32;
}
```

### 配置超时时间

```nginx
# 连接超时
proxy_connect_timeout 60s;

# 发送超时
proxy_send_timeout 60s;

# 读取超时
proxy_read_timeout 60s;
```

---

## 性能优化建议

1. **根据负载调整实例数量**
   ```bash
   # 高峰期增加实例
   docker compose up -d --scale backend=5 --scale frontend=3

   # 低峰期减少实例
   docker compose up -d --scale backend=2 --scale frontend=1
   ```

2. **启用 Nginx 缓存**
   - 已在 [nginx.conf](nginx.conf:41) 中配置
   - 缓存路径：`/var/cache/nginx`

3. **配置限流**
   - API 限流：10 req/s
   - 前端限流：30 req/s

4. **监控和告警**
   - 使用 Portainer 监控容器状态
   - 配置 Prometheus + Grafana

---

## 总结

- ✅ 支持动态扩展/缩容实例
- ✅ IP 哈希实现后端会话保持
- ✅ 自动健康检查和故障转移
- ✅ 简单的命令行管理

更多部署细节，请参考 [Docker 部署文档](../../docs/production-docker.md)。
