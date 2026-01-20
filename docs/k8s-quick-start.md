# 🚀 Docker Desktop K8S 快速开始指南

## 📝 前置准备

1. ✅ 已安装 Docker Desktop
2. ✅ Docker Desktop 正在运行

## 步骤 1：启用 Kubernetes（5 分钟）

### 1.1 打开 Docker Desktop 设置

- 点击系统托盘的 Docker 图标
- 选择 **Settings** (设置)

### 1.2 启用 Kubernetes

1. 左侧菜单找到 **Kubernetes**
2. 勾选 **Enable Kubernetes**
3. 点击 **Apply & Restart**
4. 等待启动（2-3 分钟）

### 1.3 验证安装

打开 PowerShell 或 CMD：

```bash
kubectl version --client
kubectl cluster-info
kubectl get nodes
```

看到 `docker-desktop` 节点就表示成功了！

---

## 步骤 2：部署 AI Vision（10 分钟）

### 方式 1：一键部署（推荐）

```bash
cd e:\space\labspace\ai_vision
deployconfig\k8s\deploy.bat
```

### 方式 2：手动部署

```bash
# 1. 进入项目目录
cd e:\space\labspace\ai_vision

# 2. 构建镜像
docker build -f backend/deployconfig/Dockerfile -t ai-vision-backend:latest .
docker build -f frontend/deployconfig/Dockerfile -t ai-vision-frontend:latest .

# 3. 部署所有资源
kubectl apply -f deployconfig/k8s/00-namespace.yaml
kubectl apply -f deployconfig/k8s/01-configmap.yaml
kubectl apply -f deployconfig/k8s/02-secret.yaml
kubectl apply -f deployconfig/k8s/03-pvc.yaml
kubectl apply -f deployconfig/k8s/04-postgresql.yaml
kubectl apply -f deployconfig/k8s/05-backend.yaml
kubectl apply -f deployconfig/k8s/06-frontend.yaml

# 4. 安装 Ingress Controller（必需，等待 1-2 分钟）
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml

# 等待 Ingress Controller 就绪
kubectl wait --namespace ingress-nginx --for=condition=ready pod --selector=app.kubernetes.io/component=controller --timeout=180s

# 5. 部署 Ingress
kubectl apply -f deployconfig/k8s/07-ingress.yaml
```

---

## 步骤 3：验证部署

```bash
# 查看所有资源
kubectl get all -n ai-vision

# 应该看到：
# - 1 个 postgres Pod
# - 3 个 backend Pod
# - 2 个 frontend Pod
# - 3 个 Service
```

---

## 步骤 4：访问应用

### 方式 1：使用 Port Forward（最简单）

**打开两个终端窗口：**

终端 1 - 启动前端：
```bash
kubectl port-forward -n ai-vision svc/frontend-service 3000:3000
# 访问 http://localhost:3000
```

终端 2 - 启动后端：
```bash
kubectl port-forward -n ai-vision svc/backend-service 8000:8000
# 访问 http://localhost:8000/docs
```

### 方式 2：修改为 NodePort（推荐生产环境）

```bash
# 修改前端 Service
kubectl edit svc frontend-service -n ai-vision
# 将 type: ClusterIP 改为 type: NodePort
# 保存后退出

# 获取访问端口
kubectl get svc frontend-service -n ai-vision
# 输出示例：3000:31234
# 访问 http://localhost:31234
```

---

## 📊 查看状态

```bash
# 查看 Pod 状态
kubectl get pods -n ai-vision

# 查看日志
kubectl logs -f deployment/backend -n ai-vision
kubectl logs -f deployment/frontend -n ai-vision

# 查看服务
kubectl get svc -n ai-vision
```

---

## 🧹 清理资源

```bash
# 删除所有资源
kubectl delete namespace ai-vision

# 删除 Ingress Controller
kubectl delete -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml
```

---

## ⚠️ 常见问题

### Q: Pod 一直 Pending？

**原因**：存储类未配置

**解决**：
```bash
kubectl get storageclass
# 如果没有，创建默认存储类
kubectl apply -f deployconfig/k8s/storage-class.yaml
```

### Q: 无法通过 Ingress 访问？

**原因**：Docker Desktop K8S 的 Ingress 有一些限制

**解决**：使用 Port Forward 或 NodePort（见步骤 4）

### Q: 镜像拉取失败？

**原因**：镜像不存在

**解决**：
```bash
# 确保镜像已构建
docker images | grep ai-vision

# Docker Desktop K8S 会自动共享镜像
```

---

## 📚 更多资源

- **完整文档**：[Kubernetes 部署指南](production-k8s.md)
- **Docker Desktop 指南**：[启用 Docker Desktop K8S](k8s-docker-desktop.md)
- **K8S 配置说明**：[deployconfig/k8s/README.md](../deployconfig/k8s/README.md)

---

## 🎯 下一步

部署成功后，你可以：

1. ✅ 尝试扩容：`kubectl scale deployment backend -n ai-vision --replicas=5`
2. ✅ 查看监控：`kubectl top pods -n ai-vision`
3. ✅ 更新应用：重新构建镜像后执行滚动更新
4. ✅ 学习更多 K8S 命令

---

**🎉 祝你部署顺利！**
