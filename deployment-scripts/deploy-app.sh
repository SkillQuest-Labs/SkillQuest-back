#!/bin/bash

# Application Deployment Script
# Deploys NestJS backend and Vue/React frontend

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_input() {
    echo -e "${BLUE}[INPUT]${NC} $1"
}

# Configuration
APPS_DIR="$HOME/apps"
WEB_DIR="/var/www"

echo "🚀 Application Deployment Script"
echo "================================"

# Get deployment details
print_input "Enter your backend repository URL (e.g., https://github.com/user/backend.git):"
read -r BACKEND_REPO

print_input "Enter your frontend repository URL (e.g., https://github.com/user/frontend.git):"
read -r FRONTEND_REPO

print_input "Enter your domain name (e.g., yourdomain.com):"
read -r DOMAIN_NAME

print_input "Enter your application name (no spaces):"
read -r APP_NAME

print_input "Is this a Vue or React frontend? (vue/react):"
read -r FRONTEND_TYPE

# Validate inputs
if [[ -z "$BACKEND_REPO" || -z "$FRONTEND_REPO" || -z "$DOMAIN_NAME" || -z "$APP_NAME" ]]; then
    print_error "All fields are required!"
    exit 1
fi

if [[ "$FRONTEND_TYPE" != "vue" && "$FRONTEND_TYPE" != "react" ]]; then
    print_error "Frontend type must be 'vue' or 'react'"
    exit 1
fi

# Set build directory based on frontend type
if [[ "$FRONTEND_TYPE" == "vue" ]]; then
    BUILD_DIR="dist"
else
    BUILD_DIR="build"
fi

BACKEND_DIR="$APPS_DIR/$APP_NAME-backend"
FRONTEND_DIR="$APPS_DIR/$APP_NAME-frontend"
SITE_DIR="$WEB_DIR/$APP_NAME"

print_status "Starting deployment for $APP_NAME..."

# Create directories
print_status "Creating application directories..."
mkdir -p $APPS_DIR
sudo mkdir -p $SITE_DIR

# Deploy Backend
print_status "📦 Deploying NestJS Backend..."

if [ ! -d "$BACKEND_DIR" ]; then
    print_status "Cloning backend repository..."
    cd $APPS_DIR
    git clone $BACKEND_REPO $APP_NAME-backend
    cd $BACKEND_DIR
else
    print_status "Updating backend repository..."
    cd $BACKEND_DIR
    git pull origin main
fi

print_status "Installing backend dependencies..."
npm install

# Check if .env file exists, if not create template
if [ ! -f ".env" ]; then
    print_status "Creating backend .env file template..."
    cat > .env << EOF
NODE_ENV=production
PORT=3000
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=your_db_user
DATABASE_PASSWORD=your_db_password
DATABASE_NAME=your_db_name
JWT_SECRET=$(openssl rand -base64 32)
EOF
    print_warning "⚠️  Please update the .env file with your actual database credentials!"
    print_warning "⚠️  Edit: $BACKEND_DIR/.env"
fi

print_status "Building backend application..."
npm run build

print_status "Setting up PM2 ecosystem..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '$APP_NAME-backend',
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
    restart_delay: 4000,
    kill_timeout: 5000
  }]
};
EOF

mkdir -p logs

print_status "Starting backend with PM2..."
pm2 start ecosystem.config.js --env production
pm2 save

# Deploy Frontend
print_status "🎨 Deploying Frontend..."

if [ ! -d "$FRONTEND_DIR" ]; then
    print_status "Cloning frontend repository..."
    cd $APPS_DIR
    git clone $FRONTEND_REPO $APP_NAME-frontend
    cd $FRONTEND_DIR
else
    print_status "Updating frontend repository..."
    cd $FRONTEND_DIR
    git pull origin main
fi

print_status "Installing frontend dependencies..."
npm install

# Create production environment file
if [[ "$FRONTEND_TYPE" == "vue" ]]; then
    cat > .env.production << EOF
VUE_APP_API_URL=https://$DOMAIN_NAME/api
EOF
else
    cat > .env.production << EOF
REACT_APP_API_URL=https://$DOMAIN_NAME/api
EOF
fi

print_status "Building frontend application..."
npm run build

