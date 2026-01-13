# 部署配置文件

本目录包含所有部署相关的配置文件。

## 目录结构

```
deployconfig/
├── .env.example              # 环境变量模板（Docker 部署）
├── docker/                   # Docker 部署配置
│   ├── docker-compose.yml    # Docker 编排配置
│   └── nginx.conf            # Nginx 反向代理配置
└── k8s/                      # Kubernetes 部署配置
    ├── backend-deployment.yaml     # 后端 K8s 部署
    ├── frontend-deployment.yaml    # 前端 K8s 部署
    ├── postgres-deployment.yaml    # PostgreSQL K8s 部署
    ├── secrets.yaml               # 密钥配置（不提交到 Git）
    └── configmap.yaml             # 配置项
```

## 使用说明

### Docker 部署

1. 复制环境变量模板：
   ```bash
   cp deployconfig/.env.example .env
   ```

2. 启动服务：
   ```bash
   docker-compose -f deployconfig/docker/docker-compose.yml up -d
   ```

### Kubernetes 部署

1. 配置密钥：
   ```bash
   # 复制并编辑 secrets.yaml
   cp deployconfig/k8s/secrets.yaml.example deployconfig/k8s/secrets.yaml
   ```

2. 部署到 K8s：
   ```bash
   kubectl apply -f deployconfig/k8s/
   ```

## 配置说明

### Docker 配置

- **docker-compose.yml**: 定义前端、后端、数据库、Nginx 服务
- **nginx.conf**: 反向代理和负载均衡配置

### K8s 配置

- **backend-deployment.yaml**: 后端 Deployment、Service、Ingress
- **frontend-deployment.yaml**: 前端 Deployment、Service、Ingress
- **postgres-deployment.yaml**: 数据库 Deployment、Service、PVC
- **secrets.yaml**: 敏感信息（数据库密码、密钥等）
- **configmap.yaml**: 非敏感配置（环境标识、超时等）
