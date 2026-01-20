# Kubernetes 配置文件说明

本目录包含 AI Vision 项目的 Kubernetes 部署配置文件。

## 📁 配置文件结构

```
k8s/
├── 00-namespace.yaml          # 命名空间（创建独立的"房间"）
├── 01-configmap.yaml          # 配置地图（存储不敏感的配置）
├── 02-secret.yaml             # 密钥（存储密码和敏感信息）
├── 03-pvc.yaml                # 持久卷声明（申请存储空间）
├── 04-postgresql.yaml         # PostgreSQL 数据库部署
├── 05-backend.yaml            # Backend (FastAPI) 部署
├── 06-frontend.yaml           # Frontend (Next.js) 部署
├── 07-ingress.yaml            # Ingress 入口路由配置
├── deploy.sh                  # Linux/macOS 部署脚本
└── deploy.bat                 # Windows 部署脚本
```

## 🚀 快速开始

### 方式 1：使用部署脚本（推荐）

**Windows:**
```cmd
deploy.bat
```

**Linux/macOS:**
```bash
chmod +x deploy.sh
./deploy.sh
```

### 方式 2：手动部署

```bash
# 1. 构建镜像
docker build -f backend/deployconfig/Dockerfile -t ai-vision-backend:latest .
docker build -f frontend/deployconfig/Dockerfile -t ai-vision-frontend:latest .

# 2. 加载镜像到集群（Minikube）
minikube image load ai-vision-backend:latest
minikube image load ai-vision-frontend:latest

# 3. 按顺序部署
kubectl apply -f 00-namespace.yaml
kubectl apply -f 01-configmap.yaml
kubectl apply -f 02-secret.yaml
kubectl apply -f 03-pvc.yaml
kubectl apply -f 04-postgresql.yaml
kubectl apply -f 05-backend.yaml
kubectl apply -f 06-frontend.yaml
kubectl apply -f 07-ingress.yaml

# 4. 查看状态
kubectl get all -n ai-vision
```

## 📖 配置文件说明

### 00-namespace.yaml
**作用：** 创建命名空间 `ai-vision`
**为什么需要：** 将项目与其他项目隔离，避免资源冲突

```yaml
# 创建命名空间后，所有资源都会部署在这个空间内
kubectl get namespace ai-vision
```

---

### 01-configmap.yaml
**作用：** 存储配置信息（环境变量、Nginx 配置等）
**为什么需要：** 配置和代码分离，方便修改

**包含内容：**
- 数据库配置（用户名、数据库名）
- JWT 配置
- Nginx 配置文件

```yaml
# 查看配置
kubectl get configmap ai-vision-config -n ai-vision -o yaml
```

---

### 02-secret.yaml
**作用：** 存储敏感信息（密码、密钥）
**为什么需要：** 安全存储，避免明文暴露

**包含内容：**
- `POSTGRES_PASSWORD` - 数据库密码（默认：changeme）
- `SECRET_KEY` - JWT 密钥

⚠️ **生产环境请务必修改密码！**

```bash
# 生成新密码
echo -n "你的密码" | base64

# 编辑 Secret
kubectl edit secret ai-vision-secret -n ai-vision
```

---

### 03-pvc.yaml
**作用：** 向 K8S 申请 10GB 存储空间
**为什么需要：** 数据库数据需要持久化，Pod 重启不丢失数据

```yaml
# 查看 PVC 状态
kubectl get pvc -n ai-vision

# 输出示例：
# NAME           STATUS   VOLUME                                     CAPACITY
# postgres-pvc   Bound    pvc-12345678-1234-1234-1234-123456789abc   10Gi
```

**状态说明：**
- `Bound` - 已成功绑定存储 ✅
- `Pending` - 等待绑定（可能没有可用的存储类）❌

---

### 04-postgresql.yaml
**作用：** 部署 PostgreSQL 数据库
**包含：**
- **Deployment** - 管理 1 个数据库 Pod
- **Service** - 提供访问地址 `postgres-service:5432`

**关键配置：**
- 副本数：1（数据库通常只运行 1 个）
- 持久化：使用 PVC 存储数据
- 健康检查：自动重启不健康的 Pod

```bash
# 查看 Pod 状态
kubectl get pods -l app=postgres -n ai-vision

# 查看 Service
kubectl get svc postgres-service -n ai-vision

# 进入数据库
kubectl exec -it <postgres-pod-name> -n ai-vision -- psql -U aivision -d aivision
```

---

### 05-backend.yaml
**作用：** 部署 FastAPI 后端服务
**包含：**
- **Deployment** - 管理 3 个后端 Pod（负载均衡）
- **Service** - 提供访问地址 `backend-service:8000`

