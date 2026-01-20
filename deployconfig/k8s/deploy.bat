@echo off
REM AI Vision - Kubernetes 部署脚本 (Windows)
REM 作用：一键部署所有 K8S 资源

setlocal enabledelayedexpansion

echo ========================================
echo AI Vision - Kubernetes 部署脚本
echo ========================================
echo.

REM ==================== 前置检查 ====================
echo [INFO] 开始部署 AI Vision 到 Kubernetes...

REM 检查 kubectl 是否安装
where kubectl >nul 2>nul
if errorlevel 1 (
    echo [ERROR] kubectl 未安装，请先安装 kubectl
    exit /b 1
)

for /f "tokens=*" %%i in ('kubectl version --client --short 2^>nul') do set KUBECTL_VERSION=%%i
echo [INFO] kubectl 版本: %KUBECTL_VERSION%

REM 检查集群连接
kubectl cluster-info >nul 2>nul
if errorlevel 1 (
    echo [ERROR] 无法连接到 Kubernetes 集群，请检查 kubeconfig 配置
    exit /b 1
)

echo [INFO] Kubernetes 集群连接正常

REM ==================== 构建镜像 ====================
echo [INFO] 检查是否需要构建 Docker 镜像...

docker images | findstr "ai-vision-backend" >nul
if errorlevel 1 (
    echo [WARN] Backend 镜像不存在，开始构建...
    docker build -f backend/deployconfig/Dockerfile -t ai-vision-backend:latest .
    if errorlevel 1 (
        echo [ERROR] Backend 镜像构建失败
        exit /b 1
    )
    echo [INFO] Backend 镜像构建完成
) else (
    echo [INFO] Backend 镜像已存在，跳过构建
)

docker images | findstr "ai-vision-frontend" >nul
if errorlevel 1 (
    echo [WARN] Frontend 镜像不存在，开始构建...
    docker build -f frontend/deployconfig/Dockerfile -t ai-vision-frontend:latest .
    if errorlevel 1 (
        echo [ERROR] Frontend 镜像构建失败
        exit /b 1
    )
    echo [INFO] Frontend 镜像构建完成
) else (
    echo [INFO] Frontend 镜像已存在，跳过构建
)

REM ==================== 加载镜像到集群（Minikube/Docker Desktop）====================
echo [INFO] 检查是否需要加载镜像到集群...

kubectl cluster-info | findstr "minikube" >nul
if not errorlevel 1 (
    echo [INFO] 检测到 Minikube，开始加载镜像...
    minikube image load ai-vision-backend:latest
    minikube image load ai-vision-frontend:latest
    echo [INFO] 镜像加载完成
) else (
    kubectl cluster-info | findstr "docker-desktop" >nul
    if not errorlevel 1 (
        echo [INFO] 检测到 Docker Desktop K8S，镜像自动共享
    ) else (
        echo [WARN] 非 Minikube/Docker Desktop 环境，请确保镜像已推送到镜像仓库
    )
)

REM ==================== 部署 K8S 资源 ====================
echo [INFO] 开始部署 Kubernetes 资源...

REM 1. 创建命名空间
echo [INFO] 创建命名空间...
kubectl apply -f deployconfig/k8s/00-namespace.yaml

REM 2. 创建配置和密钥
echo [INFO] 创建 ConfigMap 和 Secret...
kubectl apply -f deployconfig/k8s/01-configmap.yaml
kubectl apply -f deployconfig/k8s/02-secret.yaml

REM 3. 创建持久卷
echo [INFO] 创建 PVC...
kubectl apply -f deployconfig/k8s/03-pvc.yaml

REM 4. 部署数据库
echo [INFO] 部署 PostgreSQL...
kubectl apply -f deployconfig/k8s/04-postgresql.yaml

REM 等待数据库就绪
echo [INFO] 等待数据库启动...
timeout /t 5 /nobreak >nul

REM 5. 部署后端
echo [INFO] 部署 Backend...
kubectl apply -f deployconfig/k8s/05-backend.yaml

REM 等待后端就绪
echo [INFO] 等待 Backend 启动...
timeout /t 5 /nobreak >nul

REM 6. 部署前端
echo [INFO] 部署 Frontend...
kubectl apply -f deployconfig/k8s/06-frontend.yaml

REM 等待前端就绪
echo [INFO] 等待 Frontend 启动...
timeout /t 5 /nobreak >nul

REM 7. 部署 Ingress
echo [INFO] 部署 Ingress...
kubectl apply -f deployconfig/k8s/07-ingress.yaml

REM ==================== 部署完成 ====================
echo.
echo ========================================
echo 部署完成！
echo ========================================
echo.
echo 查看所有资源状态：
echo   kubectl get all -n ai-vision
echo.
echo 查看 Pod 日志：
echo   kubectl logs -f deployment/backend -n ai-vision
echo   kubectl logs -f deployment/frontend -n ai-vision
echo.
echo 获取访问地址：
echo   kubectl get ingress -n ai-vision
echo.
echo 如果是 Minikube，可以使用以下命令获取 URL：
echo   minikube service frontend-service -n ai-vision --url
echo   minikube service backend-service -n ai-vision --url
echo.
echo ========================================

REM 显示 Pod 状态
echo.
echo [INFO] Pod 状态：
kubectl get pods -n ai-vision

REM 显示 Service 状态
echo.
echo [INFO] Service 状态：
kubectl get svc -n ai-vision

REM 显示 Ingress 状态
echo.
echo [INFO] Ingress 状态：
kubectl get ingress -n ai-vision

endlocal
