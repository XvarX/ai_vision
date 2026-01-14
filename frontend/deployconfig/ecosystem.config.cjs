module.exports = {
  apps: [{
    name: 'ai-vision-frontend',
    script: 'npm',
    args: 'start',
    cwd: './frontend',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
