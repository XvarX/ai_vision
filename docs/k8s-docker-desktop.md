# 启用 Docker Desktop 的 Kubernetes

本指南将帮助你在 Docker Desktop 中启用并使用 Kubernetes。

## 📋 前置检查

确保你已经安装了 Docker Desktop：
- Windows: 下载 [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/)
- macOS: 下载 [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop/)

## 🚀 启用步骤

### 1. 打开 Docker Desktop 设置

**Windows:**
- 点击系统托盘中的 Docker 图标
- 选择 "Settings"（设置）

**macOS:**
- 点击菜单栏中的 Docker 图标
- 选择 "Preferences"（偏好设置）

### 2. 启用 Kubernetes

1. 在左侧菜单中找到 **"Kubernetes"**
2. 勾选 **"Enable Kubernetes"**（启用 Kubernetes）
3. 点击 **"Apply & Restart"**（应用并重启）

### 3. 等待启动

Docker Desktop 会下载 Kubernetes 组件并启动集群，这可能需要几分钟。

**看到以下状态表示成功：**
- Docker 图标下方显示 "Kubernetes running"
- 状态显示为 "Kubernetes is running"

## ✅ 验证安装

打开终端（Windows 用 PowerShell 或 CMD），运行：

```bash
# 查看 Kubernetes 版本
kubectl version --client

# 查看集群信息
kubectl cluster-info

# 查看节点
kubectl get nodes

# 查看所有命名空间
kubectl get ns
```

**预期输出：**
```
kubectl cluster-info
Kubernetes control plane is running at https://127.0.0.1:6443
CoreDNS is running at https://127.0.0.1:6443/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy

kubectl get nodes
NAME             STATUS   ROLES           AGE   VERSION
docker-desktop   Ready    control-plane   5m    v1.xx.x
```

## 🎯 部署 AI Vision 到 Docker Desktop K8S

### 方式 1：使用部署脚本（推荐）

**Windows:**
```cmd
cd e:\space\labspace\ai_vision
deployconfig\k8s\deploy.bat
```

### 方式 2：手动部署

```bash
# 1. 构建镜像
docker build -f backend/deployconfig/Dockerfile -t ai-vision-backend:latest .
docker build -f frontend/deployconfig/Dockerfile -t ai-vision-frontend:latest .

# 注意：Docker Desktop K8S 会自动共享 Docker 镜像，不需要像 Minikube 那样手动加载

# 2. 按顺序部署资源
kubectl apply -f deployconfig/k8s/00-namespace.yaml
kubectl apply -f deployconfig/k8s/01-configmap.yaml
kubectl apply -f deployconfig/k8s/02-secret.yaml
kubectl apply -f deployconfig/k8s/03-pvc.yaml
kubectl apply -f deployconfig/k8s/04-postgresql.yaml
kubectl apply -f deployconfig/k8s/05-backend.yaml
kubectl apply -f deployconfig/k8s/06-frontend.yaml

# 3. 安装 Ingress Controller（必需）
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml

# 等待 Ingress Controller 启动（可能需要 1-2 分钟）
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=120s

# 4. 部署 Ingress（注意：Docker Desktop K8S 有一些限制，建议使用 NodePort）
kubectl apply -f deployconfig/k8s/07-ingress.yaml
```

## 🌐 访问应用

### Docker Desktop K8S 的特殊情况

Docker Desktop 的 Kubernetes 有一些限制，**Ingress 可能无法直接使用域名访问**。推荐使用以下方式：

### 方式 1：使用 Port Forward（最简单）

```bash
# 前端
kubectl port-forward -n ai-vision svc/frontend-service 3000:3000
# 访问 http://localhost:3000

# 后端
kubectl port-forward -n ai-vision svc/backend-service 8000:8000
# 访问 http://localhost:8000
```

**提示**：在两个不同的终端窗口分别运行，这样前后端可以同时访问。

### 方式 2：修改 Service 为 NodePort（推荐）

创建一个临时配置文件：

```bash
# 获取前端服务的 URL
kubectl get svc frontend-service -n ai-vision
```

如果你想通过 NodePort 访问，需要修改 Service 类型：

```bash
# 编辑前端 Service
kubectl edit svc frontend-service -n ai-vision
# 将 type: ClusterIP 改为 type: NodePort
# 保存后退出
```

然后访问：
```bash
# 获取 NodePort
kubectl get svc frontend-service -n ai-vision
# 输出示例：
# NAME               TYPE       PORT(S)
# frontend-service   NodePort   3000:31234/TCP
# 访问 http://localhost:31234
```

### 方式 3：使用 Docker Desktop 的网络（高级）

由于 Docker Desktop K8S 的特殊性，Ingress 地址可能是 `localhost`，你需要：

```bash
# 查看 Ingress
kubectl get ingress -n ai-vision

# 查看 Ingress Controller 的服务
kubectl get svc -n ingress-nginx

# 如果是 NodePort 类型，找到端口
# 然后访问 http://localhost:<端口>
```

## 🔍 常用命令

```bash
# 查看所有资源
kubectl get all -n ai-vision

# 查看 Pod 日志
kubectl logs -f deployment/backend -n ai-vision

# 进入容器
kubectl exec -it <pod-name> -n ai-vision -- /bin/bash

# 扩容
kubectl scale deployment backend -n ai-vision --replicas=5

# 删除所有资源
kubectl delete namespace ai-vision
```

## ⚠️ Docker Desktop K8S 的限制

1. **单节点集群**：只有一个节点（docker-desktop）
2. **存储限制**：PVC 可能需要手动配置存储类
3. **Ingress 限制**：可能需要额外的配置才能使用域名
4. **资源限制**：受限于宿主机资源

## 🛠️ 故障排查

### PVC 一直 Pending

**原因**：Docker Desktop K8S 默认可能没有存储类。

**解决方案**：
```bash
# 查看可用的存储类
kubectl get storageclass

# 如果没有，创建一个
kubectl apply -f - <<EOF
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: standard
provisioner: docker.io/hostpath
parameters:
  type: local
EOF

# 设置为默认
kubectl patch storageclass standard -p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'
```

### Ingress 无法访问

**解决方案**：使用 Port Forward 或 NodePort（见上文）

### Pod 无法拉取镜像

**原因**：镜像不存在。

**解决方案**：
```bash
# 确保镜像已构建
docker images | grep ai-vision

# Docker Desktop K8S 会自动共享镜像，无需手动加载
```

## 📚 下一步

启用 Kubernetes 后，你可以：

1. ✅ 部署 AI Vision 项目
2. ✅ 学习 K8S 命令
3. ✅ 尝试扩容、更新应用
4. ✅ 配置监控和日志

**详细文档**：[Kubernetes 部署指南](production-k8s.md)

---

**🎉 现在你可以在本地体验 Kubernetes 了！**
