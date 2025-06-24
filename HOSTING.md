# 🌐 Google Cloud Platform Deployment Guide

## 🎯 **Why Google Cloud Platform?**

- **$300 Free Credit** for new users (12 months)
- **99.95% Uptime SLA** - Critical for trading bots
- **Global Infrastructure** - Low latency worldwide
- **Auto-scaling** - Handles traffic spikes
- **Security** - Enterprise-grade protection
- **Monitoring** - Built-in logging and alerts

## 🚀 **Deployment Options**

### **Option 1: Cloud Run (Recommended)**

- **Serverless** - No server management
- **Cost**: $5-15/month
- **Auto-scaling** - Perfect for scheduled bots
- **Easy deployment** - Container-based

### **Option 2: Compute Engine VM**

- **Full control** - Traditional VPS experience
- **Cost**: $10-30/month
- **Always-on** - 24/7 operation
- **Customizable** - Complete environment control

## 🔧 **Quick Start: Cloud Run Deployment**

### **Step 1: Create DigitalOcean Droplet**

1. Go to [DigitalOcean](https://digitalocean.com)
2. Create account (get $200 credit with referral)
3. Create new Droplet:
   - **Image**: Ubuntu 22.04 LTS
   - **Size**: Basic $4/month (1GB RAM)
   - **Region**: Choose closest to you
   - **SSH Keys**: Add your SSH key

### **Step 2: Connect to Your VPS**

```bash
ssh root@your_server_ip
```

### **Step 3: Run Deployment Script**

```bash
# Copy the deploy-vps.sh script to your server
wget https://your-domain.com/deploy-vps.sh
chmod +x deploy-vps.sh
./deploy-vps.sh
```

### **Step 4: Upload Your Bot**

```bash
# Option 1: Use Git (recommended)
git clone https://github.com/yourusername/binance-bot.git /home/$(whoami)/trading-bot

# Option 2: Use SCP to copy files
scp -r /path/to/your/bot root@your_server_ip:/home/root/trading-bot
```

### **Step 5: Configure Environment**

```bash
cd /home/$(whoami)/trading-bot
cp .env.example .env
nano .env  # Edit with your API credentials
```

### **Step 6: Build and Deploy**

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save
```

## 🔧 **PM2 Management Commands**

### **Basic Commands**

```bash
pm2 status                    # Check bot status
pm2 logs                      # View all logs
pm2 logs binance-advanced-bot # View specific bot logs
pm2 restart all               # Restart all bots
pm2 stop all                  # Stop all bots
pm2 delete all                # Delete all processes
pm2 monit                     # Real-time monitoring
```

### **Monitoring & Debugging**

```bash
# View logs in real-time
pm2 logs --lines 100

# Monitor CPU and memory usage
pm2 monit

# Restart specific bot
pm2 restart binance-advanced-bot

# View detailed process info
pm2 show binance-advanced-bot
```

## 📊 **Alternative Hosting Options**

### **1. Heroku (Simple but Limited)**

**Pros:**

- Zero server management
- Easy deployment with Git
- Free tier available

**Cons:**

- Restarts every 24 hours (can miss trades)
- Limited to 1000 dyno hours/month on free tier

**Setup:**

```bash
# Install Heroku CLI
npm install -g heroku

# Login and create app
heroku login
heroku create your-bot-name

# Set environment variables
heroku config:set BINANCE_API_KEY=your_key
heroku config:set BINANCE_API_SECRET=your_secret

# Deploy
git push heroku main
```

### **2. AWS EC2 (Enterprise)**

**Pros:**

- Highly reliable
- Scalable
- Professional features

**Cons:**

- More complex setup
- Higher cost for managed services

### **3. Railway (Modern Alternative)**

**Pros:**

- Simple deployment
- No sleep mode
- Generous free tier

**Cons:**

- Newer platform
- Less documentation

## 🛡️ **Security Best Practices**

### **VPS Security Setup**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Configure firewall
sudo ufw allow ssh
sudo ufw allow 22
sudo ufw enable

# Create non-root user
sudo adduser trader
sudo usermod -aG sudo trader

# Disable root login (optional)
sudo nano /etc/ssh/sshd_config
# Set: PermitRootLogin no
sudo systemctl restart ssh
```

### **API Security**

1. **IP Whitelist**: Restrict API access to your VPS IP
2. **Limited Permissions**: Only enable futures trading
3. **No Withdrawal**: Disable withdrawal permissions
4. **Regular Rotation**: Change API keys monthly

## 📈 **Monitoring & Alerts**

### **Set Up Monitoring**

```bash
# Install htop for system monitoring
sudo apt install htop

# Check system resources
htop
df -h  # Disk usage
free -m  # Memory usage
```

### **Log Rotation**

```bash
# Set up log rotation to prevent disk overflow
sudo nano /etc/logrotate.d/trading-bot

# Add this content:
/home/*/trading-bot/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    notifempty
    copytruncate
}
```

### **Discord/Telegram Notifications**

Consider adding webhook notifications to get alerts:

- Trade executions
- Errors or failures
- Daily performance reports

## 💰 **Cost Comparison**

| Provider     | Cost/Month | RAM   | Storage | Bandwidth |
| ------------ | ---------- | ----- | ------- | --------- |
| DigitalOcean | $4         | 1GB   | 25GB    | 1TB       |
| Vultr        | $2.50      | 512MB | 10GB    | 500GB     |
| Linode       | $5         | 1GB   | 25GB    | 1TB       |
| AWS EC2      | $8-15      | 1GB   | 8GB     | Variable  |
| Heroku       | $7         | 512MB | N/A     | N/A       |

## 🎯 **Recommended Setup for Beginners**

1. **Start with DigitalOcean $4/month droplet**
2. **Use the provided deployment script**
3. **Start with small trade amounts**
4. **Monitor for 1-2 weeks**
5. **Scale up if profitable**

## 🆘 **Common Issues & Solutions**

### **Bot Stops Running**

```bash
# Check PM2 status
pm2 status

# Restart if needed
pm2 restart all

# Check logs for errors
pm2 logs
```

### **Out of Memory**

```bash
# Check memory usage
free -m

# Restart bot to clear memory
pm2 restart binance-advanced-bot
```

### **Network Issues**

```bash
# Test API connectivity
curl -s https://fapi.binance.com/fapi/v1/ping

# Check DNS
nslookup fapi.binance.com
```

---

**Ready to deploy? Start with DigitalOcean VPS for the most reliable trading bot hosting!**

**Need help? Check the logs with `pm2 logs` and ensure your API credentials are correctly configured.**
