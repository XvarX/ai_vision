# Kubernetes 部署指南

本指南将帮助你将 AI Vision 项目部署到 Kubernetes 集群。

## 📋 目录

- [Kubernetes 基础概念](#kubernetes-基础概念)
- [前置要求](#前置要求)
- [快速开始](#快速开始)
- [详细部署步骤](#详细部署步骤)
- [访问应用](#访问应用)
- [常用操作](#常用操作)
- [故障排查](#故障排查)
- [生产环境优化](#生产环境优化)

---

## 🎯 Kubernetes 基础概念

### 什么是 Kubernetes？

Kubernetes（简称 K8S）是一个容器编排系统，可以理解成是 Docker Compose 的"超级加强版"。

**比喻**：
- **Docker Compose** 就像你在**一台电脑**上管理多个容器
- **Kubernetes** 就像你在**一个机房**里管理成百上千台服务器上的容器

### K8S 核心概念

| 概念 | 作用 | 你的项目对应 |
|------|------|------------|
| **Pod（豆荚）** | 最小部署单元 | 一个 backend 容器 |
| **Deployment（部署）** | 管理 Pod 的副本数量和更新 | 运行 3 个 backend 实例 |
| **Service（服务）** | 提供固定的访问地址 + 负载均衡 | backend Service |
| **Ingress（入口）** | 外部访问的"大门"（路由规则） | 统一入口，路由到不同服务 |
| **ConfigMap** | 存储配置信息（不敏感） | 环境变量、Nginx 配置 |
| **Secret** | 存储敏感信息（密码、密钥） | 数据库密码、JWT 密钥 |
| **PVC（持久卷声明）** | 申请存储空间（数据持久化） | PostgreSQL 数据存储 |
| **Namespace（命名空间）** | 逻辑隔离（不同的"房间"） | ai-vision 命名空间 |

### Deployment vs Service

**Deployment 和 Service 是独立的两个对象，没有谁管理谁的关系！**

```
Deployment (backend)              Service (backend)
     ↓                              ↓
 管理 Pod                      管理访问入口
     ↓                              ↓
 Pod-1 (app=backend) ────┐
 Pod-2 (app=backend) ────┼──→ 通过标签找到 Pod
 Pod-3 (app=backend) ────┘
```

**关键点**：
- **Deployment** 负责"生孩子"（创建和管理 Pod）
- **Service** 负责"给孩子上户口"（提供稳定的访问地址）
- 它们通过**标签（Label）** 松耦合

---

## 📦 前置要求

### 必需软件

1. **kubectl** - Kubernetes 命令行工具
   ```bash
   # Windows (Chocolatey)
   choco install kubernetes-cli

   # macOS
   brew install kubectl

   # Linux
   curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
   sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
   ```

2. **Docker** - 构建镜像
   - [下载 Docker Desktop](https://www.docker.com/products/docker-desktop/)

3. **Kubernetes 集群**（选一个）

   **选项 1：本地开发（推荐新手）**
   - **Minikube**（推荐）
     ```bash
     # Windows
     choco install minikube

     # macOS
     brew install minikube

     # 启动
     minikube start
     ```

   - **Docker Desktop 内置 K8S**
     - 打开 Docker Desktop
     - Settings → Kubernetes → Enable Kubernetes

   **选项 2：云服务商**
   - AWS EKS
   - Google GKE
   - Azure AKS
   - 阿里云 ACK

### 验证安装

```bash
# 检查 kubectl
kubectl version --client

# 检查集群连接
kubectl cluster-info

# 检查节点
kubectl get nodes
```

---

## 🚀 快速开始

### 方式 1：使用部署脚本（推荐）

**Linux/macOS:**
```bash
# 1. 进入项目根目录
cd ai_vision

# 2. 执行部署脚本
chmod +x deployconfig/k8s/deploy.sh
./deployconfig/k8s/deploy.sh
```

**Windows:**
```cmd
# 1. 进入项目根目录
cd e:\space\labspace\ai_vision

# 2. 执行部署脚本
deployconfig\k8s\deploy.bat
```

### 方式 2：手动部署

```bash
# 1. 构建镜像
docker build -f backend/deployconfig/Dockerfile -t ai-vision-backend:latest .
docker build -f frontend/deployconfig/Dockerfile -t ai-vision-frontend:latest .

# 2. 加载镜像到集群（Minikube）
minikube image load ai-vision-backend:latest
minikube image load ai-vision-frontend:latest

# 3. 按顺序部署资源
kubectl apply -f deployconfig/k8s/00-namespace.yaml
kubectl apply -f deployconfig/k8s/01-configmap.yaml
kubectl apply -f deployconfig/k8s/02-secret.yaml
kubectl apply -f deployconfig/k8s/03-pvc.yaml
kubectl apply -f deployconfig/k8s/04-postgresql.yaml
kubectl apply -f deployconfig/k8s/05-backend.yaml
kubectl apply -f deployconfig/k8s/06-frontend.yaml
kubectl apply -f deployconfig/k8s/07-ingress.yaml

# 4. 查看部署状态
kubectl get all -n ai-vision
```

---

## 📝 详细部署步骤

### 步骤 1：创建 Namespace（命名空间）

**文件：** [00-namespace.yaml](../deployconfig/k8s/00-namespace.yaml)

**作用：** 创建一个独立的"房间"，避免与其他项目混淆

```bash
kubectl apply -f deployconfig/k8s/00-namespace.yaml

# 验证
kubectl get namespace ai-vision
```

**输出示例：**
```
NAME        STATUS   AGE
ai-vision   Active   5s
```

---

### 步骤 2：创建 ConfigMap 和 Secret

**文件：**
- [01-configmap.yaml](../deployconfig/k8s/01-configmap.yaml) - 配置信息
- [02-secret.yaml](../deployconfig/k8s/02-secret.yaml) - 敏感信息

**作用：** 分离配置和代码，方便管理

```bash
kubectl apply -f deployconfig/k8s/01-configmap.yaml
kubectl apply -f deployconfig/k8s/02-secret.yaml

# 验证
kubectl get configmap -n ai-vision
kubectl get secret -n ai-vision
```

**重要：** 生产环境请修改密码！
```bash
# 生成新密码
echo -n "你的密码" | base64

# 编辑 Secret
kubectl edit secret ai-vision-secret -n ai-vision
```

---

### 步骤 3：创建 PVC（持久卷声明）

**文件：** [03-pvc.yaml](../deployconfig/k8s/03-pvc.yaml)

**作用：** 向 K8S 申请 10GB 存储空间，用于数据库数据持久化

```bash
kubectl apply -f deployconfig/k8s/03-pvc.yaml

# 验证
kubectl get pvc -n ai-vision
```

**输出示例：**
```
NAME           STATUS   VOLUME                                     CAPACITY   ACCESS MODES
postgres-pvc   Bound    pvc-12345678-1234-1234-1234-123456789abc   10Gi       RWO
```

**说明：**
- `Bound` - 已成功绑定存储
- `RWO` - ReadWriteOnce（单节点读写）

---

### 步骤 4：部署 PostgreSQL

**文件：** [04-postgresql.yaml](../deployconfig/k8s/04-postgresql.yaml)

**作用：** 部署数据库 + 创建 Service

```bash
kubectl apply -f deployconfig/k8s/04-postgresql.yaml

# 等待启动
kubectl wait --for=condition=ready pod -l app=postgres -n ai-vision --timeout=120s

# 验证
kubectl get pods -l app=postgres -n ai-vision
kubectl get svc postgres-service -n ai-vision
```

**输出示例：**
```
NAME                       READY   STATUS    RESTARTS   AGE
postgres-7d9f8c5c6-abc12   1/1     Running   0          30s

NAME                 TYPE        CLUSTER-IP      PORT(S)
postgres-service     ClusterIP   10.96.100.50    5432/TCP
```

---

### 步骤 5：部署 Backend（FastAPI）

**文件：** [05-backend.yaml](../deployconfig/k8s/05-backend.yaml)

**作用：** 部署后端（3 个实例）+ 创建负载均衡 Service

```bash
kubectl apply -f deployconfig/k8s/05-backend.yaml

# 等待启动
kubectl wait --for=condition=ready pod -l app=backend -n ai-vision --timeout=180s

# 验证
kubectl get pods -l app=backend -n ai-vision
kubectl get svc backend-service -n ai-vision
```

**输出示例：**
```
NAME                       READY   STATUS    RESTARTS   AGE
backend-7d9f8c5c6-abc12    1/1     Running   0          30s
backend-7d9f8c5c6-def34    1/1     Running   0          30s
backend-7d9f8c5c6-ghi56    1/1     Running   0          30s

NAME                 TYPE        CLUSTER-IP      PORT(S)
backend-service      ClusterIP   10.96.100.51    8000/TCP
```

**说明：**
- 自动运行 3 个副本（负载均衡）
- 自动健康检查和重启

---

### 步骤 6：部署 Frontend（Next.js）

**文件：** [06-frontend.yaml](../deployconfig/k8s/06-frontend.yaml)

**作用：** 部署前端（2 个实例）+ 创建负载均衡 Service

```bash
kubectl apply -f deployconfig/k8s/06-frontend.yaml

# 等待启动
kubectl wait --for=condition=ready pod -l app=frontend -n ai-vision --timeout=180s

# 验证
kubectl get pods -l app=frontend -n ai-vision
kubectl get svc frontend-service -n ai-vision
```

**输出示例：**
```
NAME                       READY   STATUS    RESTARTS   AGE
frontend-7d9f8c5c6-jkl78   1/1     Running   0          30s
frontend-7d9f8c5c6-mno90   1/1     Running   0          30s

NAME                 TYPE        CLUSTER-IP      PORT(S)
frontend-service     ClusterIP   10.96.100.52    3000/TCP
```

---

### 步骤 7：部署 Ingress（入口路由）

**文件：** [07-ingress.yaml](../deployconfig/k8s/07-ingress.yaml)

**作用：** 配置外部访问规则

```bash
# 先安装 Nginx Ingress Controller（如果未安装）
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml

# 等待 Ingress Controller 就绪
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=120s

# 部署 Ingress
kubectl apply -f deployconfig/k8s/07-ingress.yaml

# 验证
kubectl get ingress -n ai-vision
```

**输出示例：**
```
NAME                 CLASS   HOSTS                       ADDRESS        PORTS
ai-vision-ingress    nginx   aivision.local,            192.168.49.2   80
                             api.aivision.local
```

**配置本地域名（可选）：**
```bash
# 获取 Ingress IP
kubectl get ingress ai-vision-ingress -n ai-vision

# 编辑 /etc/hosts（Linux/macOS）或 C:\Windows\System32\drivers\etc\hosts（Windows）
# 添加：
192.168.49.2 aivision.local api.aivision.local
```

---

## 🌐 访问应用

### 方式 1：通过 Ingress（推荐）

```bash
# 获取 Ingress 地址
kubectl get ingress -n ai-vision

# 浏览器访问
http://aivision.local          # 前端
http://api.aivision.local      # 后端 API
```

### 方式 2：通过 Port Forward（本地开发）

```bash
# 前端
kubectl port-forward -n ai-vision svc/frontend-service 3000:3000
# 访问 http://localhost:3000

# 后端
kubectl port-forward -n ai-vision svc/backend-service 8000:8000
# 访问 http://localhost:8000
```

### 方式 3：Minikube Service

```bash
# 获取前端 URL
minikube service frontend-service -n ai-vision --url

# 获取后端 URL
minikube service backend-service -n ai-vision --url
```

---

## 🔧 常用操作

### 查看资源状态

```bash
# 查看所有资源
kubectl get all -n ai-vision

# 查看 Pod 详情
kubectl describe pod <pod-name> -n ai-vision

# 查看 Service 详情
kubectl describe svc <service-name> -n ai-vision

# 查看 Ingress 详情
kubectl describe ingress ai-vision-ingress -n ai-vision
```

### 查看日志

```bash
# 查看 Backend 日志
kubectl logs -f deployment/backend -n ai-vision

# 查看 Frontend 日志
kubectl logs -f deployment/frontend -n ai-vision

# 查看数据库日志
kubectl logs -f deployment/postgres -n ai-vision

# 查看特定 Pod 的日志
kubectl logs -f <pod-name> -n ai-vision
```

### 扩容/缩容

```bash
# 扩展 Backend 到 5 个实例
kubectl scale deployment backend -n ai-vision --replicas=5

# 扩展 Frontend 到 3 个实例
kubectl scale deployment frontend -n ai-vision --replicas=3

# 查看扩容结果
kubectl get pods -n ai-vision
```

### 更新应用

```bash
# 重新构建镜像
docker build -f backend/deployconfig/Dockerfile -t ai-vision-backend:v2 .
docker build -f frontend/deployconfig/Dockerfile -t ai-vision-frontend:v2 .

# 加载镜像到集群（Minikube）
minikube image load ai-vision-backend:v2
minikube image load ai-vision-frontend:v2

# 更新 Deployment
kubectl set image deployment/backend ai-vision-backend=ai-vision-backend:v2 -n ai-vision
kubectl set image deployment/frontend ai-vision-frontend=ai-vision-frontend:v2 -n ai-vision

# 查看滚动更新状态
kubectl rollout status deployment/backend -n ai-vision
kubectl rollout status deployment/frontend -n ai-vision
```

### 回滚

```bash
# 查看更新历史
kubectl rollout history deployment/backend -n ai-vision

# 回滚到上一版本
kubectl rollout undo deployment/backend -n ai-vision

# 回滚到指定版本
kubectl rollout undo deployment/backend -n ai-vision --to-revision=2
```

### 进入容器

```bash
# 进入 Backend 容器
kubectl exec -it <pod-name> -n ai-vision -- /bin/bash

# 进入数据库容器
kubectl exec -it <pod-name> -n ai-vision -- psql -U aivision -d aivision
```

### 删除资源

```bash
# 删除所有资源（保留 PVC）
kubectl delete -f deployconfig/k8s/07-ingress.yaml
kubectl delete -f deployconfig/k8s/06-frontend.yaml
kubectl delete -f deployconfig/k8s/05-backend.yaml
kubectl delete -f deployconfig/k8s/04-postgresql.yaml
kubectl delete -f deployconfig/k8s/03-pvc.yaml
kubectl delete -f deployconfig/k8s/02-secret.yaml
kubectl delete -f deployconfig/k8s/01-configmap.yaml

# 删除命名空间（删除所有资源）
kubectl delete namespace ai-vision
```

---

## 🔍 故障排查

### Pod 一直 Pending

**原因：** 资源不足或 PVC 未绑定

```bash
# 查看 Pod 详情
kubectl describe pod <pod-name> -n ai-vision

# 查看 PVC 状态
kubectl get pvc -n ai-vision

# 解决方案：检查存储类是否可用
kubectl get storageclass
```

### Pod 一直 CrashLoopBackOff

**原因：** 应用启动失败

```bash
# 查看日志
kubectl logs <pod-name> -n ai-vision

# 查看上一次的日志
kubectl logs <pod-name> -n ai-vision --previous
```

### 无法访问 Service

**原因：** Service 选择器错误

```bash
# 检查 Service 选择器
kubectl get svc <service-name> -n ai-vision -o yaml

# 检查 Pod 标签
kubectl get pods -n ai-vision --show-labels

# 确保标签匹配
```

### Ingress 不工作

**原因：** Ingress Controller 未安装或配置错误

```bash
# 检查 Ingress Controller
kubectl get pods -n ingress-nginx

# 检查 Ingress 配置
kubectl describe ingress ai-vision-ingress -n ai-vision

# 查看 Ingress Controller 日志
kubectl logs -n ingress-nginx <ingress-controller-pod>
```

### 数据库连接失败

**原因：** 环境变量错误或 Service 未就绪

```bash
# 检查数据库 Service
kubectl get svc postgres-service -n ai-vision

# 检查 Backend 环境变量
kubectl exec -it <backend-pod> -n ai-vision -- env | grep DATABASE

# 测试数据库连接
kubectl exec -it <backend-pod> -n ai-vision -- nc -zv postgres-service 5432
```

---

## 🚀 生产环境优化

### 1. 使用 Helm Chart

将应用打包成 Helm Chart，方便管理：

```bash
# 创建 Helm Chart
helm create ai-vision-chart

# 部署
helm install ai-vision ai-vision-chart -n ai-vision

# 升级
helm upgrade ai-vision ai-vision-chart -n ai-vision

# 回滚
helm rollback ai-vision -n ai-vision
```

### 2. 配置 HPA（自动扩缩容）

```bash
# 启用 metrics-server
minikube addons enable metrics-server

# 创建 HPA
kubectl autoscale deployment backend -n ai-vision \
  --cpu-percent=70 \
  --min=3 \
  --max=10

# 查看 HPA 状态
kubectl get hpa -n ai-vision
```

### 3. 配置 Prometheus + Grafana

```bash
# 安装 Prometheus Operator
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install prometheus prometheus-community/kube-prometheus-stack -n monitoring

# 配置 ServiceMonitor
kubectl apply -f deployconfig/k8s/monitoring/
```

### 4. 使用外部数据库

不将数据库部署在 K8S 集群内，而是使用云数据库（RDS）：

```yaml
env:
- name: DATABASE_URL
  value: postgresql://user:pass@external-db.example.com:5432/aivision
```

### 5. 配置 TLS/HTTPS

```bash
# 安装 cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.11.0/cert-manager.yaml

# 创建 ClusterIssuer
kubectl apply -f deployconfig/k8s/cert-manager-clusterissuer.yaml

# 更新 Ingress
kubectl apply -f deployconfig/k8s/07-ingress-tls.yaml
```

### 6. 使用镜像仓库

将镜像推送到镜像仓库（Docker Hub、阿里云等）：

```bash
# 登录镜像仓库
docker login registry.example.com

# 打标签
docker tag ai-vision-backend:latest registry.example.com/ai-vision-backend:v1

# 推送
docker push registry.example.com/ai-vision-backend:v1

# 更新 Deployment 镜像地址
```

### 7. 配置资源配额

```yaml
# resource-quota.yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: ai-vision-quota
  namespace: ai-vision
spec:
  hard:
    requests.cpu: "2"
    requests.memory: 4Gi
    limits.cpu: "4"
    limits.memory: 8Gi
```

---

## 📚 参考资源

- [Kubernetes 官方文档](https://kubernetes.io/docs/)
- [kubectl 命令速查](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
- [Minikube 文档](https://minikube.sigs.k8s.io/docs/)
- [Nginx Ingress Controller](https://kubernetes.github.io/ingress-nginx/)

---

## ❓ 常见问题

### Q: Deployment 和 Service 的区别？

**A:**
- **Deployment** 管理 Pod 的生命周期（创建、更新、重启）
- **Service** 提供稳定的访问地址 + 负载均衡
- 它们是**独立的**，通过标签松耦合

### Q: 为什么要用 Ingress？

**A:**
- Ingress 是外部访问的"大门"
- 统一管理路由规则（域名、路径）
- 支持 TLS/HTTPS、限流、认证等功能

### Q: Pod 重启后数据会丢吗？

**A:**
- 不会！PostgreSQL 使用 PVC 持久化存储
- 即使 Pod 重启或迁移，数据依然存在

### Q: 如何修改配置？

**A:**
```bash
# 编辑 ConfigMap
kubectl edit configmap ai-vision-config -n ai-vision

# 重启 Pod 使配置生效
kubectl rollout restart deployment/backend -n ai-vision
kubectl rollout restart deployment/frontend -n ai-vision
```

---

**🎉 祝你部署顺利！如有问题，请参考故障排查章节。**
