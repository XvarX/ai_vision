# Gunicorn 配置文件
import multiprocessing

# Server socket
bind = "0.0.0.0:8000"
backlog = 2048

# Worker processes
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "uvicorn.workers.UvicornWorker"
worker_connections = 1000
timeout = 30
keepalive = 2

# Process naming
proc_name = "ai_vision"

# Logging
accesslog = "-"  # 标准输出
errorlog = "-"   # 标准错误
loglevel = "info"

# Server mechanics
daemon = False  # 在 Docker/supervisor 中运行时设为 False
pidfile = "/tmp/gunicorn.pid"
umask = 007
user = None

# Server hooks
def on_starting(server):
    """Server 启动时调用"""
    print("Starting AI Vision API server...")

def on_exit(server):
    """Server 关闭时调用"""
    print("Shutting down AI Vision API server...")
