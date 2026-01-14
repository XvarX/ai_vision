module.exports = {
  apps: [{
    name: 'ai-vision-backend',
    script: 'venv/Scripts/gunicorn.exe',  // Windows
    // script: 'venv/bin/gunicorn',        // Linux/Mac
    args: 'app.main:app -c deployconfig/gunicorn.conf.py',
    cwd: './backend',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
