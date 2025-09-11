#!/bin/bash

# PostgreSQL Database Setup Script
# Run this after the main VPS setup

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

echo "🗄️  PostgreSQL Database Setup"
echo "================================"

# Get database details from user
print_input "Enter your application database name:"
read -r DB_NAME

print_input "Enter your application database username:"
read -r DB_USER

print_input "Enter a secure password for the database user:"
read -s DB_PASSWORD
echo

print_input "Enter your application name (for reference):"
read -r APP_NAME

# Validate inputs
if [[ -z "$DB_NAME" || -z "$DB_USER" || -z "$DB_PASSWORD" || -z "$APP_NAME" ]]; then
    print_error "All fields are required!"
    exit 1
fi

print_status "Setting up PostgreSQL database..."

# Create database and user
sudo -u postgres psql << EOF
-- Create database
CREATE DATABASE $DB_NAME;

-- Create user with password
CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASSWORD';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;

-- Grant additional privileges
ALTER USER $DB_USER CREATEDB;

-- Show created database and user
\l
\du

-- Quit
\q
EOF

print_status "Database setup completed!"

# Create .env template file
print_status "Creating environment file template..."

cat > ~/.$APP_NAME.env << EOF
# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=$DB_USER
DATABASE_PASSWORD=$DB_PASSWORD
DATABASE_NAME=$DB_NAME

# Application Configuration
NODE_ENV=production
PORT=3000
JWT_SECRET=$(openssl rand -base64 32)

# Add your other environment variables here
# MAIL_HOST=
# MAIL_PORT=
# MAIL_USER=
# MAIL_PASS=
# REDIS_URL=
EOF

print_status "Environment file created: ~/.$APP_NAME.env"

# Update backup script with database details
print_status "Updating backup script with database details..."

sed -i "s/your_app_db/$DB_NAME/g" ~/backup-db.sh
sed -i "s/your_app_user/$DB_USER/g" ~/backup-db.sh

print_status "Backup script updated!"

# Test database connection
print_status "Testing database connection..."

PGPASSWORD=$DB_PASSWORD psql -h localhost -U $DB_USER -d $DB_NAME -c "SELECT version();" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    print_status "✅ Database connection successful!"
else
    print_error "❌ Database connection failed!"
    exit 1
fi

# Configure PostgreSQL for production (optional optimizations)
print_status "Applying production optimizations to PostgreSQL..."

POSTGRES_VERSION=$(sudo -u postgres psql -t -c "SELECT version();" | grep -oP '(?<=PostgreSQL )\d+')
POSTGRES_CONFIG="/etc/postgresql/$POSTGRES_VERSION/main/postgresql.conf"

# Backup original config
sudo cp $POSTGRES_CONFIG $POSTGRES_CONFIG.backup

# Apply basic optimizations
sudo tee -a $POSTGRES_CONFIG > /dev/null << EOF

# Production optimizations added by setup script
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
EOF

# Restart PostgreSQL to apply changes
print_status "Restarting PostgreSQL to apply optimizations..."
sudo systemctl restart postgresql

# Create database monitoring script
print_status "Creating database monitoring script..."

cat > ~/monitor-db.sh << 'EOF'
#!/bin/bash

# Database monitoring script

echo "📊 PostgreSQL Database Status"
echo "=============================="

# Check PostgreSQL service status
echo "🔧 Service Status:"
sudo systemctl is-active postgresql

# Check database connections
echo ""
echo "🔗 Active Connections:"
sudo -u postgres psql -c "SELECT count(*) as active_connections FROM pg_stat_activity WHERE state = 'active';"

# Check database sizes
echo ""
echo "💾 Database Sizes:"
sudo -u postgres psql -c "SELECT datname, pg_size_pretty(pg_database_size(datname)) as size FROM pg_database ORDER BY pg_database_size(datname) DESC;"

# Check recent activity
echo ""
echo "📈 Recent Activity:"
sudo -u postgres psql -c "SELECT datname, numbackends, xact_commit, xact_rollback FROM pg_stat_database WHERE datname NOT IN ('template0', 'template1', 'postgres');"

# Check locks
echo ""
echo "🔒 Current Locks:"
sudo -u postgres psql -c "SELECT count(*) as lock_count FROM pg_locks;"
EOF

chmod +x ~/monitor-db.sh

print_status "Database monitoring script created: ~/monitor-db.sh"

# Display summary
print_status ""
print_status "✅ PostgreSQL setup completed successfully!"
print_status ""
print_status "Database Details:"
print_status "- Database Name: $DB_NAME"
print_status "- Username: $DB_USER"
print_status "- Host: localhost"
print_status "- Port: 5432"
print_status ""
print_status "Files Created:"
print_status "- Environment template: ~/.$APP_NAME.env"
print_status "- Database monitor: ~/monitor-db.sh"
print_status ""
print_status "Next Steps:"
print_status "1. Copy the environment variables to your application"
print_status "2. Update your NestJS app configuration to use these credentials"
print_status "3. Run database migrations if needed"
print_status ""
print_warning "⚠️  Keep your database password secure!"
print_warning "⚠️  Add the .env file to your .gitignore"
print_status ""
print_status "Useful Commands:"
print_status "- Connect to database: psql -h localhost -U $DB_USER -d $DB_NAME"
print_status "- Monitor database: ~/monitor-db.sh"
print_status "- Backup database: ~/backup-db.sh"