# GCMS Deployment Guide

## Overview
This guide covers deploying the Garbage Collection Management System (GCMS) to various environments using GitHub Actions and Docker.

## Prerequisites

### 1. GitHub Repository Setup
- Repository with GitHub Actions enabled
- Organization with environment protection rules
- Required secrets configured

### 2. Required GitHub Secrets

#### Database Secrets
```
DB_HOST=your-database-host
DB_PORT=5432
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=gcms
```

#### Deployment Secrets
```
DEPLOY_KEY=your-ssh-private-key
HOST=your-server-hostname
USER=your-server-user
```

#### Frontend Deployment (Choose one)

**For Vercel:**
```
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id
```

**For Netlify:**
```
NETLIFY_AUTH_TOKEN=your-netlify-token
NETLIFY_SITE_ID=your-site-id
```

#### Application Secrets
```
JWT_SECRET=your-jwt-secret-key
API_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

## Deployment Options

### Option 1: Docker Deployment (Recommended)

#### 1.1 Local Development
```bash
# Start development environment
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### 1.2 Production Deployment
```bash
# Deploy to production
docker-compose -f docker-compose.prod.yml up -d

# Scale services
docker-compose -f docker-compose.prod.yml up -d --scale backend=3

# Update deployment
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

### Option 2: Manual Server Deployment

#### 2.1 Server Setup
```bash
# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Install PM2
npm install -g pm2

# Install Nginx
sudo apt-get install nginx
```

#### 2.2 Application Deployment
```bash
# Clone repository
git clone https://github.com/your-org/gcms.git
cd gcms

# Install dependencies
cd backend && npm ci --only=production
cd ../web-app && npm ci

# Build frontend
cd web-app && npm run build

# Start backend with PM2
cd ../backend
pm2 start server.js --name "gcms-api"

# Configure Nginx
sudo cp nginx.conf /etc/nginx/sites-available/gcms
sudo ln -s /etc/nginx/sites-available/gcms /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### Option 3: Cloud Platform Deployment

#### 3.1 Vercel (Frontend)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd web-app
vercel --prod
```

#### 3.2 Railway/Render (Backend)
```bash
# Connect repository to Railway/Render
# Configure environment variables
# Deploy automatically on push
```

## Environment Configuration

### Development
```bash
# Copy environment file
cp env.example .env

# Configure local database
# Update API URLs
# Set development secrets
```

### Staging
```bash
# Environment variables set in GitHub
# Database: staging database
# API URL: https://staging-api.yourdomain.com
# Frontend URL: https://staging.yourdomain.com
```

### Production
```bash
# Environment variables set in GitHub
# Database: production database
# API URL: https://api.yourdomain.com
# Frontend URL: https://yourdomain.com
```

## Database Management

### Migrations
```bash
# Run migrations
cd backend
npm run migrate

# Rollback migrations
npm run migrate:undo

# Seed database
npm run seed
```

### Backup
```bash
# Create backup
pg_dump -h localhost -U postgres gcms > backup.sql

# Restore backup
psql -h localhost -U postgres gcms < backup.sql
```

## Monitoring & Logging

### Application Logs
```bash
# View PM2 logs
pm2 logs gcms-api

# View Docker logs
docker-compose logs -f backend

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
```

### Health Checks
```bash
# API health check
curl https://api.yourdomain.com/api/health

# Frontend health check
curl https://yourdomain.com
```

### Monitoring Dashboard
- Prometheus: http://yourdomain.com:9090
- Grafana: http://yourdomain.com:3001

## SSL/TLS Configuration

### Let's Encrypt
```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port
sudo lsof -i :3000

# Kill process
sudo kill -9 <PID>
```

#### Database Connection Issues
```bash
# Check database status
sudo systemctl status postgresql

# Test connection
psql -h localhost -U postgres -d gcms
```

#### Build Failures
```bash
# Clear cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## Security Checklist

- [ ] Environment variables properly configured
- [ ] Database passwords are strong
- [ ] JWT secrets are secure
- [ ] SSL/TLS certificates installed
- [ ] Firewall rules configured
- [ ] Regular security updates
- [ ] Database backups scheduled
- [ ] Monitoring alerts configured

## Performance Optimization

### Backend
- Enable compression
- Implement caching
- Optimize database queries
- Use connection pooling

### Frontend
- Enable gzip compression
- Optimize bundle size
- Implement lazy loading
- Use CDN for static assets

## Support

For deployment issues:
1. Check application logs
2. Verify environment variables
3. Test database connectivity
4. Review GitHub Actions logs
5. Contact system administrator 