module.exports = {
  apps: [
    {
      name: 'backend',
      script: 'dist/server.js',
      instances: process.env.PM2_INSTANCES || 1,
      exec_mode: process.env.PM2_EXEC_MODE || 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: process.env.PM2_MAX_MEMORY || '500M',
      env: {
        NODE_ENV: process.env.NODE_ENV || 'production',
        PORT: process.env.PORT || 3000,
      },
    },
  ],
};
