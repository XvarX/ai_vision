# 后端配置文件

本目录包含后端服务的所有配置文件。

## 目录结构

```
backend/deployconfig/
├── .env.example           # 环境变量模板
├── Dockerfile             # 生产环境 Docker 镜像
├── gunicorn.conf.py       # Gunicorn 配置（生产环境）
├── requirements.txt       # 开发环境依赖
├── requirements_prod.txt  # 生产环境依赖
└── README.md              # 本文件
```

## 文件说明

### 环境变量
- **.env.example**: 环境变量模板
  - 开发环境：使用 SQLite
  - 生产环境：修改为 PostgreSQL
- **.env**: 实际使用的环境变量（不提交到 Git）

### 依赖
- **requirements.txt**: 开发环境依赖
- **requirements_prod.txt**: 生产环境依赖（包含开发依赖 + 生产专用）

### Docker
- **Dockerfile**: 生产环境多阶段构建镜像

### 服务器
- **gunicorn.conf.py**: 生产环境进程管理器配置

## 使用说明

### 开发环境

```bash
cd backend

# 安装依赖
pip install -r deployconfig/requirements.txt

# 配置环境变量
cp deployconfig/.env.example deployconfig/.env

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

参见 `.env.example` 文件中的注释。
