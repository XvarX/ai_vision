#!/bin/bash
# AI Vision - Kubernetes 部署脚本
# 作用：一键部署所有 K8S 资源

set -e  # 遇到错误立即退出

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 打印信息
info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# ==================== 前置检查 ====================
info "开始部署 AI Vision 到 Kubernetes..."

# 检查 kubectl 是否安装
if ! command -v kubectl &> /dev/null; then
    error "kubectl 未安装，请先安装 kubectl"
fi

info "kubectl 版本: $(kubectl version --client --short 2>/dev/null || echo 'unknown')"

# 检查集群连接
if ! kubectl cluster-info &> /dev/null; then
    error "无法连接到 Kubernetes 集群，请检查 kubeconfig 配置"
fi

info "Kubernetes 集群连接正常"

# ==================== 构建镜像 ====================
info "检查是否需要构建 Docker 镜像..."

# 检查镜像是否已存在
if ! docker images | grep -q "ai-vision-backend"; then
    warn "Backend 镜像不存在，开始构建..."
    docker build -f backend/deployconfig/Dockerfile -t ai-vision-backend:latest . || error "Backend 镜像构建失败"
    info "Backend 镜像构建完成"
else
    info "Backend 镜像已存在，跳过构建"
fi

if ! docker images | grep -q "ai-vision-frontend"; then
    warn "Frontend 镜像不存在，开始构建..."
    docker build -f frontend/deployconfig/Dockerfile -t ai-vision-frontend:latest . || error "Frontend 镜像构建失败"
    info "Frontend 镜像构建完成"
else
    info "Frontend 镜像已存在，跳过构建"
fi

# ==================== 加载镜像到集群（Minikube/Docker Desktop）====================
info "检查是否需要加载镜像到集群..."

if kubectl cluster-info | grep -q "minikube"; then
    info "检测到 Minikube，开始加载镜像..."
    minikube image load ai-vision-backend:latest || warn "镜像加载失败（可能已存在）"
    minikube image load ai-vision-frontend:latest || warn "镜像加载失败（可能已存在）"
    info "镜像加载完成"
elif kubectl cluster-info | grep -q "docker-desktop"; then
    info "检测到 Docker Desktop K8S，镜像自动共享"
else
    warn "非 Minikube/Docker Desktop 环境，请确保镜像已推送到镜像仓库"
    warn "或者手动加载镜像到集群节点"
fi

# ==================== 部署 K8S 资源 ====================
info "开始部署 Kubernetes 资源..."

# 1. 创建命名空间
info "创建命名空间..."
kubectl apply -f deployconfig/k8s/00-namespace.yaml

# 2. 创建配置和密钥
info "创建 ConfigMap 和 Secret..."
kubectl apply -f deployconfig/k8s/01-configmap.yaml
kubectl apply -f deployconfig/k8s/02-secret.yaml

# 3. 创建持久卷
info "创建 PVC..."
kubectl apply -f deployconfig/k8s/03-pvc.yaml

# 4. 部署数据库
info "部署 PostgreSQL..."
kubectl apply -f deployconfig/k8s/04-postgresql.yaml

# 等待数据库就绪
info "等待数据库启动..."
kubectl wait --for=condition=ready pod -l app=postgres -n ai-vision --timeout=120s || warn "数据库启动超时，请手动检查"

# 5. 部署后端
info "部署 Backend..."
kubectl apply -f deployconfig/k8s/05-backend.yaml

# 等待后端就绪
info "等待 Backend 启动..."
kubectl wait --for=condition=ready pod -l app=backend -n ai-vision --timeout=180s || warn "Backend 启动超时，请手动检查"

# 6. 部署前端
info "部署 Frontend..."
kubectl apply -f deployconfig/k8s/06-frontend.yaml

# 等待前端就绪
info "等待 Frontend 启动..."
kubectl wait --for=condition=ready pod -l app=frontend -n ai-vision --timeout=180s || warn "Frontend 启动超时，请手动检查"

# 7. 部署 Ingress
info "部署 Ingress..."
kubectl apply -f deployconfig/k8s/07-ingress.yaml

# ==================== 部署完成 ====================
info "========================================"
info "部署完成！"
info "========================================"
info ""
info "查看所有资源状态："
info "  kubectl get all -n ai-vision"
info ""
info "查看 Pod 日志："
info "  kubectl logs -f deployment/backend -n ai-vision"
info "  kubectl logs -f deployment/frontend -n ai-vision"
info ""
info "获取访问地址："
info "  kubectl get ingress -n ai-vision"
info ""
info "如果是 Minikube，可以使用以下命令获取 URL："
info "  minikube service frontend-service -n ai-vision --url"
info "  minikube service backend-service -n ai-vision --url"
info ""
info "========================================"

# 显示 Pod 状态
info "Pod 状态："
kubectl get pods -n ai-vision

# 显示 Service 状态
info ""
info "Service 状态："
kubectl get svc -n ai-vision

# 显示 Ingress 状态
info ""
info "Ingress 状态："
kubectl get ingress -n ai-vision
