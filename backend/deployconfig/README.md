# 后端配置文件

本目录包含后端服务的所有配置文件。

## 目录结构

```
backend/deployconfig/
├── .env.develop.example       # 开发环境变量模板
├── .env.prodlocal.example     # 本地生产环境变量模板
├── Dockerfile                 # 生产环境 Docker 镜像
├── ecosystem.config.cjs       # PM2 进程管理配置
├── gunicorn.conf.py           # Gunicorn 配置（生产环境）
├── requirements.txt           # 开发环境依赖
├── requirements_prod.txt      # 生产环境依赖
└── README.md                  # 本文件
```

## 文件说明

### 环境变量
- **.env.develop.example**: 开发环境变量模板
  - 使用 SQLite 数据库
- **.env.prodlocal.example**: 本地生产环境变量模板
  - 使用 PostgreSQL 数据库
  - 强密钥配置
- **.env**: 实际使用的环境变量（不提交到 Git）

### 依赖
- **requirements.txt**: 开发环境依赖
- **requirements_prod.txt**: 生产环境依赖（包含开发依赖 + 生产专用）

### Docker
- **Dockerfile**: 生产环境多阶段构建镜像

### 服务器
- **gunicorn.conf.py**: 生产环境进程管理器配置
- **ecosystem.config.cjs**: PM2 进程管理配置（推荐用于生产环境）

## 使用说明

### 开发环境

```bash
cd backend

# 安装依赖
pip install -r deployconfig/requirements.txt

# 配置环境变量（开发环境）
cp deployconfig/.env.develop.example deployconfig/.env

# 运行开发服务器
python -m uvicorn app.main:app --reload
```

### 生产环境

```bash
# Docker 部署
docker build -f backend/deployconfig/Dockerfile -t ai-vision-backend .

# 或使用 Gunicorn
gunicorn app.main:app -c backend/deployconfig/gunicorn.conf.py
```

## 环境变量说明

### 开发环境
参见 `.env.develop.example` 文件：
- DATABASE_URL: SQLite 数据库路径
- SECRET_KEY: JWT 密钥
- ALGORITHM: 加密算法
- ACCESS_TOKEN_EXPIRE_MINUTES: Token 过期时间

### 生产环境
参见 `.env.prodlocal.example` 文件：
- DATABASE_URL: PostgreSQL 连接字符串
- SECRET_KEY: 强随机密钥（生产环境必须修改）
- 其他配置同开发环境
