#!/bin/bash

# SSL Certificate Setup Script using Let's Encrypt
# Run this after deploying your application

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

echo "🔒 SSL Certificate Setup with Let's Encrypt"
echo "==========================================="

# Check if Certbot is installed
if ! command -v certbot &> /dev/null; then
    print_error "Certbot is not installed. Please run the VPS setup script first."
    exit 1
fi

# Check if Nginx is running
if ! systemctl is-active --quiet nginx; then
    print_error "Nginx is not running. Please start Nginx first."
    exit 1
fi

# Get domain information
print_input "Enter your primary domain name (e.g., yourdomain.com):"
read -r DOMAIN_NAME

print_input "Do you want to include www subdomain? (y/n):"
read -r INCLUDE_WWW

print_input "Enter your email address for Let's Encrypt notifications:"
read -r EMAIL

# Validate inputs
if [[ -z "$DOMAIN_NAME" || -z "$EMAIL" ]]; then
    print_error "Domain name and email are required!"
    exit 1
fi

# Validate email format
if [[ ! "$EMAIL" =~ ^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$ ]]; then
    print_error "Invalid email format!"
    exit 1
fi

# Build domain list
DOMAINS="-d $DOMAIN_NAME"
if [[ "$INCLUDE_WWW" =~ ^[Yy]$ ]]; then
    DOMAINS="$DOMAINS -d www.$DOMAIN_NAME"
fi

print_status "Setting up SSL certificate for: $DOMAIN_NAME"
if [[ "$INCLUDE_WWW" =~ ^[Yy]$ ]]; then
    print_status "Including www subdomain: www.$DOMAIN_NAME"
fi

