module.exports = {
  apps: [{
    name: 'borderless-techno',
    script: 'server/src/index.js',
    cwd: './',
    env: {
      NODE_ENV: 'development',
      PORT: 4000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 4000
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    log_date_format: 'YYYY-MM-DD HH:mm Z',
    merge_logs: true,
    
    // Production optimizations
    node_args: '--max-old-space-size=1024',
    
    // Health check
    health_check_grace_period: 3000,
    health_check_fatal_exceptions: true,
    
    // Restart strategies
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000,
    
    // Advanced PM2 features
    ignore_watch: [
      'node_modules',
      'logs',
      '.git',
      '*.log'
    ],
    
    // Environment specific settings
    env_file: '.env',
    
    // Kill timeout
    kill_timeout: 5000,
    
    // Listen timeout
    listen_timeout: 3000,
    
    // Process title
    name: 'borderless-techno-api'
  }],

  deploy: {
    production: {
      user: 'deploy',
      host: 'borderlesstechno.com',
      ref: 'origin/main',
      repo: 'git@github.com:username/borderless-techno.git',
      path: '/var/www/borderlesstechno.com',
      'pre-deploy-local': '',
      'post-deploy': 'npm install --production && npm run db:setup:production && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};