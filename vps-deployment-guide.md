# Complete VPS Deployment Guide: NestJS + PostgreSQL + Vue/React Frontend

This guide will walk you through deploying a full-stack application with NestJS backend, PostgreSQL database, and Vue/React frontend to a VPS step by step.

## Prerequisites

- A VPS with Ubuntu 22.04 LTS (recommended)
- Domain name pointed to your VPS IP (optional but recommended for SSL)
- SSH access to your VPS
- Your application repositories ready

## Step 1: Initial VPS Setup

### Connect to your VPS
```bash
ssh root@your_server_ip
# or
ssh username@your_server_ip
```

### Update system packages
```bash
sudo apt update && sudo apt upgrade -y
```

### Create a new user (if using root)
```bash
adduser deploy
usermod -aG sudo deploy
su - deploy
```

### Set up SSH key authentication (recommended)
```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
# Copy your public key to ~/.ssh/authorized_keys
nano ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

## Step 2: Install Required Software

### Install Node.js (using NodeSource repository for latest LTS)
```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Verify Node.js installation
```bash
node --version
npm --version
```

### Install PM2 globally
```bash
sudo npm install -g pm2
```

### Install PostgreSQL
```bash
sudo apt install -y postgresql postgresql-contrib
```

### Install Nginx
```bash
sudo apt install -y nginx
```

### Install Git (if not already installed)
```bash
sudo apt install -y git
```

## Step 3: Configure PostgreSQL

### Switch to postgres user and create database
```bash
sudo -i -u postgres
psql
```

### Create database and user
```sql
CREATE DATABASE your_app_db;
CREATE USER your_app_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE your_app_db TO your_app_user;
ALTER USER your_app_user CREATEDB;
\q
exit
```

### Configure PostgreSQL for remote connections (if needed)
```bash
sudo nano /etc/postgresql/14/main/postgresql.conf
# Uncomment and modify: listen_addresses = 'localhost'

sudo nano /etc/postgresql/14/main/pg_hba.conf
# Add line: local   all   your_app_user   md5

sudo systemctl restart postgresql
```

## Step 4: Deploy NestJS Backend

### Clone your backend repository
```bash
cd /home/deploy
git clone https://github.com/yourusername/your-nestjs-backend.git
cd your-nestjs-backend
```

### Install dependencies
```bash
npm install
```

### Create production environment file
```bash
nano .env.production
```

Add your environment variables:
```env
NODE_ENV=production
PORT=3000
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=your_app_user
DATABASE_PASSWORD=your_secure_password
DATABASE_NAME=your_app_db
JWT_SECRET=your_jwt_secret_key
# Add other environment variables as needed
```

### Build the application
```bash
npm run build
```

### Start with PM2
```bash
pm2 start dist/main.js --name "nestjs-backend" --env production
pm2 save
pm2 startup
# Follow the instructions to enable PM2 on system startup
```

