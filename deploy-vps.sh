#!/bin/bash

# Binance Trading Bot VPS Deployment Script
# Run this script on your Ubuntu VPS

set -e

echo "🚀 Setting up Binance Trading Bot on VPS..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 18 (LTS)
echo "⚙️ Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Git
echo "📥 Installing Git..."
sudo apt-get install -y git

# Install PM2 (Process Manager)
echo "🔧 Installing PM2 process manager..."
sudo npm install -g pm2

# Clone the bot repository (you'll need to replace with your repo URL)
echo "📁 Setting up project directory..."
cd /home/$(whoami)
mkdir -p trading-bot
cd trading-bot

# Copy your bot files here (you'll do this manually or via git)
echo "📋 Bot setup directory created at: /home/$(whoami)/trading-bot"

# Install dependencies
echo "📦 Installing project dependencies..."
npm install

# Create PM2 ecosystem file
echo "⚙️ Creating PM2 configuration..."
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'binance-advanced-bot',
    script: 'dist/advanced-bot.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      TZ: 'Europe/Prague'
    },
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }, {
    name: 'binance-basic-bot',
    script: 'dist/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      TZ: 'Europe/Prague'
    },
    log_file: './logs/basic-combined.log',
    out_file: './logs/basic-out.log',
    error_file: './logs/basic-error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
EOF

# Create logs directory
mkdir -p logs

# Create systemd service for PM2 (ensures restart on reboot)
echo "🔄 Setting up auto-restart on reboot..."
pm2 startup | tail -1 | sudo bash

echo "✅ VPS setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Copy your bot files to: /home/$(whoami)/trading-bot"
echo "2. Create your .env file with API credentials"
echo "3. Build the project: npm run build"
echo "4. Start with PM2: pm2 start ecosystem.config.js"
echo "5. Save PM2 config: pm2 save"
echo ""
echo "🔧 Useful commands:"
echo "  pm2 status          - Check bot status"
echo "  pm2 logs            - View logs"
echo "  pm2 restart all     - Restart bots"
echo "  pm2 stop all        - Stop bots"
echo "  pm2 monit           - Real-time monitoring"