# Check if domain resolves to this server
print_status "Checking DNS resolution..."
SERVER_IP=$(curl -s http://checkip.amazonaws.com/)
DOMAIN_IP=$(dig +short $DOMAIN_NAME | tail -n1)

if [[ "$SERVER_IP" != "$DOMAIN_IP" ]]; then
    print_warning "⚠️  Domain $DOMAIN_NAME resolves to $DOMAIN_IP but server IP is $SERVER_IP"
    print_warning "⚠️  Make sure your domain's DNS A record points to $SERVER_IP"
    print_input "Continue anyway? (y/n):"
    read -r CONTINUE
    if [[ ! "$CONTINUE" =~ ^[Yy]$ ]]; then
        print_error "Aborted. Please update your DNS records first."
        exit 1
    fi
fi

# Test Nginx configuration
print_status "Testing Nginx configuration..."
sudo nginx -t

if [ $? -ne 0 ]; then
    print_error "Nginx configuration error! Please fix before continuing."
    exit 1
fi

# Create a test file to verify domain accessibility
print_status "Creating test file for domain verification..."
TEST_FILE="/var/www/html/test-ssl-setup.txt"
echo "SSL setup test - $(date)" | sudo tee $TEST_FILE > /dev/null

# Test domain accessibility
print_status "Testing domain accessibility..."
if curl -f -s "http://$DOMAIN_NAME/test-ssl-setup.txt" > /dev/null; then
    print_status "✅ Domain is accessible via HTTP"
else
    print_warning "⚠️  Cannot access domain via HTTP. This might cause issues."
    print_input "Continue anyway? (y/n):"
    read -r CONTINUE
    if [[ ! "$CONTINUE" =~ ^[Yy]$ ]]; then
        sudo rm -f $TEST_FILE
        exit 1
    fi
fi

# Clean up test file
sudo rm -f $TEST_FILE

# Obtain SSL certificate
print_status "Obtaining SSL certificate from Let's Encrypt..."
print_status "This may take a few minutes..."

# Run Certbot
sudo certbot --nginx $DOMAINS --email $EMAIL --agree-tos --non-interactive --redirect

if [ $? -eq 0 ]; then
    print_status "✅ SSL certificate obtained and installed successfully!"
else
    print_error "❌ Failed to obtain SSL certificate!"
    print_error "Common issues:"
    print_error "1. Domain doesn't point to this server"
    print_error "2. Port 80/443 is not accessible"
    print_error "3. Nginx configuration error"
    exit 1
fi

# Test SSL certificate
print_status "Testing SSL certificate..."
if curl -f -s "https://$DOMAIN_NAME" > /dev/null; then
    print_status "✅ HTTPS is working correctly!"
else
    print_warning "⚠️  HTTPS test failed. Please check manually."
fi

# Set up automatic renewal
print_status "Setting up automatic certificate renewal..."

# Create renewal script
cat > ~/renew-ssl.sh << 'EOF'
#!/bin/bash

# SSL Certificate Renewal Script

echo "🔄 Checking SSL certificate renewal..."

# Renew certificates
certbot renew --quiet

# Reload Nginx if certificates were renewed
if [ $? -eq 0 ]; then
    systemctl reload nginx
    echo "✅ SSL certificates checked/renewed successfully"
else
    echo "❌ SSL renewal failed"
    exit 1
fi
EOF

chmod +x ~/renew-ssl.sh

# Add to crontab if not already present
CRON_JOB="0 12 * * * /home/$(whoami)/renew-ssl.sh >> /home/$(whoami)/ssl-renewal.log 2>&1"

if ! crontab -l 2>/dev/null | grep -q "renew-ssl.sh"; then
    print_status "Adding SSL renewal to crontab..."
    (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
    print_status "✅ Automatic SSL renewal configured"
else
    print_status "SSL renewal already configured in crontab"
fi

# Create SSL monitoring script
print_status "Creating SSL monitoring script..."

cat > ~/check-ssl.sh << EOF
#!/bin/bash

# SSL Certificate Monitoring Script

DOMAIN="$DOMAIN_NAME"

echo "🔒 SSL Certificate Status for \$DOMAIN"
echo "======================================"

# Check certificate expiry
echo "📅 Certificate Expiry:"
echo | openssl s_client -servername \$DOMAIN -connect \$DOMAIN:443 2>/dev/null | openssl x509 -noout -dates

# Check certificate details
echo ""
echo "📋 Certificate Details:"
echo | openssl s_client -servername \$DOMAIN -connect \$DOMAIN:443 2>/dev/null | openssl x509 -noout -subject -issuer

# Check SSL Labs rating (requires internet)
echo ""
echo "🏆 SSL Labs Rating:"
echo "Check manually at: https://www.ssllabs.com/ssltest/analyze.html?d=\$DOMAIN"

# Test HTTPS connectivity
echo ""
echo "🌐 HTTPS Connectivity Test:"
if curl -f -s "https://\$DOMAIN" > /dev/null; then
    echo "✅ HTTPS is working"
else
    echo "❌ HTTPS connection failed"
fi

# Check for mixed content
echo ""
echo "🔍 Security Headers:"
curl -I -s "https://\$DOMAIN" | grep -i "strict-transport-security\|x-frame-options\|x-content-type-options"
EOF

chmod +x ~/check-ssl.sh

# Update firewall to allow HTTPS
print_status "Updating firewall rules..."
sudo ufw status | grep -q "443" || sudo ufw allow 443/tcp

# Create SSL backup script
print_status "Creating SSL backup script..."

cat > ~/backup-ssl.sh << 'EOF'
#!/bin/bash

# SSL Certificate Backup Script

BACKUP_DIR="$HOME/ssl-backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

echo "💾 Backing up SSL certificates..."

# Backup Let's Encrypt directory
sudo tar -czf $BACKUP_DIR/letsencrypt_backup_$DATE.tar.gz /etc/letsencrypt/

# Keep only last 30 days of backups
find $BACKUP_DIR -name "letsencrypt_backup_*.tar.gz" -mtime +30 -delete

echo "✅ SSL backup completed: letsencrypt_backup_$DATE.tar.gz"
EOF

chmod +x ~/backup-ssl.sh

# Show certificate information
print_status "📋 Certificate Information:"
sudo certbot certificates

print_status ""
print_status "✅ SSL setup completed successfully!"
print_status ""
print_status "🔒 Your website is now secured with HTTPS!"
print_status ""
print_status "📝 Summary:"
print_status "- Primary domain: $DOMAIN_NAME"
if [[ "$INCLUDE_WWW" =~ ^[Yy]$ ]]; then
    print_status "- WWW domain: www.$DOMAIN_NAME"
fi
print_status "- SSL provider: Let's Encrypt"
print_status "- Auto-renewal: Enabled (daily check at 12:00 PM)"
print_status ""
print_status "📁 Scripts Created:"
print_status "- SSL renewal: ~/renew-ssl.sh"
print_status "- SSL monitoring: ~/check-ssl.sh"
print_status "- SSL backup: ~/backup-ssl.sh"
print_status ""
print_status "🔧 Useful Commands:"
print_status "- Check certificate: sudo certbot certificates"
print_status "- Test renewal: sudo certbot renew --dry-run"
print_status "- Monitor SSL: ~/check-ssl.sh"
print_status "- Manual renewal: sudo certbot renew"
print_status ""
print_status "🌐 Test Your SSL:"
print_status "- Visit: https://$DOMAIN_NAME"
print_status "- SSL Labs test: https://www.ssllabs.com/ssltest/analyze.html?d=$DOMAIN_NAME"
print_status ""
print_warning "📝 Notes:"
print_warning "- Certificates auto-renew 30 days before expiry"
print_warning "- Check ~/ssl-renewal.log for renewal logs"
print_warning "- Backup your certificates regularly with ~/backup-ssl.sh"
print_status ""
print_status "🎉 Your application is now fully secured with HTTPS!"
EOF