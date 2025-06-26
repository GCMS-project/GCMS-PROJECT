#!/bin/bash

# GCMS GitHub Setup Script
# This script helps configure GitHub hosting for the GCMS project

set -e

echo "🚀 GCMS GitHub Hosting Setup"
echo "=============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if git is installed
if ! command -v git &> /dev/null; then
    print_error "Git is not installed. Please install git first."
    exit 1
fi

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "Not in a git repository. Please run this script from the project root."
    exit 1
fi

# Get repository information
REPO_URL=$(git config --get remote.origin.url)
REPO_NAME=$(basename -s .git "$REPO_URL")

print_status "Repository: $REPO_NAME"
print_status "Repository URL: $REPO_URL"

# Check if GitHub Actions directory exists
if [ ! -d ".github/workflows" ]; then
    print_warning "GitHub Actions workflows directory not found."
    print_status "Creating .github/workflows directory..."
    mkdir -p .github/workflows
fi

# Check if required files exist
REQUIRED_FILES=(
    ".github/workflows/ci-cd.yml"
    ".github/workflows/backend-deploy.yml"
    ".github/workflows/frontend-deploy.yml"
    "docker-compose.prod.yml"
    "backend/Dockerfile"
    "web-app/Dockerfile"
)

print_status "Checking required files..."

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_success "✓ $file"
    else
        print_warning "⚠ $file (not found)"
    fi
done

# Generate SSH key for deployment
print_status "Generating SSH key for deployment..."
if [ ! -f ~/.ssh/gcms_deploy_key ]; then
    ssh-keygen -t rsa -b 4096 -C "gcms-deploy@$(hostname)" -f ~/.ssh/gcms_deploy_key -N ""
    print_success "SSH key generated: ~/.ssh/gcms_deploy_key"
else
    print_status "SSH key already exists: ~/.ssh/gcms_deploy_key"
fi

# Display public key
print_status "Public key (add to server authorized_keys):"
echo "=========================================="
cat ~/.ssh/gcms_deploy_key.pub
echo "=========================================="

# Create environment file template
print_status "Creating environment file template..."
cat > .env.template << EOF
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=gcms_user
DB_PASSWORD=your_secure_password
DB_NAME=gcms

# Application Configuration
JWT_SECRET=your_super_secret_jwt_key_min_32_characters
NODE_ENV=production
PORT=3000

# API Configuration
API_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_password

# Payment Configuration (Tanzania)
MPESA_CONSUMER_KEY=your_mpesa_consumer_key
MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
MPESA_PASSKEY=your_mpesa_passkey
MPESA_ENVIRONMENT=sandbox

# Monitoring
GRAFANA_PASSWORD=admin
EOF

print_success "Environment template created: .env.template"

# Create setup instructions
print_status "Creating setup instructions..."
cat > GITHUB_SETUP_INSTRUCTIONS.md << EOF
# GitHub Setup Instructions

## 1. Repository Configuration

### Enable GitHub Actions
1. Go to your repository on GitHub
2. Navigate to Settings > Actions > General
3. Enable "Allow all actions and reusable workflows"
4. Save changes

### Create Environments
1. Go to Settings > Environments
2. Create environment: \`staging\`
3. Create environment: \`production\`
4. Configure protection rules for each

## 2. Required Secrets

Navigate to Settings > Secrets and variables > Actions and add:

### Database Secrets
\`\`\`
DB_HOST=your-database-host.com
DB_PORT=5432
DB_USER=gcms_user
DB_PASSWORD=secure_password_123
DB_NAME=gcms_production
\`\`\`

### Application Secrets
\`\`\`
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
API_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com
\`\`\`

### Deployment Secrets
\`\`\`
DEPLOY_KEY=<contents of ~/.ssh/gcms_deploy_key>
HOST=your-server.com
USER=deploy_user
\`\`\`

## 3. Server Setup

### Add SSH Key to Server
\`\`\`bash
# Copy the public key displayed above to your server
ssh-copy-id -i ~/.ssh/gcms_deploy_key.pub user@your-server.com
\`\`\`

### Install Dependencies
\`\`\`bash
# On your server
sudo apt update
sudo apt install nodejs npm postgresql nginx redis-server
sudo npm install -g pm2
\`\`\`

## 4. Test Deployment

### Test Staging
\`\`\`bash
git push origin develop
\`\`\`

### Test Production
\`\`\`bash
git push origin main
\`\`\`

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
EOF

print_success "Setup instructions created: GITHUB_SETUP_INSTRUCTIONS.md"

# Display next steps
echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "Next steps:"
echo "1. Follow the instructions in GITHUB_SETUP_INSTRUCTIONS.md"
echo "2. Configure GitHub secrets"
echo "3. Set up your server"
echo "4. Test the deployment pipeline"
echo ""
echo "Files created:"
echo "- .env.template (environment variables template)"
echo "- GITHUB_SETUP_INSTRUCTIONS.md (detailed setup guide)"
echo "- SSH key: ~/.ssh/gcms_deploy_key"
echo ""
echo "Remember to:"
echo "- Keep your SSH private key secure"
echo "- Use strong passwords for all secrets"
echo "- Test in staging before production"
echo "- Set up monitoring and alerts"
echo ""
print_success "GitHub hosting setup is ready! 🚀" 