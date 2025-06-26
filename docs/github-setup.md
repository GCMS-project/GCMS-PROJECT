# GitHub Actions Setup Guide

## Overview
This guide explains how to configure GitHub Actions for the GCMS project, including setting up secrets, environments, and deployment workflows.

## Repository Setup

### 1. Enable GitHub Actions
1. Go to your repository on GitHub
2. Navigate to Settings > Actions > General
3. Enable "Allow all actions and reusable workflows"
4. Save changes

### 2. Create Environments

#### Staging Environment
1. Go to Settings > Environments
2. Click "New environment"
3. Name: `staging`
4. Add protection rules:
   - Required reviewers: 1
   - Wait timer: 5 minutes
   - Deployment branches: `develop`

#### Production Environment
1. Go to Settings > Environments
2. Click "New environment"
3. Name: `production`
4. Add protection rules:
   - Required reviewers: 2
   - Wait timer: 10 minutes
   - Deployment branches: `main`
   - Required status checks: All

## Required Secrets

### 1. Database Secrets
Navigate to Settings > Secrets and variables > Actions

#### Add these secrets:
```
DB_HOST
DB_PORT
DB_USER
DB_PASSWORD
DB_NAME
```

**Example values:**
```
DB_HOST=your-db-host.com
DB_PORT=5432
DB_USER=gcms_user
DB_PASSWORD=secure_password_123
DB_NAME=gcms_production
```

### 2. Application Secrets
```
JWT_SECRET
API_URL
FRONTEND_URL
```

**Example values:**
```
JWT_SECRET=your-super-secret-jwt-key-here
API_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

### 3. Deployment Secrets

#### For VPS/Server Deployment:
```
DEPLOY_KEY
HOST
USER
```

**How to generate deploy key:**
```bash
# Generate SSH key pair
ssh-keygen -t rsa -b 4096 -C "github-actions@yourdomain.com" -f ~/.ssh/github_actions

# Add public key to server
ssh-copy-id -i ~/.ssh/github_actions.pub user@your-server.com

# Add private key to GitHub secrets
cat ~/.ssh/github_actions
```

#### For Vercel Deployment:
```
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
```

**How to get Vercel credentials:**
1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Get token: `vercel whoami`
4. Get org ID: `vercel teams ls`
5. Get project ID: `vercel projects ls`

#### For Netlify Deployment:
```
NETLIFY_AUTH_TOKEN
NETLIFY_SITE_ID
```

**How to get Netlify credentials:**
1. Go to Netlify dashboard
2. Navigate to User Settings > Applications > Personal access tokens
3. Create new token
4. Get site ID from site settings

## Branch Protection Rules

### 1. Main Branch Protection
1. Go to Settings > Branches
2. Add rule for `main` branch
3. Enable:
   - Require pull request reviews
   - Require status checks to pass
   - Require branches to be up to date
   - Include administrators

### 2. Develop Branch Protection
1. Add rule for `develop` branch
2. Enable:
   - Require pull request reviews
   - Require status checks to pass

## Workflow Configuration

### 1. CI/CD Pipeline
The main workflow (`ci-cd.yml`) will:
- Run tests on push/PR
- Build applications
- Deploy to staging (develop branch)
- Deploy to production (main branch)

### 2. Backend Deployment
The backend workflow (`backend-deploy.yml`) will:
- Deploy API changes
- Run database migrations
- Perform health checks

### 3. Frontend Deployment
The frontend workflow (`frontend-deploy.yml`) will:
- Build frontend application
- Deploy to hosting platform
- Update CDN cache

## Testing Workflows

### 1. Manual Testing
```bash
# Test staging deployment
git push origin develop

# Test production deployment
git push origin main
```

### 2. Workflow Dispatch
You can manually trigger workflows:
1. Go to Actions tab
2. Select workflow
3. Click "Run workflow"
4. Choose branch and inputs

## Monitoring Deployments

### 1. GitHub Actions Logs
- Go to Actions tab
- Click on workflow run
- View detailed logs for each step

### 2. Environment Status
- Go to Environments
- View deployment history
- Check protection rules

### 3. Deployment Notifications
Configure notifications in:
- Repository settings
- Environment settings
- Personal notification preferences

## Troubleshooting

### Common Issues

#### 1. Secrets Not Found
```
Error: Required secret 'DB_HOST' not found
```
**Solution:** Add missing secret in repository settings

#### 2. Permission Denied
```
Error: Permission denied (publickey)
```
**Solution:** Check deploy key configuration

#### 3. Environment Protection
```
Error: Environment 'production' is protected
```
**Solution:** Ensure required reviewers approve deployment

#### 4. Status Check Failures
```
Error: Required status check 'Backend Tests' is expected
```
**Solution:** Fix failing tests or update status check requirements

### Debugging Steps

1. **Check Workflow Logs**
   - Go to Actions > Workflow runs
   - Click on failed run
   - Review step-by-step logs

2. **Verify Secrets**
   - Go to Settings > Secrets
   - Ensure all required secrets are set
   - Check secret names match workflow

3. **Test Locally**
   - Run tests locally: `npm test`
   - Build locally: `npm run build`
   - Check environment variables

4. **Check Permissions**
   - Verify GitHub token permissions
   - Check repository access
   - Confirm environment access

## Security Best Practices

### 1. Secret Management
- Use environment-specific secrets
- Rotate secrets regularly
- Limit secret access
- Use least privilege principle

### 2. Access Control
- Require PR reviews
- Use branch protection
- Limit admin access
- Audit access regularly

### 3. Monitoring
- Monitor deployment logs
- Set up alerts for failures
- Track deployment metrics
- Review security events

## Next Steps

1. **Configure Environments**
   - Set up staging environment
   - Set up production environment
   - Configure protection rules

2. **Add Secrets**
   - Database credentials
   - Deployment keys
   - API tokens

3. **Test Workflows**
   - Push to develop branch
   - Verify staging deployment
   - Test production deployment

4. **Monitor & Optimize**
   - Set up monitoring
   - Configure alerts
   - Optimize performance

## Support

For GitHub Actions issues:
1. Check workflow documentation
2. Review GitHub Actions logs
3. Verify secret configuration
4. Contact GitHub support if needed 