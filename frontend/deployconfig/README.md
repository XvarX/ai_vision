# 前端配置文件

本目录包含前端应用的配置文件。

## 目录结构

```
frontend/
├── .env.local              # 本地环境变量（不提交）
├── deployconfig/           # 配置文件目录
│   ├── .env.local.example  # 环境变量模板
│   ├── .env.vercel.example # Vercel 环境变量
│   ├── Dockerfile          # Docker 镜像
│   ├── ecosystem.config.cjs# PM2 进程管理配置
│   ├── vercel.json         # Vercel 配置
│   └── README.md
├── package.json            # 依赖
├── tsconfig.json           # TS 配置
└── next.config.js          # Next.js 配置
```

## 文件说明

### 环境变量
- **deployconfig/.env.local.example**: 环境变量模板
- **.env.local**: 实际使用的本地环境变量（不提交到 Git）

### 部署配置
- **deployconfig/Dockerfile**: 生产环境 Docker 镜像
- **deployconfig/vercel.json**: Vercel 平台部署配置
- **deployconfig/ecosystem.config.cjs**: PM2 进程管理配置（推荐用于生产环境）

## 使用说明

### 本地开发

```bash
cd frontend

# 安装依赖
npm install

# 配置环境变量
cp deployconfig/.env.local.example .env.local

# 启动开发服务器
npm run dev
```

### 部署到 Vercel

```bash
# 安装 Vercel CLI
npm install -g vercel

# 部署
vercel
```

在 Vercel 控制台设置环境变量：
- `NEXT_PUBLIC_API_URL`: 后端 API 地址

### 本地生产环境（使用 PM2）

```bash
cd frontend

# 安装依赖
npm install

# 配置环境变量
cp deployconfig/.env.local.example .env.local

# 构建生产版本
npm run build

# 使用 PM2 启动
pm2 start deployconfig/ecosystem.config.cjs
pm2 save
pm2 startup
```

**PM2 配置说明**：
- `script`: 使用 `npm` 命令
- `args`: 执行 `npm start`（启动生产环境构建）
- `cwd`: 工作目录
- `autorestart`: 自动重启
- `max_memory_restart`: 内存超过 1G 时重启

### Docker 部署

```bash
# 构建镜像
docker build -f frontend/deployconfig/Dockerfile -t ai-vision-frontend .

# 运行容器
docker run -p 3000:3000 ai-vision-frontend
```

## 环境变量说明

### NEXT_PUBLIC_API_URL

后端 API 的地址。

- **开发环境**: `http://localhost:8000`
- **生产环境**: 你的后端服务地址（如 `https://api.example.com`）

注意：所有以 `NEXT_PUBLIC_` 开头的变量都会暴露到浏览器中，不要存储敏感信息。
