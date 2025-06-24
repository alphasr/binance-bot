module.exports = {
  apps: [
    {
      name: 'binance-advanced-bot',
      script: 'dist/advanced-bot.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        TZ: 'Europe/Prague',
      },
      log_file: './logs/advanced-combined.log',
      out_file: './logs/advanced-out.log',
      error_file: './logs/advanced-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      cron_restart: '0 0 * * *', // Restart daily at midnight for stability
    },
    {
      name: 'binance-basic-bot',
      script: 'dist/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        TZ: 'Europe/Prague',
      },
      log_file: './logs/basic-combined.log',
      out_file: './logs/basic-out.log',
      error_file: './logs/basic-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      cron_restart: '0 0 * * *', // Restart daily at midnight for stability
    },
  ],
};
