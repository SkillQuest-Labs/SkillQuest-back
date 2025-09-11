#!/bin/bash

# VPS Setup Script for NestJS + PostgreSQL + Vue/React Deployment
# Run this script on your fresh Ubuntu VPS

set -e

echo "🚀 Starting VPS setup for NestJS + PostgreSQL + Frontend deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_warning "This script should not be run as root for security reasons."
   print_warning "Please create a non-root user with sudo privileges and run this script as that user."
   exit 1
fi

# Update system packages
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install essential packages
print_status "Installing essential packages..."
sudo apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Install Node.js (LTS version)
print_status "Installing Node.js LTS..."
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify Node.js installation
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
print_status "Node.js version: $NODE_VERSION"
print_status "npm version: $NPM_VERSION"

# Install PM2 globally
print_status "Installing PM2..."
sudo npm install -g pm2

# Install PostgreSQL
print_status "Installing PostgreSQL..."
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
print_status "Installing Nginx..."
sudo apt install -y nginx

# Install Certbot for SSL
print_status "Installing Certbot for SSL certificates..."
sudo apt install -y certbot python3-certbot-nginx

# Configure firewall
print_status "Configuring UFW firewall..."
sudo ufw --force enable
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw status

# Start and enable services
print_status "Starting and enabling services..."
sudo systemctl start nginx
sudo systemctl enable nginx
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create application directories
print_status "Creating application directories..."
mkdir -p ~/apps
mkdir -p ~/backups
mkdir -p ~/logs

# Set up PostgreSQL
print_status "Setting up PostgreSQL..."
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"

print_status "PostgreSQL setup completed. You can now create your application database and user."

# Install additional useful packages
print_status "Installing additional useful packages..."
sudo apt install -y htop tree ncdu fail2ban

# Configure fail2ban
print_status "Configuring fail2ban..."
sudo systemctl start fail2ban
sudo systemctl enable fail2ban

# Create a sample ecosystem.config.js for PM2
print_status "Creating sample PM2 ecosystem config..."
cat > ~/ecosystem.config.js << 'EOF'
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
    time: true,
    max_memory_restart: '1G',
    restart_delay: 4000
  }]
};
EOF

# Create deployment script template
print_status "Creating deployment script template..."
cat > ~/deploy.sh << 'EOF'
#!/bin/bash

# Deployment script template
# Customize this script for your application

set -e

BACKEND_DIR="$HOME/apps/your-nestjs-backend"
FRONTEND_DIR="$HOME/apps/your-frontend"
WEB_DIR="/var/www/your-app"

echo "🚀 Starting deployment..."

# Deploy backend
if [ -d "$BACKEND_DIR" ]; then
    echo "📦 Deploying backend..."
    cd $BACKEND_DIR
    git pull origin main
    npm install --production
    npm run build
    pm2 restart nestjs-backend
else
    echo "❌ Backend directory not found: $BACKEND_DIR"
fi

# Deploy frontend
if [ -d "$FRONTEND_DIR" ]; then
    echo "🎨 Deploying frontend..."
    cd $FRONTEND_DIR
    git pull origin main
    npm install
    npm run build
    
    # Copy build files (adjust based on your framework)
    sudo rm -rf $WEB_DIR/*
    if [ -d "dist" ]; then
        sudo cp -r dist/* $WEB_DIR/  # Vue
    elif [ -d "build" ]; then
        sudo cp -r build/* $WEB_DIR/  # React
    fi
    sudo chown -R www-data:www-data $WEB_DIR
else
    echo "❌ Frontend directory not found: $FRONTEND_DIR"
fi

# Restart services
echo "🔄 Restarting services..."
sudo systemctl reload nginx

echo "✅ Deployment completed!"
EOF

chmod +x ~/deploy.sh

# Create database backup script template
print_status "Creating database backup script template..."
cat > ~/backup-db.sh << 'EOF'
#!/bin/bash

# Database backup script template
# Customize with your database details

BACKUP_DIR="$HOME/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="your_app_db"
DB_USER="your_app_user"

mkdir -p $BACKUP_DIR

echo "📦 Creating database backup..."
pg_dump -U $DB_USER -h localhost $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete

echo "✅ Database backup completed: backup_$DATE.sql"
EOF

chmod +x ~/backup-db.sh

# Create Nginx configuration template
print_status "Creating Nginx configuration template..."
sudo mkdir -p /etc/nginx/templates

cat > ~/nginx-site.conf << 'EOF'
# Nginx configuration template
# Copy to /etc/nginx/sites-available/your-app and customize

server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL configuration (will be added by Certbot)
    # ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

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
        expires 1y;
        add_header Cache-Control "public, immutable";
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
EOF

print_status "✅ VPS setup completed!"
print_status ""
print_status "Next steps:"
print_status "1. Configure PostgreSQL database and user"
print_status "2. Clone your application repositories to ~/apps/"
print_status "3. Customize the deployment script (~/deploy.sh)"
print_status "4. Set up Nginx configuration for your domain"
print_status "5. Obtain SSL certificates with: sudo certbot --nginx -d your-domain.com"
print_status ""
print_status "Useful commands:"
print_status "- Check PM2 status: pm2 status"
print_status "- Check Nginx status: sudo systemctl status nginx"
print_status "- Check PostgreSQL status: sudo systemctl status postgresql"
print_status "- View firewall status: sudo ufw status"
print_status ""
print_status "Configuration files created:"
print_status "- ~/ecosystem.config.js (PM2 configuration)"
print_status "- ~/deploy.sh (Deployment script)"
print_status "- ~/backup-db.sh (Database backup script)"
print_status "- ~/nginx-site.conf (Nginx configuration template)"