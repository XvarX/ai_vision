# 部署场景总览

本文档列出 AI Vision 的所有部署场景和对应的配置文件。

## 📋 部署场景对照表

| 场景 | 前端 | 后端 | 数据库 | 配置文件 | 指南 | 难度 |
|------|------|------|--------|---------|------|------|
| **1. 开发环境** | 本地 | 本地 | SQLite | [.env.example](backend/.env.example)<br>[.env.local.example](frontend/.env.local.example) | [README.md](README.md) | ⭐ |
| **2. 本地生产** | 本地 | 本地 | PostgreSQL | [gunicorn.conf.py](backend/gunicorn.conf.py)<br>[requirements-prod.txt](backend/requirements-prod.txt) | [DEPLOYMENT.md](DEPLOYMENT.md) | ⭐⭐ |
| **3. Docker 全部** | Docker | Docker | Docker | [docker-compose.yml](docker-compose.yml)<br>[nginx.conf](nginx.conf) | [DEPLOYMENT.md](DEPLOYMENT.md) | ⭐⭐ |
| **4. K8s 全部** | K8s | K8s | K8s | [k8s/frontend-deployment.yaml](k8s/frontend-deployment.yaml)<br>[k8s/backend-deployment.yaml](k8s/backend-deployment.yaml) | [k8s/README.md](k8s/README.md) | ⭐⭐⭐⭐ |
| **5. Vercel + Docker** | Vercel | Docker | 自建 | [vercel.json](frontend/vercel.json) | [DOCKER_STANDALONE.md](DOCKER_STANDALONE.md) | ⭐⭐⭐ |
| **6. Vercel + K8s** | Vercel | K8s | K8s | [vercel.json](frontend/vercel.json)<br>[k8s/backend-deployment.yaml](k8s/backend-deployment.yaml) | [k8s/README.md](k8s/README.md) | ⭐⭐⭐⭐ |
| **7. Vercel + Railway** | Vercel | Railway | Railway | [vercel.json](frontend/vercel.json) | [frontend/vercel-deployment-guide.md](frontend/vercel-deployment-guide.md) | ⭐ |

---

## 🎯 推荐方案

### 个人项目 / 小团队

**推荐：场景 3 - Docker 全部**
- ✅ 配置简单
- ✅ 一键启动
- ✅ 成本低（单台服务器）

**配置文件**：
```bash
docker-compose up -d
```

---

### 中型项目 / 需要扩展

**推荐：场景 7 - Vercel + Railway**
- ✅ 前端自动扩展（Vercel CDN）
- ✅ 后端自动扩展（Railway）
- ✅ 无需管理服务器
- ✅ 成本可控（按使用量付费）

**部署**：
```bash
# 后端
railway up

# 前端
vercel
```

---

### 大型项目 / 高流量

**推荐：场景 4 - K8s 全部**
- ✅ 完全控制
- ✅ 高可用
- ✅ 易于扩展
- ⚠️ 需要运维知识

**部署**：
```bash
kubectl apply -f k8s/
```

---

### 混合方案（灵活）

**推荐：场景 6 - Vercel + K8s**
- ✅ 前端利用 Vercel CDN
- ✅ 后端完全控制（K8s）
- ✅ 成本和灵活性的平衡

**配置**：
- 前端：[vercel.json](frontend/vercel.json)
- 后端：[k8s/backend-deployment.yaml](k8s/backend-deployment.yaml)

---

## 📂 配置文件结构

```
ai_vision/
├── docker-compose.yml              # 场景 3: Docker 全部
├── nginx.conf                      # 场景 3: 反向代理
├── .env.example                    # 场景 1, 3: 环境变量示例
│
├── backend/
│   ├── Dockerfile                  # 场景 3, 5: 后端镜像
│   ├── gunicorn.conf.py            # 场景 2: 生产后端配置
│   └── requirements-prod.txt       # 场景 2: 生产依赖
│
├── frontend/
│   ├── Dockerfile                  # 场景 3, 4: 前端镜像
│   ├── vercel.json                 # 场景 5, 6, 7: Vercel 配置
│   └── vercel-deployment-guide.md  # 场景 5, 6, 7: Vercel 部署指南
│
└── k8s/                            # 场景 4, 6: Kubernetes 配置
    ├── frontend-deployment.yaml    # 前端 K8s 配置
    ├── backend-deployment.yaml     # 后端 K8s 配置
    ├── postgres-deployment.yaml    # 数据库 K8s 配置
    ├── secrets.yaml                # 敏感信息（不提交）
    ├── configmap.yaml              # 非敏感配置
    └── README.md                   # K8s 部署指南
```

---

## 🚀 快速选择

### 问题 1：你的用户主要在哪里？

