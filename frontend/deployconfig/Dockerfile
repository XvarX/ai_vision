# 多阶段构建
FROM docker.m.daocloud.io/node:18-alpine as builder

WORKDIR /app

# 定义构建参数，用于接收环境变量
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# 复制 package 文件
COPY frontend/package*.json ./

# 配置 npm 使用国内镜像源并安装依赖
RUN npm config set registry https://registry.npmmirror.com && \
    npm ci

# 复制源代码
COPY frontend/ .

# 设置生产环境
ENV NODE_ENV=production

# 构建应用
RUN npm run build

# 生产阶段
FROM docker.m.daocloud.io/node:18-alpine

WORKDIR /app

# 复制构建产物
# 注意：standalone 模式下，.next/standalone 包含了运行所需的所有文件
# 如果存在 public 目录，也复制过来（可选）
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 启动应用
CMD ["node", "server.js"]
