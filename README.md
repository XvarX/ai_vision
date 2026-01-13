# AI Vision - 协作小说平台

一个类似 GitHub 的协作写作平台，作者可以创作主线故事，读者可以 fork 章节创作分支故事，作者可以接纳优秀的分支作品为正史。

## 功能特性

- ✍️ **小说创作**：作者可以创建小说并撰写主线章节
- 🌿 **分支创作**：读者可以对任何章节 fork 创作分支故事
- 🔀 **分支合并**：分支作者可以提交分支，主作者审核后可接纳为正史
- 👥 **用户系统**：完整的用户注册、登录、认证系统
- 📱 **响应式设计**：支持桌面和移动设备

## 技术栈

### 后端
- Python 3.x
- FastAPI - 现代化的 Web 框架
- SQLAlchemy 2.0 - ORM
- SQLite - 开发数据库
- JWT - 用户认证
- Argon2 - 密码哈希

### 前端
- Next.js 15 - React 框架
- TypeScript - 类型安全
- Tailwind CSS - 样式框架
- Axios - HTTP 客户端
- Lucide React - 图标库

## 📦 部署

**🚀 [部署中心](docs/DEPLOYMENT_INDEX.md)** - 查看所有部署方案和详细指南

### 快速部署方案

| 方案 | 难度 | 适用场景 | 指南 |
|------|------|---------|------|
| **Docker** | ⭐⭐ | 单机部署、国内用户 | [docker-compose up -d](docs/DEPLOYMENT.md#docker-部署推荐) |
| **Vercel + Railway** | ⭐ | 零运维、国外用户 | [详细指南](docs/vercel.md) |
| **Kubernetes** | ⭐⭐⭐⭐ | 企业级、高可用 | [详细指南](docs/k8s.md) |

> 💡 **新手推荐**：从 [Docker 部署](docs/DEPLOYMENT.md) 开始

> 📚 **更多文档**：[文档目录](docs/DOCS_STRUCTURE.md)

---

## 快速开始

### 前置要求

- Python 3.8+
- Node.js 18+
- npm 或 yarn

### 后端安装

```bash
cd backend
pip install -r requirements.txt
```

### 配置环境变量

复制 `backend/config/.env.example` 到 `backend/.env`：

```bash
cp backend/config/.env.example backend/.env
```

编辑 `.env` 文件，设置你的配置：

```env
# Database
DATABASE_URL=sqlite:///./ai_vision.db

# Security
SECRET_KEY=your-secret-key-here  # 生产环境请使用强密钥
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
```

### 前端安装

```bash
cd frontend
npm install
```

### 配置前端环境

复制 `frontend/config/.env.local.example` 到 `frontend/.env.local`：

```bash
cp frontend/config/.env.local.example frontend/.env.local
```

### 启动服务

#### 方式一：使用重启脚本（Windows）

```bash
restart.bat
```

#### 方式二：手动启动

**启动后端：**
```bash
cd backend
python -m uvicorn app.main:app --reload
```

**启动前端：**
```bash
cd frontend
npm run dev
```

### 访问应用

- 前端：http://localhost:3000
- 后端 API：http://localhost:8000
- API 文档：http://localhost:8000/docs

## API 文档

启动后端后，访问 http://localhost:8000/docs 查看完整的 API 文档（Swagger UI）。

## 项目结构

```
ai_vision/
├── backend/                 # 后端代码
│   ├── app/
│   │   ├── api/            # API 路由
│   │   ├── core/           # 核心配置
│   │   ├── crud/           # 数据库操作
│   │   ├── models/         # 数据模型
│   │   └── schemas/        # Pydantic 模型
│   └── requirements.txt
├── frontend/               # 前端代码
│   ├── app/               # Next.js 页面
│   ├── components/        # React 组件
│   ├── lib/              # 工具函数
│   └── package.json
├── .gitignore
└── README.md
```

## 核心概念

### 分支类型

- **主线 (main)**：作者创作的主线故事
- **分支 (fork)**：读者基于主线或分支创作的衍生内容
- **已接纳 (merged)**：被作者接纳为正史的分支

### 工作流程

1. 作者创建小说并撰写主线章节
2. 读者可以 fork 任何章节创作分支
3. 分支作者提交分支供审核
4. 小说作者审核分支，可以：
   - **接纳**：分支成为正史的一部分
   - **拒绝**：分支不被接纳
5. 已接纳的分支会显示在主线章节的右侧

### 权限规则

- 只有分支作者才能提交分支
- 分支提交后不能再次提交
- 被拒绝的分支不能重新提交
- 只有小说作者可以审核分支提交

## 安全说明

**重要**：在部署到生产环境之前，请务必：

1. 修改 `.env` 文件中的 `SECRET_KEY` 为强随机密钥
2. 使用 PostgreSQL 替代 SQLite
3. 配置 HTTPS
4. 设置适当的 CORS 策略
5. 不要将 `.env` 文件提交到版本控制

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

