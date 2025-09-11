# VPS Deployment Scripts

This directory contains automated scripts to deploy a NestJS backend with PostgreSQL database and Vue/React frontend to a VPS.

## 🚀 Quick Start

### 1. Initial VPS Setup
```bash
# Make scripts executable
chmod +x *.sh

# Run initial VPS setup
./setup-vps.sh
```

### 2. Database Setup
```bash
# Configure PostgreSQL database
./setup-database.sh
```

### 3. Deploy Application
```bash
# Deploy your NestJS + Frontend application
./deploy-app.sh
```

### 4. Setup SSL
```bash
# Configure HTTPS with Let's Encrypt
./setup-ssl.sh
```

## 📋 Prerequisites

- Fresh Ubuntu 22.04 LTS VPS
- Non-root user with sudo privileges
- Domain name pointed to your VPS IP (for SSL)
- Git repositories for your backend and frontend

## 🔧 Script Details

### setup-vps.sh
- Updates system packages
- Installs Node.js, PostgreSQL, Nginx, PM2
- Configures firewall and basic security
- Creates directory structure
- Sets up fail2ban for security

### setup-database.sh
- Creates PostgreSQL database and user
- Applies production optimizations
- Creates environment file template
- Sets up database monitoring and backup scripts

### deploy-app.sh
- Clones and deploys backend and frontend
- Configures PM2 for process management
- Sets up Nginx reverse proxy
- Creates deployment and monitoring scripts

### setup-ssl.sh
- Obtains Let's Encrypt SSL certificate
- Configures HTTPS redirect
- Sets up automatic renewal
- Creates SSL monitoring and backup scripts

## 📁 Generated Files

After running all scripts, you'll have:

```
~/
├── apps/                          # Application directories
│   ├── your-app-backend/         # NestJS backend
│   └── your-app-frontend/        # Vue/React frontend
├── backups/                      # Database backups
├── ssl-backups/                  # SSL certificate backups
├── logs/                         # Application logs
├── .your-app.env                 # Environment variables template
├── ecosystem.config.js           # PM2 configuration
├── deploy.sh                     # General deployment script
├── update-your-app.sh            # App-specific update script
├── monitor-your-app.sh           # Application monitoring
├── backup-db.sh                  # Database backup script
├── monitor-db.sh                 # Database monitoring
├── renew-ssl.sh                  # SSL renewal script
├── check-ssl.sh                  # SSL monitoring
└── backup-ssl.sh                 # SSL backup script
```

## 🔐 Security Features

- UFW firewall configuration
- Fail2ban for intrusion prevention
- SSL/TLS encryption with Let's Encrypt
- Security headers in Nginx
- Non-root user deployment
- Secure database configuration

## 📊 Monitoring & Maintenance

### Application Monitoring
```bash
# Check application status
~/monitor-your-app.sh

# Check database status
~/monitor-db.sh

# Check SSL certificate
~/check-ssl.sh
```

### Updates & Backups
```bash
# Update application
~/update-your-app.sh

# Backup database
~/backup-db.sh

# Backup SSL certificates
~/backup-ssl.sh
```

## 🛠️ Manual Configuration

### 1. Environment Variables
Update your backend `.env` file:
```bash
nano ~/apps/your-app-backend/.env
```

### 2. Database Credentials
Use the credentials from `~/.your-app.env`:
- Database name: `your_app_db`
- Username: `your_app_user`
- Password: (generated during setup)

### 3. Frontend API URL
The frontend is automatically configured to use:
- Production: `https://yourdomain.com/api`
- Development: `http://localhost:3000/api`

## 🔧 Useful Commands

### PM2 Management
```bash
pm2 status                    # Check all processes
pm2 logs your-app-backend     # View backend logs
pm2 restart your-app-backend  # Restart backend
pm2 stop your-app-backend     # Stop backend
pm2 delete your-app-backend   # Remove from PM2
```

### Nginx Management
```bash
sudo systemctl status nginx   # Check Nginx status
sudo nginx -t                 # Test configuration
sudo systemctl reload nginx   # Reload configuration
sudo systemctl restart nginx  # Restart Nginx
```

### PostgreSQL Management
```bash
sudo systemctl status postgresql        # Check PostgreSQL status
psql -h localhost -U your_user -d your_db  # Connect to database
sudo -u postgres psql                   # Connect as postgres user
```

### SSL Management
```bash
sudo certbot certificates              # List certificates
sudo certbot renew --dry-run          # Test renewal
sudo certbot renew                    # Manual renewal
```

## 🐛 Troubleshooting

### Common Issues

1. **Port 3000 already in use**
   ```bash
   sudo lsof -i :3000
   sudo kill -9 <PID>
   ```

2. **Nginx configuration error**
   ```bash
   sudo nginx -t
   sudo tail -f /var/log/nginx/error.log
   ```

3. **Database connection failed**
   ```bash
   sudo systemctl status postgresql
   ~/monitor-db.sh
   ```

4. **SSL certificate issues**
   ```bash
   ~/check-ssl.sh
   sudo certbot certificates
   ```

5. **PM2 process not starting**
   ```bash
   pm2 logs your-app-backend
   cd ~/apps/your-app-backend && npm run start
   ```

### Log Locations
- Application logs: `~/apps/your-app-backend/logs/`
- Nginx logs: `/var/log/nginx/`
- PostgreSQL logs: `/var/log/postgresql/`
- SSL renewal logs: `~/ssl-renewal.log`

## 📈 Performance Optimization

### Database Optimization
The scripts automatically apply these PostgreSQL optimizations:
- Increased shared_buffers
- Optimized checkpoint settings
- Improved cache settings

### Nginx Optimization
- Gzip compression enabled
- Static file caching
- Security headers
- HTTP/2 support

### PM2 Optimization
- Cluster mode for load balancing
- Automatic restart on crashes
- Log rotation
- Memory limit protection

## 🔄 CI/CD Integration

For automated deployments, you can integrate these scripts with GitHub Actions:

```yaml
# .github/workflows/deploy.yml
name: Deploy to VPS

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - name: Deploy to VPS
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.VPS_HOST }}
        username: ${{ secrets.VPS_USER }}
        key: ${{ secrets.VPS_SSH_KEY }}
        script: |
          cd ~/
          ./update-your-app.sh
```

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the generated log files
3. Ensure all prerequisites are met
4. Verify your domain DNS settings
5. Check firewall and security group settings

## 🎯 Next Steps

After successful deployment:

1. Test all application functionality
2. Set up monitoring and alerting
3. Configure regular backups
4. Implement proper logging
5. Set up staging environment
6. Configure CI/CD pipeline
7. Monitor performance and optimize

Your application should now be live at `https://yourdomain.com`! 🎉