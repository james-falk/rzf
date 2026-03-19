// PM2 process config for the Telegram agent daemon.
// Start: pm2 start ecosystem.config.cjs
// Auto-start on boot: pm2 save && pm2 startup  (run the printed command as admin)
// Logs: pm2 logs telegram-agent

const path = require('path')

module.exports = {
  apps: [
    {
      name: 'telegram-agent',
      script: path.join(__dirname, 'node_modules', '.bin', 'tsx'),
      args: 'src/index.ts',
      cwd: __dirname,
      watch: false,
      restart_delay: 5000,
      max_restarts: 20,
      min_uptime: '10s',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: path.join(__dirname, 'logs', 'err.log'),
      out_file: path.join(__dirname, 'logs', 'out.log'),
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
}
