# 🚀 GCMS GitHub Hosting Setup

## Quick Start Guide

This guide will help you set up GitHub hosting for your Garbage Collection Management System (GCMS) with automated CI/CD pipelines.

## 📋 Prerequisites

- GitHub organization account
- Repository with admin access
- Domain name (optional)
- Server/VPS for backend hosting
- Frontend hosting platform (Vercel/Netlify/GitHub Pages)

## 🔧 Step-by-Step Setup

### 1. Repository Configuration

#### 1.1 Enable GitHub Actions
```bash
# Navigate to your repository
# Settings > Actions > General
# Enable "Allow all actions and reusable workflows"
```

#### 1.2 Create Environments
```bash
# Settings > Environments
# Create: staging, production
# Configure protection rules
```

### 2. Required Secrets Setup

Navigate to **Settings > Secrets and variables > Actions** and add:

#### Database Configuration
```
DB_HOST=your-database-host.com
DB_PORT=5432
DB_USER=gcms_user
DB_PASSWORD=secure_password_123
DB_NAME=gcms_production
```

#### Application Secrets
```
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
API_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

#### Deployment Credentials

**For VPS Deployment:**
```
DEPLOY_KEY=-----BEGIN OPENSSH PRIVATE KEY-----
HOST=your-server.com
USER=deploy_user
```

**For Vercel (Frontend):**
```
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id
```

**For Netlify (Alternative):**
```
NETLIFY_AUTH_TOKEN=your-netlify-token
NETLIFY_SITE_ID=your-site-id
```

### 3. Branch Protection Rules

#### Main Branch
- Require pull request reviews (2 reviewers)
- Require status checks to pass
- Require branches to be up to date
- Include administrators

#### Develop Branch
- Require pull request reviews (1 reviewer)
- Require status checks to pass

## 🚀 Deployment Options

### Option A: Docker Deployment (Recommended)

#### Production Docker Compose
```bash
# Deploy with Docker
docker-compose -f docker-compose.prod.yml up -d

# Scale backend
docker-compose -f docker-compose.prod.yml up -d --scale backend=3

# Update deployment
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

### Option B: Manual Server Deployment

#### Server Setup
```bash
# Install dependencies
sudo apt update
sudo apt install nodejs npm postgresql nginx

# Clone repository
git clone https://github.com/your-org/gcms.git
cd gcms

# Install and build
cd backend && npm ci --only=production
cd ../web-app && npm ci && npm run build

# Start with PM2
cd ../backend
pm2 start server.js --name "gcms-api"
pm2 startup
pm2 save
```

### Option C: Cloud Platform Deployment

#### Frontend (Vercel/Netlify)
```bash
# Automatic deployment via GitHub Actions
# Configure in workflow files
```

#### Backend (Railway/Render)
```bash
# Connect repository
# Set environment variables
# Deploy automatically
```

## 🔄 CI/CD Pipeline

### Automated Workflows

1. **Main CI/CD Pipeline** (`ci-cd.yml`)
   - Runs on push to main/develop
   - Tests backend and frontend
   - Builds applications
   - Deploys to staging/production

2. **Backend Deployment** (`backend-deploy.yml`)
   - Deploys API changes
   - Runs database migrations
   - Performs health checks

3. **Frontend Deployment** (`frontend-deploy.yml`)
   - Builds frontend
   - Deploys to hosting platform
   - Updates CDN cache

4. **Docker Deployment** (`docker-deploy.yml`)
   - Builds Docker images
   - Pushes to registry
   - Deploys containers

## 📊 Monitoring & Health Checks

### Application Health
```bash
# API Health Check
curl https://api.yourdomain.com/api/health

# Frontend Health Check
curl https://yourdomain.com
```

### Monitoring Dashboard
- **Prometheus**: http://yourdomain.com:9090
- **Grafana**: http://yourdomain.com:3001

### Logs
```bash
# Application logs
pm2 logs gcms-api

# Docker logs
docker-compose logs -f backend

# Nginx logs
sudo tail -f /var/log/nginx/access.log
```

## 🔒 Security Configuration

### SSL/TLS Setup
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Environment Protection
- Staging: 1 reviewer, 5-minute wait
- Production: 2 reviewers, 10-minute wait
- Required status checks for production

## 🗄️ Database Management

### Migrations
```bash
# Run migrations
cd backend
npm run migrate

# Seed database
npm run seed

# Backup
pg_dump -h localhost -U postgres gcms > backup.sql
```

### Environment-Specific Databases
- **Development**: Local PostgreSQL
- **Staging**: Staging database
- **Production**: Production database

## 🚨 Troubleshooting

### Common Issues

#### 1. Port Conflicts
```bash
# Find process using port
sudo lsof -i :3000

# Kill process
sudo kill -9 <PID>
```

#### 2. Database Connection
```bash
# Check database status
sudo systemctl status postgresql

# Test connection
psql -h localhost -U postgres -d gcms
```

#### 3. Build Failures
```bash
# Clear cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Debugging Steps

1. **Check GitHub Actions Logs**
   - Go to Actions tab
   - Click on failed workflow
   - Review step-by-step logs

2. **Verify Secrets**
   - Check all required secrets are set
   - Ensure secret names match workflow

3. **Test Locally**
   - Run tests: `npm test`
   - Build: `npm run build`
   - Check environment variables

## 📈 Performance Optimization

### Backend
- Enable compression
- Implement Redis caching
- Optimize database queries
- Use connection pooling

### Frontend
- Enable gzip compression
- Optimize bundle size
- Implement lazy loading
- Use CDN for static assets

## 🔄 Update Process

### Regular Updates
```bash
# Pull latest changes
git pull origin main

# Install dependencies
npm ci

# Run migrations
npm run migrate

# Restart services
pm2 restart gcms-api
# or
docker-compose -f docker-compose.prod.yml up -d
```

### Major Updates
1. Create feature branch
2. Make changes
3. Test locally
4. Create pull request
5. Get approval
6. Merge to develop (staging)
7. Test staging
8. Merge to main (production)

## 📞 Support

### Documentation
- [Deployment Guide](docs/deployment.md)
- [GitHub Setup Guide](docs/github-setup.md)
- [Technical Documentation](GCMS_Technical_Documentation.md)

### Monitoring
- GitHub Actions: Repository > Actions
- Application Logs: PM2/Docker logs
- Health Checks: `/api/health` endpoint

### Contact
- System Administrator
- GitHub Support
- Platform-specific support (Vercel/Netlify/etc.)

## ✅ Checklist

- [ ] GitHub repository configured
- [ ] Environments created (staging, production)
- [ ] All secrets configured
- [ ] Branch protection rules set
- [ ] CI/CD workflows working
- [ ] SSL certificates installed
- [ ] Monitoring configured
- [ ] Backup strategy implemented
- [ ] Security measures in place
- [ ] Performance optimized

## 🎉 Success!

Your GCMS project is now configured for automated deployment with:
- ✅ Automated testing and building
- ✅ Staging and production environments
- ✅ Security protection rules
- ✅ Monitoring and health checks
- ✅ SSL/TLS encryption
- ✅ Database management
- ✅ Performance optimization

**Next Steps:**
1. Test the deployment pipeline
2. Configure monitoring alerts
3. Set up regular backups
4. Train team on deployment process
5. Document any custom configurations 