### Configure PM2 ecosystem file (optional but recommended)
```bash
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'nestjs-backend',
    script: 'dist/main.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

```bash
mkdir logs
pm2 start ecosystem.config.js --env production
```

## Step 5: Deploy Frontend (Vue/React)

### Clone your frontend repository
```bash
cd /home/deploy
git clone https://github.com/yourusername/your-frontend.git
cd your-frontend
```

### Install dependencies
```bash
npm install
```

### Create production environment file
For Vue:
```bash
nano .env.production
```
```env
VUE_APP_API_URL=https://api.yourdomain.com
# or http://your_server_ip:3000 if no domain
```

For React:
```bash
nano .env.production
```
```env
REACT_APP_API_URL=https://api.yourdomain.com
# or http://your_server_ip:3000 if no domain
```

### Build the application
```bash
npm run build
```

### Copy build files to web directory
```bash
sudo mkdir -p /var/www/your-app
sudo cp -r dist/* /var/www/your-app/  # For Vue
# or
sudo cp -r build/* /var/www/your-app/  # For React
sudo chown -R www-data:www-data /var/www/your-app
```

## Step 6: Configure Nginx

### Remove default configuration
```bash
sudo rm /etc/nginx/sites-enabled/default
```

### Create new configuration
```bash
sudo nano /etc/nginx/sites-available/your-app
```

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# Main server block
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL configuration (will be added by Certbot)
    # ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Frontend
    root /var/www/your-app;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Frontend routes
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "public, max-age=31536000, immutable" always;
    }

    # API routes - proxy to NestJS backend
    location /api/ {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
```

### Enable the site
```bash
sudo ln -s /etc/nginx/sites-available/your-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Step 7: Set Up Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

## Step 8: Set Up SSL with Let's Encrypt

### Install Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### Obtain SSL certificate
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Set up automatic renewal
```bash
sudo crontab -e
```
Add this line:
```
0 12 * * * /usr/bin/certbot renew --quiet
```

## Step 9: Set Up Monitoring and Logging

### Configure PM2 monitoring
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
pm2 set pm2-logrotate:compress true
```

### Set up Nginx log rotation (usually already configured)
```bash
sudo nano /etc/logrotate.d/nginx
```

### Monitor your application
```bash
# Check PM2 status
pm2 status
pm2 logs nestjs-backend

# Check Nginx status
sudo systemctl status nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Check PostgreSQL status
sudo systemctl status postgresql
```

## Step 10: Create Deployment Script

Create an automated deployment script:

```bash
nano deploy.sh
```

```bash
#!/bin/bash

# Deployment script for NestJS + Frontend

echo "Starting deployment..."

# Backend deployment
echo "Deploying backend..."
cd /home/deploy/your-nestjs-backend
git pull origin main
npm install --production
npm run build
pm2 restart nestjs-backend

# Frontend deployment
echo "Deploying frontend..."
cd /home/deploy/your-frontend
git pull origin main
npm install
npm run build
sudo rm -rf /var/www/your-app/*
sudo cp -r dist/* /var/www/your-app/  # For Vue
# sudo cp -r build/* /var/www/your-app/  # For React
sudo chown -R www-data:www-data /var/www/your-app

# Restart services
sudo systemctl reload nginx

echo "Deployment completed!"
```

```bash
chmod +x deploy.sh
```

## Step 11: Database Backup Strategy

Create a backup script:

```bash
nano backup-db.sh
```

```bash
#!/bin/bash

BACKUP_DIR="/home/deploy/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="your_app_db"
DB_USER="your_app_user"

mkdir -p $BACKUP_DIR

pg_dump -U $DB_USER -h localhost $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete

echo "Database backup completed: backup_$DATE.sql"
```

```bash
chmod +x backup-db.sh
```

Add to crontab for daily backups:
```bash
crontab -e
# Add: 0 2 * * * /home/deploy/backup-db.sh
```

## Troubleshooting

### Common Issues:

1. **Port 3000 already in use**: Check what's running on port 3000
   ```bash
   sudo lsof -i :3000
   sudo kill -9 PID
   ```

2. **Permission denied for database**: Check PostgreSQL user permissions
   ```bash
   sudo -i -u postgres
   psql -c "\du"
   ```

3. **Nginx configuration errors**: Test configuration
   ```bash
   sudo nginx -t
   ```

4. **PM2 not starting on boot**: Reinstall startup script
   ```bash
   pm2 unstartup
   pm2 startup
   ```

5. **Frontend not loading**: Check Nginx error logs
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

## Security Best Practices

1. **Regular updates**: Keep system and packages updated
2. **Strong passwords**: Use complex passwords for database
3. **SSH keys**: Disable password authentication
4. **Firewall**: Only open necessary ports
5. **SSL**: Always use HTTPS in production
6. **Environment variables**: Never commit secrets to git
7. **Regular backups**: Automate database and file backups
8. **Monitoring**: Set up alerts for system issues

## Performance Optimization

1. **PM2 cluster mode**: Use all CPU cores
2. **Nginx caching**: Cache static assets
3. **Database indexing**: Optimize database queries
4. **CDN**: Use CDN for static assets
5. **Compression**: Enable gzip compression
6. **Connection pooling**: Configure database connection pools

Your application should now be successfully deployed and accessible via your domain!