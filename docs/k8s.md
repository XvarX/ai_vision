# Kubernetes 部署指南

本目录包含 AI Vision 后端的 Kubernetes 部署配置文件。

## 文件说明

| 文件 | 说明 |
|------|------|
| `backend-deployment.yaml` | 后端部署配置（Deployment + Service + Ingress） |
| `postgres-deployment.yaml` | PostgreSQL 数据库部署配置 |
| `secrets.yaml` | 敏感信息配置（数据库密码、密钥等） |
| `configmap.yaml` | 非敏感配置（日志级别、环境标识等） |
| `README.md` | 本文件 |

## 部署前准备

### 1. 安装 kubectl

```bash
# macOS
brew install kubectl

# Linux
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Windows (使用 Chocolatey)
choco install kubernetes-cli
```

### 2. 连接到集群

```bash
# 如果使用云平台（Railway/Render/阿里云）
# 按照平台提供的说明下载 kubeconfig 文件

# 验证连接
kubectl cluster-info
kubectl get nodes
```

### 3. 构建并推送 Docker 镜像

```bash
# 构建镜像
docker build -t ai-vision-backend:latest ./backend

# 打标签（替换为你的镜像仓库地址）
docker tag ai-vision-backend:latest your-registry/ai-vision-backend:latest

# 推送到镜像仓库
# Docker Hub
docker push your-registry/ai-vision-backend:latest

# 或阿里云容器镜像服务
docker push registry.cn-hangzhou.aliyuncs.com/your-namespace/ai-vision-backend:latest
```

### 4. 修改配置文件

**backend-deployment.yaml**：
```yaml
image: your-registry/ai-vision-backend:latest  # 修改为你的镜像地址
```

**secrets.yaml**：
```yaml
database-url: "postgresql://user:pass@host:5432/db"  # 修改数据库连接
secret-key: "your-secret-key"  # 修改为强密钥
```

**backend-ingress** (在 backend-deployment.yaml 中)：
```yaml
hosts:
  - api.yourdomain.com  # 修改为你的域名
```

## 部署步骤

### 1. 创建命名空间（推荐）

```bash
kubectl create namespace ai-vision
kubectl config set-context --current --namespace=ai-vision
```

### 2. 部署 Secret

```bash
kubectl apply -f k8s/secrets.yaml
```

### 3. 部署 ConfigMap

```bash
kubectl apply -f k8s/configmap.yaml
```

### 4. 部署 PostgreSQL（如果需要）

```bash
kubectl apply -f k8s/postgres-deployment.yaml

# 等待 PostgreSQL 就绪
kubectl wait --for=condition=ready pod -l app=postgres --timeout=60s
```

### 5. 部署后端

```bash
kubectl apply -f k8s/backend-deployment.yaml
```

### 6. 验证部署

```bash
# 查看 Pod 状态
kubectl get pods

# 查看 Service
kubectl get services

# 查看 Ingress
kubectl get ingress

# 查看日志
kubectl logs -l app=backend --tail=100 -f

# 进入 Pod
kubectl exec -it <pod-name> -- /bin/bash
```

## 扩容

```bash
# 扩容到 5 个副本
kubectl scale deployment backend --replicas=5

# 查看状态
kubectl get pods -l app=backend
```

## 更新部署

```bash
# 更新镜像
kubectl set image deployment/backend backend=new-image:tag

# 或修改文件后重新应用
kubectl apply -f k8s/backend-deployment.yaml

# 查看滚动更新状态
kubectl rollout status deployment/backend

# 如果有问题，回滚
kubectl rollout undo deployment/backend
```

## 调试

```bash
# 查看 Pod 详情
kubectl describe pod <pod-name>

# 查看 Service 详情
kubectl describe service backend-service

# 查看 Ingress 详情
kubectl describe ingress backend-ingress

# 端口转发到本地测试
kubectl port-forward service/backend-service 8000:8000

# 执行命令
kubectl exec <pod-name> -- python -m pytest
```

## 删除部署

```bash
# 删除所有资源
kubectl delete -f k8s/backend-deployment.yaml
kubectl delete -f k8s/postgres-deployment.yaml
kubectl delete -f k8s/secrets.yaml
kubectl delete -f k8s/configmap.yaml

# 或删除整个命名空间
kubectl delete namespace ai-vision
```

## 监控

```bash
# 查看资源使用
kubectl top nodes
kubectl top pods

# 查看事件
kubectl get events --sort-by='.lastTimestamp'
```

## 配置说明

### 资源限制

默认配置：
- **Request**：256Mi 内存，250m CPU（0.25 核）
- **Limit**：512Mi 内存，500m CPU（0.5 核）

根据实际负载调整 `backend-deployment.yaml` 中的 `resources`。

### 健康检查

- **Liveness Probe**：检查容器是否存活，失败会重启
- **Readiness Probe**：检查容器是否就绪，失败会从 Service 中移除

默认检查 `/docs` 端点，可以修改为专用的 `/health` 端点。

### Ingress

需要安装 Ingress Controller（如 nginx-ingress）：

```bash
# 如果使用 Helm
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm install nginx-ingress ingress-nginx/ingress-nginx

# 或使用云平台提供的 Ingress
```

## 安全建议

1. **不要提交 secrets.yaml 到 Git**
   ```bash
   # 添加到 .gitignore
   echo "k8s/secrets.yaml" >> .gitignore
   ```

2. **使用强密钥**
   ```bash
   # 生成随机密钥
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

3. **启用 RBAC**（生产环境）
   - 创建专用的 ServiceAccount
   - 限制 Pod 权限

4. **使用 NetworkPolicy**
   - 限制 Pod 之间的网络通信

5. **定期更新镜像**
   - 修复安全漏洞
   - 更新依赖

## 故障排查

### Pod 无法启动

```bash
# 查看 Pod 状态
kubectl get pods

# 查看 Pod 详情
kubectl describe pod <pod-name>

# 查看日志
kubectl logs <pod-name>
```

### 无法访问 Service

```bash
# 检查 Service Endpoints
kubectl get endpoints backend-service

# 应该看到 Pod IP 列表
```

### Ingress 不工作

```bash
# 检查 Ingress Controller
kubectl get pods -n ingress-nginx

# 检查 DNS 解析
nslookup api.yourdomain.com

# 检查 Ingress 规则
kubectl describe ingress backend-ingress
```

## 生产环境检查清单

- [ ] 修改所有默认密码和密钥
- [ ] 配置 HTTPS/TLS
- [ ] 设置资源限制
- [ ] 配置健康检查
- [ ] 启用日志收集
- [ ] 配置监控和告警
- [ ] 设置自动备份
- [ ] 配置 HPA（Horizontal Pod Autoscaler）
- [ ] 使用持久化存储
- [ ] 配置网络策略
- [ ] 启用审计日志
