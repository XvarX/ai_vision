# 使用 Docker 驱动启动 Minikube

## 前置条件

1. ✅ Docker Desktop 已安装并运行
2. ✅ Docker Desktop 使用 WSL2 后端（推荐）
3. ❌ 不要启用 Docker Desktop 的 Kubernetes

## 检查 Docker 状态

```powershell
# 检查 Docker 是否运行
docker version
docker ps

# 检查 Docker 后端
# 打开 Docker Desktop -> Settings -> General
# 确认 "Use the WSL 2 based engine" 已勾选
```

## 启动 Minikube（使用 Docker 驱动）

```powershell
# 基础启动
minikube start --driver=docker

# 使用国内镜像（推荐，更快）
minikube start --driver=docker --image-mirror-country=cn --image-repository=registry.cn-hangzhou.aliyuncs.com/google_containers

# 指定资源（如果需要）
minikube start --driver=docker --memory=4096 --cpus=2
```

## 验证

```powershell
kubectl get nodes
kubectl get pods -A
```

## 加载镜像

```powershell
# 构建镜像
docker build -f backend/deployconfig/Dockerfile -t ai-vision-backend:latest .
docker build -f frontend/deployconfig/Dockerfile -t ai-vision-frontend:latest .

# 加载到 Minikube（Docker 驱动会自动共享镜像）
# 不需要额外操作！
```

## 常见问题

### Q: 提示 Docker 未运行？
**A:** 确保 Docker Desktop 正在运行

### Q: 镜像拉取慢？
**A:** 使用国内镜像参数（见上面）

### Q: 资源不足？
**A:** 增加内存和 CPU：
```powershell
minikube start --driver=docker --memory=6144 --cpus=4
```
