# 多阶段构建 - 优化镜像大小
FROM python:3.11-slim as builder

WORKDIR /app

# 安装编译依赖
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# 复制并安装 Python 依赖
COPY deployconfig/requirements_prod.txt .
RUN pip install --no-cache-dir --user -r requirements_prod.txt

# 运行阶段
FROM python:3.11-slim

WORKDIR /app

# 从 builder 阶段复制已安装的包
COPY --from=builder /root/.local /root/.local

# 复制应用代码
COPY . .

# 确保脚本在 PATH 中
ENV PATH=/root/.local/bin:$PATH

# 创建非 root 用户
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app

USER appuser

# 暴露端口
EXPOSE 8000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/docs')"

# 使用 gunicorn 启动（生产环境）
CMD ["gunicorn", "app.main:app", "-c", "deployconfig/gunicorn.conf.py"]
