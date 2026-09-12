module.exports = {
  apps: [
    {
      name: 'frontend',
      script: 'server.cjs',
      instances: process.env.PM2_INSTANCES || 1,
      exec_mode: process.env.PM2_EXEC_MODE || 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: process.env.PM2_MAX_MEMORY || '300M',
      env: {
        NODE_ENV: process.env.NODE_ENV || 'production',
        PORT: process.env.PORT || 80,
        BACKEND_URL: process.env.BACKEND_URL || 'http://backend:3000',
      },
    },
  ],
};
