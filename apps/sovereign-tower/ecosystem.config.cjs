module.exports = {
  apps: [
    {
      name: 'sovereign-tower',
      script: 'npx',
      args: 'wrangler pages dev dist --ip 0.0.0.0 --port 3001',
      cwd: '/home/user/webapp/sovereign-ecosystem/apps/sovereign-tower',
      env: {
        NODE_ENV: 'development',
        PORT: 3001
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_restarts: 10
    }
  ]
}
