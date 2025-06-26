@echo off
REM GCMS GitHub Setup Script for Windows
REM This script helps configure GitHub hosting for the GCMS project

echo 🚀 GCMS GitHub Hosting Setup
echo ==============================

REM Check if git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Git is not installed. Please install git first.
    exit /b 1
)

REM Check if we're in a git repository
git rev-parse --git-dir >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Not in a git repository. Please run this script from the project root.
    exit /b 1
)

REM Get repository information
for /f "tokens=*" %%i in ('git config --get remote.origin.url') do set REPO_URL=%%i
for /f "tokens=* delims=/" %%i in ("%REPO_URL%") do set REPO_NAME=%%i
set REPO_NAME=%REPO_NAME:.git=%

echo [INFO] Repository: %REPO_NAME%
echo [INFO] Repository URL: %REPO_URL%

REM Check if GitHub Actions directory exists
if not exist ".github\workflows" (
    echo [WARNING] GitHub Actions workflows directory not found.
    echo [INFO] Creating .github\workflows directory...
    mkdir ".github\workflows"
)

REM Check if required files exist
echo [INFO] Checking required files...

if exist ".github\workflows\ci-cd.yml" (
    echo ✓ .github\workflows\ci-cd.yml
) else (
    echo ⚠ .github\workflows\ci-cd.yml (not found)
)

if exist ".github\workflows\backend-deploy.yml" (
    echo ✓ .github\workflows\backend-deploy.yml
) else (
    echo ⚠ .github\workflows\backend-deploy.yml (not found)
)

if exist ".github\workflows\frontend-deploy.yml" (
    echo ✓ .github\workflows\frontend-deploy.yml
) else (
    echo ⚠ .github\workflows\frontend-deploy.yml (not found)
)

if exist "docker-compose.prod.yml" (
    echo ✓ docker-compose.prod.yml
) else (
    echo ⚠ docker-compose.prod.yml (not found)
)

if exist "backend\Dockerfile" (
    echo ✓ backend\Dockerfile
) else (
    echo ⚠ backend\Dockerfile (not found)
)

if exist "web-app\Dockerfile" (
    echo ✓ web-app\Dockerfile
) else (
    echo ⚠ web-app\Dockerfile (not found)
)

REM Generate SSH key for deployment
echo [INFO] Generating SSH key for deployment...
if not exist "%USERPROFILE%\.ssh\gcms_deploy_key" (
    ssh-keygen -t rsa -b 4096 -C "gcms-deploy@%COMPUTERNAME%" -f "%USERPROFILE%\.ssh\gcms_deploy_key" -N ""
    echo [SUCCESS] SSH key generated: %USERPROFILE%\.ssh\gcms_deploy_key
) else (
    echo [INFO] SSH key already exists: %USERPROFILE%\.ssh\gcms_deploy_key
)

REM Display public key
echo [INFO] Public key (add to server authorized_keys):
echo ==========================================
type "%USERPROFILE%\.ssh\gcms_deploy_key.pub"
echo ==========================================

REM Create environment file template
echo [INFO] Creating environment file template...
(
echo # Database Configuration
echo DB_HOST=localhost
echo DB_PORT=5432
echo DB_USER=gcms_user
echo DB_PASSWORD=your_secure_password
echo DB_NAME=gcms
echo.
echo # Application Configuration
echo JWT_SECRET=your_super_secret_jwt_key_min_32_characters
echo NODE_ENV=production
echo PORT=3000
echo.
echo # API Configuration
echo API_URL=https://api.yourdomain.com
echo FRONTEND_URL=https://yourdomain.com
echo.
echo # Redis Configuration
echo REDIS_URL=redis://localhost:6379
echo.
echo # Email Configuration
echo SMTP_HOST=smtp.gmail.com
echo SMTP_PORT=587
echo SMTP_USER=your_email@gmail.com
echo SMTP_PASS=your_email_password
echo.
echo # Payment Configuration (Tanzania)
echo MPESA_CONSUMER_KEY=your_mpesa_consumer_key
echo MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
echo MPESA_PASSKEY=your_mpesa_passkey
echo MPESA_ENVIRONMENT=sandbox
echo.
echo # Monitoring
echo GRAFANA_PASSWORD=admin
) > .env.template