print_status "Deploying frontend files..."
sudo rm -rf $SITE_DIR/*
sudo cp -r $BUILD_DIR/* $SITE_DIR/
sudo chown -R www-data:www-data $SITE_DIR

# Configure Nginx
print_status "🌐 Configuring Nginx..."

NGINX_CONFIG="/etc/nginx/sites-available/$APP_NAME"

sudo tee $NGINX_CONFIG > /dev/null << EOF
# HTTP redirect to HTTPS
server {
    listen 80;
    server_name $DOMAIN_NAME www.$DOMAIN_NAME;
    return 301 https://\$server_name\$request_uri;
}

# Main HTTPS server
server {
    listen 443 ssl http2;
    server_name $DOMAIN_NAME www.$DOMAIN_NAME;

    # SSL configuration (will be configured by Certbot)
    # ssl_certificate /etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/$DOMAIN_NAME/privkey.pem;

    # Document root
    root $SITE_DIR;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Frontend routes (SPA)
    location / {
        try_files \$uri \$uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)\$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            add_header X-Content-Type-Options nosniff;
        }
    }

    # API routes - proxy to NestJS backend
    location /api/ {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
        proxy_connect_timeout 30;
        proxy_send_timeout 30;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Hide Nginx version
    server_tokens off;
}
EOF

# Enable site
print_status "Enabling Nginx site..."
sudo ln -sf $NGINX_CONFIG /etc/nginx/sites-enabled/

# Test Nginx configuration
print_status "Testing Nginx configuration..."
sudo nginx -t

if [ $? -eq 0 ]; then
    print_status "Nginx configuration is valid"
    sudo systemctl reload nginx
else
    print_error "Nginx configuration error!"
    exit 1
fi

# Create deployment script for future updates
print_status "Creating update deployment script..."

cat > ~/update-$APP_NAME.sh << EOF
#!/bin/bash

# Update deployment script for $APP_NAME

set -e

echo "🔄 Updating $APP_NAME..."

# Update backend
echo "📦 Updating backend..."
cd $BACKEND_DIR
git pull origin main
npm install --production
npm run build
pm2 restart $APP_NAME-backend

# Update frontend  
echo "🎨 Updating frontend..."
cd $FRONTEND_DIR
git pull origin main
npm install
npm run build
sudo rm -rf $SITE_DIR/*
sudo cp -r $BUILD_DIR/* $SITE_DIR/
sudo chown -R www-data:www-data $SITE_DIR

# Reload Nginx
sudo systemctl reload nginx

echo "✅ $APP_NAME updated successfully!"

# Show status
echo ""
echo "📊 Application Status:"
pm2 status
echo ""
echo "🌐 Nginx Status:"
sudo systemctl status nginx --no-pager -l
EOF

chmod +x ~/update-$APP_NAME.sh

# Create monitoring script
print_status "Creating monitoring script..."

cat > ~/monitor-$APP_NAME.sh << EOF
#!/bin/bash

# Monitoring script for $APP_NAME

echo "📊 $APP_NAME Application Status"
echo "================================"

echo "🔧 PM2 Status:"
pm2 status

echo ""
echo "🌐 Nginx Status:"
sudo systemctl is-active nginx

echo ""
echo "🗄️  PostgreSQL Status:"
sudo systemctl is-active postgresql

echo ""
echo "💾 Disk Usage:"
df -h

echo ""
echo "🧠 Memory Usage:"
free -h

echo ""
echo "⚡ Recent Logs:"
echo "Backend logs (last 10 lines):"
pm2 logs $APP_NAME-backend --lines 10 --nostream

echo ""
echo "Nginx access logs (last 5 lines):"
sudo tail -5 /var/log/nginx/access.log

echo ""
echo "🔗 Application URLs:"
echo "Frontend: https://$DOMAIN_NAME"
echo "API: https://$DOMAIN_NAME/api"
EOF

chmod +x ~/monitor-$APP_NAME.sh

print_status "✅ Deployment completed successfully!"
print_status ""
print_status "🎉 Your application has been deployed!"
print_status ""
print_status "📝 Summary:"
print_status "- Application Name: $APP_NAME"
print_status "- Domain: $DOMAIN_NAME"
print_status "- Backend Directory: $BACKEND_DIR"
print_status "- Frontend Directory: $FRONTEND_DIR"
print_status "- Web Directory: $SITE_DIR"
print_status ""
print_status "📁 Scripts Created:"
print_status "- Update script: ~/update-$APP_NAME.sh"
print_status "- Monitor script: ~/monitor-$APP_NAME.sh"
print_status ""
print_status "🔧 Next Steps:"
print_status "1. Update backend .env file: $BACKEND_DIR/.env"
print_status "2. Set up SSL certificate: sudo certbot --nginx -d $DOMAIN_NAME -d www.$DOMAIN_NAME"
print_status "3. Test your application: https://$DOMAIN_NAME"
print_status ""
print_status "📊 Useful Commands:"
print_status "- Check PM2 status: pm2 status"
print_status "- View logs: pm2 logs $APP_NAME-backend"
print_status "- Monitor app: ~/monitor-$APP_NAME.sh"
print_status "- Update app: ~/update-$APP_NAME.sh"
print_status ""
print_warning "⚠️  Don't forget to:"
print_warning "- Configure your database credentials in the backend .env file"
print_warning "- Set up SSL certificates with Certbot"
print_warning "- Test all functionality after deployment"