# 🔧 GitHub Settings Setup Guide

## Overview
This guide will walk you through configuring all the necessary GitHub settings for your GCMS project, including branch protection, environments, and required reviewers.

## 📋 Prerequisites
- Admin access to your GitHub repository
- Repository URL: `https://github.com/GCMS-project/GCMS-PROJECT`

## 🛡️ Step 1: Branch Protection Rules

### 1.1 Access Branch Settings
1. Go to your repository: `https://github.com/GCMS-project/GCMS-PROJECT`
2. Click on **Settings** tab
3. In the left sidebar, click **Branches**

### 1.2 Protect Main Branch
1. Click **Add rule** or **Add branch protection rule**
2. **Branch name pattern**: Enter `main`
3. Configure the following settings:

#### ✅ **Protect matching branches**
- [x] **Require a pull request before merging**
  - [x] Require approvals: **2**
  - [x] Dismiss stale PR approvals when new commits are pushed
  - [x] Require review from code owners
- [x] **Require status checks to pass before merging**
  - [x] Require branches to be up to date before merging
  - [x] Status checks that are required:
    - `Backend Tests`
    - `Frontend Tests`
    - `Security Scan`
- [x] **Require conversation resolution before merging**
- [x] **Require signed commits**
- [x] **Require linear history**
- [x] **Include administrators**
- [x] **Restrict pushes that create files that are larger than 100 MB**

4. Click **Create** or **Save changes**

### 1.3 Protect Develop Branch
1. Click **Add rule** again
2. **Branch name pattern**: Enter `develop`
3. Configure the following settings:

#### ✅ **Protect matching branches**
- [x] **Require a pull request before merging**
  - [x] Require approvals: **1**
  - [x] Dismiss stale PR approvals when new commits are pushed
- [x] **Require status checks to pass before merging**
  - [x] Require branches to be up to date before merging
  - [x] Status checks that are required:
    - `Backend Tests`
    - `Frontend Tests`
- [x] **Require conversation resolution before merging**
- [x] **Include administrators**
- [x] **Restrict pushes that create files that are larger than 100 MB**

4. Click **Create** or **Save changes**

## 🌍 Step 2: Environment Configuration

### 2.1 Access Environment Settings
1. In Settings, click **Environments** in the left sidebar
2. Click **New environment**

### 2.2 Create Staging Environment
1. **Environment name**: Enter `staging`
2. **Configure protection rules**:
   - [x] **Required reviewers**: Add yourself or team members
   - [x] **Wait timer**: 5 minutes
   - [x] **Deployment branches**: Restrict to `develop` branch
3. Click **Configure environment**

### 2.3 Create Production Environment
1. Click **New environment** again
2. **Environment name**: Enter `production`
3. **Configure protection rules**:
   - [x] **Required reviewers**: Add yourself and at least one other person
   - [x] **Wait timer**: 10 minutes
   - [x] **Deployment branches**: Restrict to `main` branch
   - [x] **Required status checks**:
     - `Backend Tests`
     - `Frontend Tests`
     - `Security Scan`
4. Click **Configure environment**

## 👥 Step 3: Required Reviewers Setup

### 3.1 Code Owners File
The `.github/CODEOWNERS` file has been created automatically. This file defines who should review different parts of the codebase.

### 3.2 Verify Code Owners
1. Go to your repository root
2. Check that `.github/CODEOWNERS` exists
3. Verify the content matches your team structure

## 🔄 Step 4: GitHub Actions Integration

### 4.1 Verify Workflows
1. Go to **Actions** tab in your repository
2. Verify these workflows exist:
   - `GCMS CI/CD Pipeline`
   - `Backend Deployment`
   - `Frontend Deployment`
   - `Docker Deployment`
   - `Branch Management`

### 4.2 Test Workflow
1. Create a test branch: `feature/test-workflow`
2. Make a small change
3. Create a pull request to `develop`
4. Verify that:
   - Status checks run
   - Code owners are requested for review
   - Branch protection rules are enforced

## 📊 Step 5: Status Checks Configuration

### 5.1 Required Status Checks
The following status checks should be configured:

