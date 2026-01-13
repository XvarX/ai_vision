# 配置文件整理总结

## ✅ 完成的整理

### 目录结构

```
ai_vision/
│
├── deployconfig/              # 部署配置（统一管理）
│   ├── README.md              # 配置说明
│   ├── .env.example           # Docker 环境变量模板
│   ├── docker/                # Docker 部署配置
│   │   ├── docker-compose.yml
│   │   └── nginx.conf
│   └── k8s/                   # Kubernetes 部署配置
│       ├── backend-deployment.yaml
│       ├── frontend-deployment.yaml
│       ├── postgres-deployment.yaml
│       ├── secrets.yaml
│       └── configmap.yaml
│
├── backend/
│   ├── config/                # 后端配置
│   │   ├── README.md
│   │   ├── .env.example
│   │   └── gunicorn.conf.py
│   └── Dockerfile             # 已更新 gunicorn 路径
│
└── frontend/
    ├── config/                # 前端配置
    │   ├── README.md
    │   ├── .env.local.example
    │   └── vercel.json
    └── Dockerfile
```

## 📝 更新的文件

### 主文件
- [x] **README.md** - 更新了配置文件路径
- [x] **.gitignore** - 更新了 k8s secrets 路径

### Docker
- [x] **backend/Dockerfile** - 更新 `gunicorn.conf.py` 路径为 `config/gunicorn.conf.py`

### 配置说明
- [x] **deployconfig/README.md** - 部署配置说明
- [x] **backend/config/README.md** - 后端配置说明
- [x] **frontend/config/README.md** - 前端配置说明

## 🔧 路径变更

### 之前 → 现在

| 配置 | 旧路径 | 新路径 |
|------|--------|--------|
| **Docker Compose** | `docker-compose.yml` | `deployconfig/docker/docker-compose.yml` |
| **Nginx** | `nginx.conf` | `deployconfig/docker/nginx.conf` |
| **K8s 后端** | `k8s/backend-deployment.yaml` | `deployconfig/k8s/backend-deployment.yaml` |
| **K8s 前端** | `k8s/frontend-deployment.yaml` | `deployconfig/k8s/frontend-deployment.yaml` |
| **K8s 数据库** | `k8s/postgres-deployment.yaml` | `deployconfig/k8s/postgres-deployment.yaml` |
| **K8s Secrets** | `k8s/secrets.yaml` | `deployconfig/k8s/secrets.yaml` |
| **K8s ConfigMap** | `k8s/configmap.yaml` | `deployconfig/k8s/configmap.yaml` |
| **后端 .env** | `backend/.env.example` | `backend/config/.env.example` |
| **后端 Gunicorn** | `backend/gunicorn.conf.py` | `backend/config/gunicorn.conf.py` |
| **前端 Vercel** | `frontend/vercel.json` | `frontend/config/vercel.json` |
| **前端 .env** | `frontend/.env.local.example` | `frontend/config/.env.local.example` |
| **根目录 .env** | `.env.example` | `deployconfig/.env.example` |

## 🚀 使用方法

### Docker 部署

```bash
# 1. 复制环境变量
cp deployconfig/.env.example .env

# 2. 编辑 .env 文件
nano .env

# 3. 启动
docker-compose -f deployconfig/docker/docker-compose.yml up -d
```

### Kubernetes 部署

```bash
# 1. 配置 secrets
cp deployconfig/k8s/secrets.yaml.example deployconfig/k8s/secrets.yaml
nano deployconfig/k8s/secrets.yaml

# 2. 部署
kubectl apply -f deployconfig/k8s/
```

### 开发环境

```bash
# 后端
cp backend/config/.env.example backend/.env
cd backend
python -m uvicorn app.main:app --reload

# 前端
cp frontend/config/.env.local.example frontend/.env.local
cd frontend
npm run dev
```

## ✨ 优势

1. **清晰分类**：所有配置按用途分类（deployconfig, backend/config, frontend/config）
2. **易于维护**：配置文件集中管理，不会散落在各处
3. **路径一致**：所有组件的配置都在各自的 `config/` 目录
4. **文档完善**：每个配置目录都有 README 说明
