# 📚 文档结构导航

本文档展示 AI Vision 项目的完整文档结构。

## 🗂️ 目录结构

```
ai_vision/
│
├── 📖 README.md                        # ⭐ 项目入口
│   ├── 功能特性
│   ├── 技术栈
│   ├── 📦 部署（入口）
│   ├── 快速开始
│   └── 项目结构
│
├── 🚀 DEPLOYMENT_INDEX.md              # ⭐⭐⭐ 部署中心（必读）
│   ├── 快速导航
│   ├── 🎯 部署场景选择
│   ├── 📋 部署方案一览
│   ├── 📖 详细部署指南
│   │   ├── 方案 A: Docker 全部
│   │   ├── 方案 B: Vercel + Docker
│   │   ├── 方案 C: Vercel + Railway
│   │   └── 方案 D: Kubernetes 全部
│   ├── 🔧 特殊场景
│   ├── 📚 完整文档索引
│   ├── ✅ 部署检查清单
│   └── 🆘 故障排查
│
├── 📋 DEPLOYMENT_SCENARIOS.md          # 场景对照表
│   ├── 所有部署场景
│   ├── 推荐方案
│   ├── 快速选择指南
│   └── 成本对比
│
├── 📘 DEPLOYMENT.md                    # 详细部署指南
│   ├── 部署方案对比
│   ├── Docker 部署
│   ├── 传统服务器部署
│   ├── 云平台部署
│   ├── 性能优化
│   ├── 安全配置
│   ├── 监控和日志
│   └── 故障排查
│
├── 🐳 DOCKER_STANDALONE.md             # Docker 单独部署
│   ├── 快速开始
│   ├── Docker Run 方式
│   ├── Docker Compose 方式
│   ├── 云平台部署
│   ├── 网络配置
│   ├── Nginx 反向代理
│   ├── 容器管理
│   └── 故障排查
│
├── ⚙️ docker-compose.yml              # Docker 编排配置
├── ⚙️ nginx.conf                       # Nginx 反向代理配置
├── ⚙️ .env.example                     # 环境变量模板
│
├── 📁 backend/                         # 后端
│   ├── 📖 README.md
│   ├── 🐳 Dockerfile                   # Docker 镜像配置
│   ├── ⚙️ gunicorn.conf.py             # 生产环境配置
│   ├── 📦 requirements-prod.txt        # 生产依赖
│   ├── ⚙️ .env.example                 # 环境变量模板
│   ├── 📁 app/                         # 源代码
│   │   ├── api/                        # API 路由
│   │   ├── core/                       # 核心配置
│   │   ├── crud/                       # 数据库操作
│   │   ├── models/                     # 数据模型
│   │   └── schemas/                    # Pydantic 模型
│   └── 📦 requirements.txt             # 依赖
│
├── 📁 frontend/                        # 前端
│   ├── 📖 README.md
│   ├── 🐳 Dockerfile                   # Docker 镜像配置
│   ├── ⚙️ vercel.json                  # Vercel 配置
│   ├── ⚙️ .env.local.example           # 环境变量模板
│   ├── ⚙️ .env.vercel.example          # Vercel 环境变量
│   ├── 📘 vercel-deployment-guide.md   # Vercel 部署指南
│   │   ├── 部署方式
│   │   ├── 环境变量配置
│   │   ├── 自定义域名
│   │   ├── 部署命令
│   │   ├── 性能优化
│   │   └── 故障排查
│   ├── 📁 app/                         # Next.js 页面
│   ├── 📁 components/                  # React 组件
│   ├── 📁 lib/                         # 工具函数
│   └── 📦 package.json                 # 依赖
│
└── 📁 k8s/                             # Kubernetes 配置
    ├── 📖 README.md                    # K8s 部署完整指南
    │   ├── 文件说明
    │   ├── 部署前准备
    │   ├── 部署步骤
    │   ├── 扩容
    │   ├── 更新部署
    │   ├── 调试
    │   ├── 删除部署
    │   ├── 监控
    │   ├── 配置说明
    │   ├── 安全建议
    │   └── 故障排查
    ├── ⚙️ frontend-deployment.yaml     # 前端 K8s 配置
    │   ├── Deployment (2 副本)
    │   ├── Service (ClusterIP)
    │   └── Ingress (域名 + HTTPS)
    ├── ⚙️ backend-deployment.yaml      # 后端 K8s 配置
    │   ├── Deployment (3 副本)
    │   ├── Service (ClusterIP)
    │   ├── Service (NodePort)
    │   └── Ingress (域名 + HTTPS)
    ├── ⚙️ postgres-deployment.yaml     # PostgreSQL K8s 配置
    │   ├── Deployment (1 副本)
    │   ├── Service (ClusterIP)
    │   └── PersistentVolumeClaim (10Gi)
    ├── ⚙️ secrets.yaml                  # 密钥配置（不提交）
    └── ⚙️ configmap.yaml               # 配置项
```

---

## 🎯 按需求查找文档

### 我想...

