# 开发环境部署指南

本文档介绍如何在本地搭建 AI Vision 的开发环境。

## 目录

- [前置要求](#前置要求)
- [快速开始](#快速开始)
- [后端设置](#后端设置)
- [前端设置](#前端设置)
- [启动服务](#启动服务)
- [常见问题](#常见问题)

---

## 前置要求

### 必需软件

- **Python**: 3.8 或更高版本
- **Node.js**: 18 或更高版本
- **npm** 或 **yarn**
- **Git**

### 推荐软件

- **VS Code** - 代码编辑器
- **Postman** - API 测试工具

---

## 快速开始

### 1. 克隆项目

```bash
git clone <your-repo-url>
cd ai_vision
```

### 2. 安装后端依赖

```bash
cd backend
pip install -r requirements.txt
```

### 3. 安装前端依赖

```bash
cd frontend
npm install
```

### 4. 配置环境变量

参考[后端设置](#后端设置)和[前端设置](#前端设置)。

### 5. 启动服务

参考[启动服务](#启动服务)。

---

## 后端设置

### 1. 创建虚拟环境（推荐）

```bash
# 1. 进入后端目录
cd backend

# 2. 创建虚拟环境（只需执行一次）
python -m venv venv

# 3. 激活虚拟环境（每次打开终端都需要执行）
venv\Scripts\activate.bat
```

**Windows（PowerShell）**：
```powershell
# 1. 进入后端目录
cd backend

# 2. 创建虚拟环境（只需执行一次）
python -m venv venv

# 3. 激活虚拟环境（每次打开终端都需要执行）
venv\Scripts\Activate.ps1
```

如果 PowerShell 报错，执行：
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Windows（Git Bash）**：
```bash
# 1. 进入后端目录
cd backend

# 2. 创建虚拟环境（只需执行一次）
python -m venv venv

# 3. 激活虚拟环境（每次打开终端都需要执行）
source venv/Scripts/activate
```

**macOS/Linux**：
```bash
# 1. 进入后端目录
cd backend

# 2. 创建虚拟环境（只需执行一次）
python3 -m venv venv

# 3. 激活虚拟环境（每次打开终端都需要执行）
source venv/bin/activate
```

**激活成功后**，终端命令行前会显示 `(venv)`，表示虚拟环境已激活。

### 2. 安装依赖

```bash
pip install -r deployconfig/requirements.txt
```

### 3. 配置环境变量

复制环境变量模板：

```bash
cp deployconfig/.env.example deployconfig/.env
```

编辑 `deployconfig/.env` 文件：

```env
# 数据库配置（开发环境使用 SQLite）
DATABASE_URL=sqlite:///./ai_vision.db

# JWT 密钥（至少 32 位随机字符）
SECRET_KEY=your-development-secret-key-change-this-in-production

# JWT 算法
ALGORITHM=HS256

# Token 过期时间（分钟）
ACCESS_TOKEN_EXPIRE_MINUTES=10080
```

### 4. 初始化数据库

```bash
# 数据库会在第一次启动时自动创建
```

### 5. 验证安装

```bash
python -c "import fastapi; print(f'FastAPI version: {fastapi.__version__}')"
```

---

## 前端设置

### 1. 安装依赖

```bash
cd frontend
npm install
```

### 2. 配置环境变量

复制环境变量模板：

```bash
cp deployconfig/.env.local.example .env.local
```

编辑 `.env.local` 文件：

```env
# 后端 API 地址
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. 验证安装

```bash
npm --version
node --version
```

---

## 启动服务

### 方式一：使用重启脚本（Windows）

项目根目录下的 `restart.bat` 会自动启动前后端：

```bash
restart.bat
```

### 方式二：手动启动

#### 启动后端

**终端 1**：

```bash
cd backend

# 激活虚拟环境（如果使用）
venv\Scripts\activate  # Windows
source venv/bin/activate  # macOS/Linux

# 启动开发服务器
python -m uvicorn app.main:app --reload
```

后端会运行在：http://localhost:8000

API 文档：http://localhost:8000/docs

#### 启动前端

**终端 2**：

```bash
cd frontend
npm run dev
```

前端会运行在：http://localhost:3000

---

## 访问应用

### 前端

打开浏览器访问：http://localhost:3000

### 后端 API 文档

打开浏览器访问：http://localhost:8000/docs

---

## 开发工具

### 后端

- **API 文档**：http://localhost:8000/docs
- **ReDoc 文档**：http://localhost:8000/redoc

### 前端

- **开发服务器**：http://localhost:3000
- **Next.js 调试**：浏览器开发者工具

---

## 常见问题

### 后端问题

#### Q: pip install 失败

```bash
# 尝试升级 pip
pip install --upgrade pip

# 使用国内镜像
pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
```

#### Q: 端口 8000 被占用

```bash
# Windows: 查找占用进程
netstat -ano | findstr :8000

# 结束进程
taskkill /PID <进程ID> /F

# 或使用其他端口
python -m uvicorn app.main:app --reload --port 8001
```

#### Q: 导入错误

```bash
# 确保在 backend 目录下运行
cd backend

# 重新安装依赖
pip install -r requirements.txt --force-reinstall
```

### 前端问题

#### Q: npm install 失败

```bash
# 清除缓存
npm cache clean --force

# 删除 node_modules 重新安装
rm -rf node_modules
npm install

# 使用国内镜像
npm config set registry https://registry.npmmirror.com
```

#### Q: 端口 3000 被占用

```bash
# Windows
netstat -ano | findstr :3000

# 或使用其他端口
npm run dev -- -p 3001
```

#### Q: 无法连接到后端

检查 `frontend/.env.local`：

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

确保后端已启动并且可以访问 http://localhost:8000

---

## 开发建议

### 后端开发

1. **使用虚拟环境**：避免依赖冲突
2. **代码格式化**：
   ```bash
   pip install black
   black .
   ```
3. **类型检查**：
   ```bash
   pip install mypy
   mypy app
   ```

### 前端开发

1. **ESLint**：代码已配置 ESLint
2. **TypeScript**：利用类型系统
3. **热重载**：修改代码后自动刷新

### 数据库

- 开发环境使用 SQLite，无需额外配置
- 数据库文件：`backend/ai_vision.db`
- 如需重置数据库，删除 `ai_vision.db` 文件即可

---

## 调试技巧

### 后端调试

在 VS Code 中创建 `.vscode/launch.json`：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Python: FastAPI",
      "type": "python",
      "request": "launch",
      "module": "uvicorn",
      "args": ["app.main:app", "--reload"],
      "cwd": "${workspaceFolder}/backend",
      "console": "integratedTerminal"
    }
  ]
}
```

### 前端调试

1. 浏览器开发者工具（F12）
2. React DevTools 扩展
3. VS Code 调试器

---

## 下一步

开发环境搭建完成后，你可以：

1. 查看 [API 文档](http://localhost:8000/docs) 了解后端接口
2. 访问 [前端应用](http://localhost:3000) 查看界面
3. 查看 [部署文档](./deployment.md) 了解如何部署到生产环境
