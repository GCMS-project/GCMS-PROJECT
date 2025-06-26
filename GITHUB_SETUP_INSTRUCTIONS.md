# GitHub Setup Instructions

## 1. Repository Configuration

### Enable GitHub Actions
1. Go to your repository on GitHub
2. Navigate to Settings > Actions > General
3. Enable "Allow all actions and reusable workflows"
4. Save changes

### Create Environments
1. Go to Settings > Environments
2. Create environment: `staging`
3. Create environment: `production`
4. Configure protection rules for each

## 2. Required Secrets

Navigate to Settings > Secrets and variables > Actions and add:

### Database Secrets
```
DB_HOST=your-database-host.com
DB_PORT=5432
DB_USER=gcms_user
DB_PASSWORD=secure_password_123
DB_NAME=gcms_production
```

### Application Secrets
```
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
API_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

### Deployment Secrets
```
DEPLOY_KEY=<contents of C:\Users\luqma\.ssh\gcms_deploy_key>
HOST=your-server.com
USER=deploy_user
```

## 3. Server Setup

### Add SSH Key to Server
```bash
# Copy the public key displayed above to your server
ssh-copy-id -i C:\Users\luqma\.ssh\gcms_deploy_key.pub user@your-server.com
```

### Install Dependencies
```bash
# On your server
sudo apt update
sudo apt install nodejs npm postgresql nginx redis-server
sudo npm install -g pm2
```

## 4. Test Deployment

### Test Staging
```bash
git push origin develop
```

### Test Production
```bash
git push origin main
```

## 5. Monitoring

- GitHub Actions: Repository > Actions
- Application Logs: PM2/Docker logs
- Health Check: https://api.yourdomain.com/api/health

## Support

For issues, check:
1. GitHub Actions logs
2. Server logs
3. Environment variables
4. Network connectivity