#### For Main Branch:
- `Backend Tests`
- `Frontend Tests`
- `Security Scan`

#### For Develop Branch:
- `Backend Tests`
- `Frontend Tests`

### 5.2 Verify Status Checks
1. Go to **Settings > Branches**
2. Click on the `main` branch rule
3. Verify required status checks are listed
4. Repeat for `develop` branch

## 🔐 Step 6: Security Settings

### 6.1 Enable Security Features
1. Go to **Settings > Security**
2. Enable:
   - [x] **Dependency graph**
   - [x] **Dependabot alerts**
   - [x] **Dependabot security updates**
   - [x] **Code scanning**

### 6.2 Configure Security Scanning
1. Go to **Security > Code security and analysis**
2. Enable:
   - [x] **Code scanning**
   - [x] **Secret scanning**
   - [x] **Dependency review**

## 📝 Step 7: Repository Settings

### 7.1 General Settings
1. Go to **Settings > General**
2. Configure:
   - [x] **Repository name**: GCMS-PROJECT
   - [x] **Description**: Garbage Collection Management System
   - [x] **Website**: (if applicable)
   - [x] **Topics**: garbage-collection, management-system, nodejs, react

### 7.2 Features
1. Enable:
   - [x] **Issues**
   - [x] **Wikis**
   - [x] **Discussions**
   - [x] **Projects**

### 7.3 Merge Button
1. Go to **Settings > General > Pull Requests**
2. Configure:
   - [x] **Allow merge commits**
   - [x] **Allow squash merging**
   - [x] **Allow rebase merging**
   - [x] **Automatically delete head branches**

## ✅ Step 8: Verification Checklist

### 8.1 Branch Protection
- [ ] Main branch requires 2 approvals
- [ ] Develop branch requires 1 approval
- [ ] Status checks are required
- [ ] Administrators are included
- [ ] Linear history is enforced

### 8.2 Environments
- [ ] Staging environment exists
- [ ] Production environment exists
- [ ] Required reviewers are set
- [ ] Wait timers are configured
- [ ] Deployment branches are restricted

### 8.3 Workflows
- [ ] CI/CD pipeline runs on push/PR
- [ ] Status checks pass
- [ ] Code owners are requested
- [ ] Environments are used correctly

### 8.4 Security
- [ ] Security scanning is enabled
- [ ] Dependency alerts are active
- [ ] Code scanning is configured
- [ ] Secret scanning is enabled

## 🚀 Step 9: Test the Setup

### 9.1 Create Test Branch
```bash
git checkout develop
git pull origin develop
git checkout -b feature/test-github-settings
```

### 9.2 Make Test Change
```bash
# Make a small change to any file
echo "# Test change" >> README.md
git add README.md
git commit -m "test: verify GitHub settings"
git push -u origin feature/test-github-settings
```

### 9.3 Create Test Pull Request
1. Go to your repository on GitHub
2. Click **Compare & pull request**
3. Verify:
   - [ ] Status checks are running
   - [ ] Code owners are requested
   - [ ] Branch protection rules are enforced
   - [ ] PR template is used

### 9.4 Test Merge Process
1. Wait for status checks to pass
2. Request review from code owners
3. Get approval
4. Test merge process

## 📞 Troubleshooting

### Common Issues

#### Status Checks Not Running
- Check that workflows are properly configured
- Verify branch protection rules
- Check GitHub Actions permissions

#### Code Owners Not Requested
- Verify `.github/CODEOWNERS` file exists
- Check file paths in CODEOWNERS
- Ensure code owners have repository access

#### Branch Protection Not Working
- Verify branch name patterns
- Check that rules are saved
- Ensure administrators are included

#### Environment Deployment Fails
- Check environment protection rules
- Verify required reviewers
- Check deployment branch restrictions

## 🎉 Success!

Once you've completed all steps, your GCMS project will have:

- ✅ Protected main and develop branches
- ✅ Required code reviews
- ✅ Automated status checks
- ✅ Staging and production environments
- ✅ Security scanning enabled
- ✅ Professional development workflow

Your repository is now ready for collaborative development with proper quality gates and safety measures! 🚀 