| 需求 | 查看文档 |
|------|---------|
| **快速部署，不想研究** | [DEPLOYMENT_INDEX.md](DEPLOYMENT_INDEX.md) |
| **选择合适的部署方案** | [DEPLOYMENT_INDEX.md - 部署场景选择](DEPLOYMENT_INDEX.md#-部署场景选择) |
| **一键部署（推荐新手）** | [DEPLOYMENT.md - Docker 部署](DEPLOYMENT.md#docker-部署推荐) |
| **前端部署到 Vercel** | [frontend/vercel-deployment-guide.md](frontend/vercel-deployment-guide.md) |
| **后端单独部署** | [DOCKER_STANDALONE.md](DOCKER_STANDALONE.md) |
| **使用 Kubernetes** | [k8s/README.md](k8s/README.md) |
| **了解所有场景** | [DEPLOYMENT_SCENARIOS.md](DEPLOYMENT_SCENARIOS.md) |
| **查看配置文件** | [完整文档索引](DEPLOYMENT_INDEX.md#-完整文档索引) |
| **遇到问题** | [DEPLOYMENT_INDEX.md - 故障排查](DEPLOYMENT_INDEX.md#-故障排查) |

---

## 📖 阅读顺序建议

### 🆕 完全新手

```
1. README.md                    # 了解项目
2. DEPLOYMENT_INDEX.md          # 选择部署方案
3. 对应的详细指南               # 按步骤操作
4. DEPLOYMENT_INDEX.md - 最佳实践  # 优化配置
```

### 🚀 快速部署

```
1. DEPLOYMENT_INDEX.md          # 选择方案
2. 对应的快速开始               # 直接部署
```

### 📚 深入了解

```
1. DEPLOYMENT_SCENARIOS.md      # 了解所有场景
2. DEPLOYMENT.md                # 详细技术细节
3. k8s/README.md                # K8s 高级配置
```

---

## 🔍 常见问题快速定位

| 问题 | 查看文档 |
|------|---------|
| **哪个方案适合我？** | [DEPLOYMENT_INDEX.md - 部署场景选择](DEPLOYMENT_INDEX.md#-部署场景选择) |
| **如何一键启动？** | [DEPLOYMENT.md - Docker 部署](DEPLOYMENT.md#docker-部署推荐) |
| **Vercel 怎么配置？** | [frontend/vercel-deployment-guide.md](frontend/vercel-deployment-guide.md) |
| **Docker 容器怎么管理？** | [DOCKER_STANDALONE.md](DOCKER_STANDALONE.md#容器管理) |
| **K8s 怎么部署？** | [k8s/README.md - 部署步骤](k8s/README.md#部署步骤) |
| **如何配置 HTTPS？** | [DEPLOYMENT.md - 安全配置](DEPLOYMENT.md#安全配置) |
| **数据库怎么连接？** | [DEPLOYMENT_INDEX.md - 环境变量](DEPLOYMENT_INDEX.md#环境变量配置) |
| **怎么扩容？** | [k8s/README.md - 扩容](k8s/README.md#扩容) |
| **部署失败了怎么办？** | [DEPLOYMENT_INDEX.md - 故障排查](DEPLOYMENT_INDEX.md#-故障排查) |

---

## 📊 文档统计

| 类别 | 数量 | 说明 |
|------|------|------|
| **主文档** | 6 | README、部署指南、场景对照等 |
| **配置文件** | 15+ | Docker、K8s、Nginx 等 |
| **子指南** | 4 | Vercel、Docker、K8s 详细指南 |
| **示例文件** | 5 | 环境变量、配置模板等 |

---

## 💡 使用技巧

### 搜索技巧

在项目中搜索关键词：
- `Ctrl+Shift+F` (VS Code) 全局搜索
- 搜索 "DEPLOYMENT" 找所有部署相关文档
- 搜索 "k8s" 找 K8s 相关配置

### 文档链接

所有 Markdown 文档中的链接都是相对路径，点击即可跳转：
- `[DEPLOYMENT.md](DEPLOYMENT.md)` → 链接到部署指南
- `[k8s/README.md](k8s/README.md)` → 链接到 K8s 指南

### 配置文件快速定位

- Docker 相关：搜索 `docker-`
- K8s 相关：搜索 `k8s/`
- Vercel 相关：搜索 `vercel`

---

## 🔄 文档更新记录

- **2025-01-13**: 创建部署中心（DEPLOYMENT_INDEX.md）
- **2025-01-13**: 添加 K8s 前端配置
- **2025-01-13**: 添加 Docker 单独部署指南
- **2025-01-13**: 添加部署场景对照表
- **2025-01-13**: 整合所有文档到统一入口

---

## 📞 需要帮助？

1. **先看文档**：90% 的问题都有文档说明
2. **查看故障排查章节**：每个详细指南都有
3. **提交 Issue**：如果文档无法解决

---

**🎉 现在开始你的部署之旅！** → [部署中心](DEPLOYMENT_INDEX.md)