echo [SUCCESS] Environment template created: .env.template

REM Create setup instructions
echo [INFO] Creating setup instructions...
(
echo # GitHub Setup Instructions
echo.
echo ## 1. Repository Configuration
echo.
echo ### Enable GitHub Actions
echo 1. Go to your repository on GitHub
echo 2. Navigate to Settings ^> Actions ^> General
echo 3. Enable "Allow all actions and reusable workflows"
echo 4. Save changes
echo.
echo ### Create Environments
echo 1. Go to Settings ^> Environments
echo 2. Create environment: `staging`
echo 3. Create environment: `production`
echo 4. Configure protection rules for each
echo.
echo ## 2. Required Secrets
echo.
echo Navigate to Settings ^> Secrets and variables ^> Actions and add:
echo.
echo ### Database Secrets
echo ```
echo DB_HOST=your-database-host.com
echo DB_PORT=5432
echo DB_USER=gcms_user
echo DB_PASSWORD=secure_password_123
echo DB_NAME=gcms_production
echo ```
echo.
echo ### Application Secrets
echo ```
echo JWT_SECRET=your-super-secret-jwt-key-min-32-chars
echo API_URL=https://api.yourdomain.com
echo FRONTEND_URL=https://yourdomain.com
echo ```
echo.
echo ### Deployment Secrets
echo ```
echo DEPLOY_KEY=^<contents of %USERPROFILE%\.ssh\gcms_deploy_key^>
echo HOST=your-server.com
echo USER=deploy_user
echo ```
echo.
echo ## 3. Server Setup
echo.
echo ### Add SSH Key to Server
echo ```bash
echo # Copy the public key displayed above to your server
echo ssh-copy-id -i %USERPROFILE%\.ssh\gcms_deploy_key.pub user@your-server.com
echo ```
echo.
echo ### Install Dependencies
echo ```bash
echo # On your server
echo sudo apt update
echo sudo apt install nodejs npm postgresql nginx redis-server
echo sudo npm install -g pm2
echo ```
echo.
echo ## 4. Test Deployment
echo.
echo ### Test Staging
echo ```bash
echo git push origin develop
echo ```
echo.
echo ### Test Production
echo ```bash
echo git push origin main
echo ```
echo.
echo ## 5. Monitoring
echo.
echo - GitHub Actions: Repository ^> Actions
echo - Application Logs: PM2/Docker logs
echo - Health Check: https://api.yourdomain.com/api/health
echo.
echo ## Support
echo.
echo For issues, check:
echo 1. GitHub Actions logs
echo 2. Server logs
echo 3. Environment variables
echo 4. Network connectivity
) > GITHUB_SETUP_INSTRUCTIONS.md

echo [SUCCESS] Setup instructions created: GITHUB_SETUP_INSTRUCTIONS.md

REM Display next steps
echo.
echo 🎉 Setup Complete!
echo ==================
echo.
echo Next steps:
echo 1. Follow the instructions in GITHUB_SETUP_INSTRUCTIONS.md
echo 2. Configure GitHub secrets
echo 3. Set up your server
echo 4. Test the deployment pipeline
echo.
echo Files created:
echo - .env.template (environment variables template)
echo - GITHUB_SETUP_INSTRUCTIONS.md (detailed setup guide)
echo - SSH key: %USERPROFILE%\.ssh\gcms_deploy_key
echo.
echo Remember to:
echo - Keep your SSH private key secure
echo - Use strong passwords for all secrets
echo - Test in staging before production
echo - Set up monitoring and alerts
echo.
echo [SUCCESS] GitHub hosting setup is ready! 🚀

pause 