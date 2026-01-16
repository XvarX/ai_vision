# 多阶段构建 - 优化镜像大小
FROM docker.m.daocloud.io/python:3.11-slim as builder

WORKDIR /app

# 配置 apt 使用阿里云镜像源并安装编译依赖
RUN sed -i 's/deb.debian.org/mirrors.aliyun.com/g' /etc/apt/sources.list.d/debian.sources && \
    apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# 复制并安装 Python 依赖
COPY backend/deployconfig/requirements*.txt .
RUN pip install --no-cache-dir -i https://pypi.tuna.tsinghua.edu.cn/simple -r requirements_prod.txt

# 运行阶段
FROM docker.m.daocloud.io/python:3.11-slim

WORKDIR /app

# 配置 apt 使用阿里云镜像源并安装运行时依赖
RUN sed -i 's/deb.debian.org/mirrors.aliyun.com/g' /etc/apt/sources.list.d/debian.sources && \
    apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 从 builder 阶段复制已安装的 Python 包
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# 复制应用代码（只复制 backend 目录）
COPY backend/ .

# 暴露端口
EXPOSE 8000

# 健康检查（使用 curl）
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# 使用 gunicorn 启动（生产环境）
CMD ["gunicorn", "app.main:app", "-c", "deployconfig/gunicorn.conf.py"]