**关键配置：**
- 副本数：3（可以动态扩缩容）
- 资源限制：内存 512Mi，CPU 500m
- 健康检查：自动重启不健康的 Pod

```bash
# 查看 Pod 状态
kubectl get pods -l app=backend -n ai-vision

# 扩容到 5 个实例
kubectl scale deployment backend -n ai-vision --replicas=5

# 查看日志
kubectl logs -f deployment/backend -n ai-vision
```

---

### 06-frontend.yaml
**作用：** 部署 Next.js 前端服务
**包含：**
- **Deployment** - 管理 2 个前端 Pod（负载均衡）
- **Service** - 提供访问地址 `frontend-service:3000`

**关键配置：**
- 副本数：2（可以动态扩缩容）
- 资源限制：内存 256Mi，CPU 250m

```bash
# 查看 Pod 状态
kubectl get pods -l app=frontend -n ai-vision

# 扩容到 3 个实例
kubectl scale deployment frontend -n ai-vision --replicas=3
```

---

### 07-ingress.yaml
**作用：** 配置外部访问入口（路由规则）
**功能：**
- 域名路由：`aivision.local` → Frontend，`api.aivision.local` → Backend
- 负载均衡
- 支持 HTTPS（需配置 TLS）

**前置要求：** 需要先安装 Nginx Ingress Controller

```bash
# 安装 Ingress Controller（如果未安装）
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml

# 查看 Ingress
kubectl get ingress -n ai-vision

# 获取访问地址
kubectl describe ingress ai-vision-ingress -n ai-vision
```

**配置本地域名（可选）：**
```bash
# 获取 Ingress IP
kubectl get ingress ai-vision-ingress -n ai-vision

# 编辑 hosts 文件
# Windows: C:\Windows\System32\drivers\etc\hosts
# Linux/macOS: /etc/hosts
# 添加：
192.168.49.2 aivision.local api.aivision.local
```

---

## 🔧 常用命令

### 查看资源状态
```bash
# 查看所有资源
kubectl get all -n ai-vision

# 查看 Pod
kubectl get pods -n ai-vision

# 查看 Service
kubectl get svc -n ai-vision

# 查看 Ingress
kubectl get ingress -n ai-vision

# 查看 PVC
kubectl get pvc -n ai-vision
```

### 查看日志
```bash
# Backend 日志
kubectl logs -f deployment/backend -n ai-vision

# Frontend 日志
kubectl logs -f deployment/frontend -n ai-vision

# 数据库日志
kubectl logs -f deployment/postgres -n ai-vision
```

### 扩容/缩容
```bash
# Backend 扩容到 5 个实例
kubectl scale deployment backend -n ai-vision --replicas=5

# Frontend 扩容到 3 个实例
kubectl scale deployment frontend -n ai-vision --replicas=3
```

### 更新应用
```bash
# 重新构建镜像
docker build -f backend/deployconfig/Dockerfile -t ai-vision-backend:v2 .

# 更新 Deployment
kubectl set image deployment/backend ai-vision-backend=ai-vision-backend:v2 -n ai-vision

# 查看更新状态
kubectl rollout status deployment/backend -n ai-vision
```

### 进入容器
```bash
# 进入 Backend 容器
kubectl exec -it <backend-pod-name> -n ai-vision -- /bin/bash

# 进入数据库容器
kubectl exec -it <postgres-pod-name> -n ai-vision -- psql -U aivision -d aivision
```

### 删除资源
```bash
# 删除所有资源
kubectl delete namespace ai-vision

# 或者逐个删除
kubectl delete -f 07-ingress.yaml
kubectl delete -f 06-frontend.yaml
kubectl delete -f 05-backend.yaml
kubectl delete -f 04-postgresql.yaml
kubectl delete -f 03-pvc.yaml
kubectl delete -f 02-secret.yaml
kubectl delete -f 01-configmap.yaml
kubectl delete -f 00-namespace.yaml
```

---

## 📚 详细文档

完整的使用指南请参考：[Kubernetes 部署指南](../../docs/production-k8s.md)

---

## ⚠️ 注意事项

1. **生产环境请修改密码！**
   - 编辑 `02-secret.yaml`
   - 或使用 `kubectl edit secret ai-vision-secret -n ai-vision`

2. **确保镜像已推送到镜像仓库**
   - 或使用 `minikube image load` 加载本地镜像

3. **安装 Ingress Controller**
   - 否则 Ingress 无法工作

4. **配置域名或使用 Port Forward**
   - 生产环境配置域名和 HTTPS
   - 开发环境可以使用 Port Forward

5. **监控资源使用**
   - 使用 `kubectl top pods -n ai-vision` 查看
   - 合理配置资源限制

---

**🎯 现在你已经了解了所有配置文件的作用！开始部署吧！**