- **国内** → 推荐场景 3（Docker 全部）或场景 5（Vercel + Docker + 国内 CDN）
- **国外** → 推荐场景 7（Vercel + Railway）
- **全球** → 推荐场景 4（K8s 全部）或场景 6（Vercel + K8s）

### 问题 2：你的技术团队规模？

- **1-2 人** → 推荐场景 3（Docker）或场景 7（Vercel + Railway）
- **3-10 人** → 推荐场景 6（Vercel + K8s）
- **10+ 人** → 推荐场景 4（K8s 全部）

### 问题 3：你的预算？

- **免费/低成本** → 场景 7（Vercel + Railway，~$20/月）
- **中等预算** → 场景 3（Docker，~$50-100/月）
- **充足预算** → 场景 4 或 6（K8s，~$200-500/月）

### 问题 4：你需要多高的可用性？

- **个人项目** → 场景 3 或 7（单实例即可）
- **商业项目** → 场景 6（Vercel + K8s，高可用）
- **企业级** → 场景 4（K8s 全部，完全控制）

---

## 📝 部署检查清单

### 通用检查（所有场景）

- [ ] 修改所有默认密钥
- [ ] 配置数据库连接
- [ ] 设置环境变量
- [ ] 配置 CORS（如果前后端分离）
- [ ] 测试所有 API 端点

### Docker 部署（场景 3, 5）

- [ ] 构建镜像
- [ ] 测试镜像运行
- [ ] 配置 volume 持久化
- [ ] 配置自动重启
- [ ] 配置日志收集

### K8s 部署（场景 4, 6）

- [ ] 安装 kubectl
- [ ] 连接到集群
- [ ] 推送镜像到仓库
- [ ] 配置 secrets
- [ ] 部署所有资源
- [ ] 配置 Ingress
- [ ] 配置监控

### Vercel 部署（场景 5, 6, 7）

- [ ] 安装 Vercel CLI
- [ ] 连接 Git 仓库
- [ ] 配置环境变量
- [ ] 配置自定义域名（可选）
- [ ] 测试预览部署
- [ ] 配置自动部署

---

## 🔗 相关文档

- [README.md](README.md) - 项目介绍和快速开始
- [DEPLOYMENT.md](DEPLOYMENT.md) - 详细部署指南
- [k8s/README.md](k8s/README.md) - K8s 部署指南
- [frontend/vercel-deployment-guide.md](frontend/vercel-deployment-guide.md) - Vercel 部署指南
- [DOCKER_STANDALONE.md](DOCKER_STANDALONE.md) - Docker 单独部署指南

---

## 💡 最佳实践

### 安全

1. **永远不要提交密钥到 Git**
   - 使用 `.gitignore` 排除敏感文件
   - 使用环境变量或 Secrets 管理工具

2. **使用强密钥**
   ```bash
   # 生成随机密钥
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

3. **启用 HTTPS**
   - 使用 Let's Encrypt（免费）
   - 或云平台提供的证书

### 性能

1. **使用 CDN**
   - Vercel 自动提供
   - 阿里云 CDN / Cloudflare

2. **配置缓存**
   - 前端静态资源
   - API 响应（使用 Redis）

3. **数据库优化**
   - 连接池
   - 索引
   - 查询优化

### 监控

1. **应用监控**
   - Sentry（错误追踪）
   - Datadog / New Relic

2. **日志收集**
   - ELK Stack
   - 云平台日志服务

3. **性能监控**
   - Vercel Analytics
   - K8s Prometheus + Grafana

---

## 🆘 需要帮助？

1. **查看对应场景的部署文档**
2. **检查日志**：`docker logs` 或 `kubectl logs`
3. **查看监控面板**
4. **提交 GitHub Issue**

---

## 📊 成本对比

| 场景 | 月成本 | 适用规模 |
|------|--------|---------|
| **场景 3: Docker** | ¥50-200 | 小型项目 |
| **场景 7: Vercel + Railway** | $20-50 | 中小型项目 |
| **场景 6: Vercel + K8s** | $100-300 | 中大型项目 |
| **场景 4: K8s 全部** | $200-500+ | 大型项目 |

*注：成本仅供参考，取决于流量和资源配置*

---

## 🔄 从一个场景迁移到另一个场景

### 从 Docker 迁移到 K8s

1. 构建并推送 Docker 镜像
2. 创建 K8s 配置文件
3. 部署到 K8s 集群
4. 切换 DNS 到 K8s Ingress

### 从本地迁移到 Vercel + Railway

1. 后端推送到 Railway
2. 前端推送到 Vercel
3. 配置环境变量
4. 测试连接

详细迁移步骤请参考各场景的部署文档。
