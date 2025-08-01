# Deployment Guide for BORDERLESS TECHNO COMPANY
## Production Deployment to BanaHosting (borderlesstechno.com)

### Prerequisites
- Node.js 18+ installed on hosting server
- MySQL database access on BanaHosting
- Domain configured (borderlesstechno.com)
- SSL certificate configured
- FTP/SSH access to hosting server

### Quick Deployment Steps

#### 1. Prepare Local Environment
```bash
# Run the automated deployment script
./deploy.sh
```

This will:
- Install all dependencies
- Build the frontend for production
- Create deployment package
- Generate `borderless-production.tar.gz`

#### 2. Upload to BanaHosting
1. Upload `borderless-production.tar.gz` to your hosting server root directory
2. Extract the archive:
   ```bash
   tar -xzf borderless-production.tar.gz
   ```

#### 3. Configure Environment Variables
Edit the `.env` file with your actual production values:

```env
# Database Configuration (BanaHosting MySQL)
DB_HOST=localhost
DB_USER=your_banahosting_db_user
DB_PASSWORD=your_banahosting_db_password
DB_NAME=your_database_name

# Generate strong secrets (minimum 32 characters)
JWT_SECRET=your_super_secure_jwt_secret_min_32_chars
SESSION_SECRET=your_super_secure_session_secret

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_USER=admin@borderlesstechno.com
SMTP_PASS=your_gmail_app_password

# Payment Gateways (LIVE KEYS)
STRIPE_SECRET_KEY=sk_live_your_stripe_live_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_live_key
PAYPAL_CLIENT_ID=your_live_paypal_client_id
PAYPAL_CLIENT_SECRET=your_live_paypal_client_secret
PAYPAL_ENVIRONMENT=production
```

#### 4. Setup Database
```bash
# Install dependencies
npm install --production

# Setup production database
npm run db:setup:production
```

#### 5. Start Application
```bash
# Start the server
npm run start:production
```

### Server Configuration

#### Apache/Nginx Configuration
Configure your web server to:
1. Serve static files from `public/` directory
2. Proxy API requests to Node.js server (port 4000)
3. Handle SSL/HTTPS certificates

#### Example Apache .htaccess
```apache
RewriteEngine On

# Handle client-side routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api
RewriteRule . /index.html [L]

# Proxy API requests to Node.js server
RewriteCond %{REQUEST_URI} ^/api
RewriteRule ^api/(.*)$ http://localhost:4000/api/$1 [P,L]
```

### Security Configuration

#### 1. Firewall Rules
- Allow port 80 (HTTP)
- Allow port 443 (HTTPS)  
- Allow port 4000 (Node.js server - internal only)
- Block all other ports

#### 2. SSL Certificate
- Configure SSL certificate for borderlesstechno.com
- Redirect all HTTP traffic to HTTPS
- Enable HSTS headers

#### 3. Database Security
- Use strong passwords for database users
- Limit database access to localhost only
- Regular database backups

### Process Management

#### Using PM2 (Recommended)
```bash
# Install PM2 globally
npm install -g pm2

# Start application with PM2
pm2 start src/index.js --name "borderless-techno" --env production

# Save PM2 configuration
pm2 save

# Setup startup script
pm2 startup
```

#### PM2 Configuration File (ecosystem.config.js)
```javascript
module.exports = {
  apps: [{
    name: 'borderless-techno',
    script: 'src/index.js',
    env: {
      NODE_ENV: 'production',
      PORT: 4000
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

### Monitoring & Maintenance

#### 1. Log Files
- Application logs: `./logs/`
- Error monitoring with PM2
- Database query logs

#### 2. Health Checks
```bash
# Check application status
pm2 status

# View logs
pm2 logs borderless-techno

# Restart application
pm2 restart borderless-techno
```

#### 3. Database Backups
```bash
# Create daily backup script
mysqldump -u username -p database_name > backup_$(date +%Y%m%d).sql
```

### Troubleshooting

#### Common Issues

1. **Port 4000 already in use**
   ```bash
   # Find process using port 4000
   lsof -i :4000
   # Kill the process
   kill -9 <PID>
   ```

2. **Database connection failed**
   - Check database credentials in .env
   - Verify MySQL service is running
   - Check database user permissions

3. **Static files not loading**
   - Verify public/ directory contains built files
   - Check web server configuration
   - Verify file permissions

#### Performance Optimization
- Enable gzip compression
- Configure caching headers
- Use CDN for static assets
- Optimize database queries
- Monitor server resources

### Support & Maintenance

#### Regular Tasks
- Update dependencies monthly
- Monitor SSL certificate expiration
- Regular database backups
- Monitor server resources
- Update payment gateway configurations

#### Emergency Procedures
1. Database restore from backup
2. Rollback to previous version
3. Emergency contact procedures
4. Server migration plan

### Contact Information
- **Technical Support**: admin@borderlesstechno.com
- **Emergency Contact**: [Your emergency contact]
- **Hosting Provider**: BanaHosting Support

---
*Last updated: $(date)*
*Version: 1.0.0*