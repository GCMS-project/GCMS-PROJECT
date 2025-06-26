# 🌿 GCMS Branching Strategy

## Overview
This document outlines the branching strategy for the Garbage Collection Management System (GCMS) project, ensuring a clean, organized, and collaborative development workflow.

## Branch Structure

### Main Branches

#### 🌟 `main` (Production)
- **Purpose**: Production-ready code
- **Protection**: Strict protection rules
- **Deployment**: Automatic production deployment
- **Merging**: Only through pull requests from `develop`

#### 🔧 `develop` (Development)
- **Purpose**: Integration branch for features
- **Protection**: Moderate protection rules
- **Deployment**: Automatic staging deployment
- **Merging**: Pull requests from feature branches

### Feature Branches

#### 🚀 Feature Branches (`feature/*`)
- **Naming**: `feature/feature-name`
- **Purpose**: New features and enhancements
- **Source**: `develop`
- **Target**: `develop`
- **Lifecycle**: Delete after merge

#### 🐛 Bug Fix Branches (`bugfix/*`)
- **Naming**: `bugfix/bug-description`
- **Purpose**: Bug fixes and patches
- **Source**: `develop`
- **Target**: `develop`
- **Lifecycle**: Delete after merge

#### 🔥 Hotfix Branches (`hotfix/*`)
- **Naming**: `hotfix/issue-description`
- **Purpose**: Critical production fixes
- **Source**: `main`
- **Target**: `main` and `develop`
- **Lifecycle**: Delete after merge

#### 🧪 Release Branches (`release/*`)
- **Naming**: `release/version-number`
- **Purpose**: Release preparation
- **Source**: `develop`
- **Target**: `main` and `develop`
- **Lifecycle**: Delete after merge

## Workflow

### 1. Starting New Work

#### Feature Development
```bash
# Ensure you're on develop and it's up to date
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/new-feature-name

# Make your changes
# ... code, test, commit ...

# Push feature branch
git push -u origin feature/new-feature-name
```

#### Bug Fix
```bash
# Create bugfix branch
git checkout -b bugfix/fix-login-issue

# Make your changes
# ... code, test, commit ...

# Push bugfix branch
git push -u origin bugfix/fix-login-issue
```

### 2. Development Process

#### Commit Guidelines
```bash
# Use conventional commit messages
git commit -m "feat: add user authentication system"
git commit -m "fix: resolve login validation issue"
git commit -m "docs: update API documentation"
git commit -m "test: add unit tests for user service"
```

#### Commit Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### 3. Pull Request Process

#### Creating Pull Requests
1. **Feature/Bugfix → Develop**
   - Create PR from feature branch to `develop`
   - Add description of changes
   - Request code review
   - Ensure CI/CD passes

2. **Develop → Main**
   - Create PR from `develop` to `main`
   - Requires 2 approvals
   - All tests must pass
   - Deployment to staging successful

#### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes
```

### 4. Release Process

#### Preparing Release
```bash
# Create release branch
git checkout -b release/v1.2.0

# Update version numbers
# Update CHANGELOG.md
# Final testing

# Merge to main and develop
git checkout main
git merge release/v1.2.0
git tag v1.2.0
git push origin main --tags

git checkout develop
git merge release/v1.2.0
git push origin develop

# Delete release branch
git branch -d release/v1.2.0
git push origin --delete release/v1.2.0
```

#### Hotfix Process
```bash
# Create hotfix branch from main
git checkout -b hotfix/critical-security-fix

# Make urgent fix
# ... code, test, commit ...

# Merge to main and develop
git checkout main
git merge hotfix/critical-security-fix
git tag v1.2.1
git push origin main --tags

git checkout develop
git merge hotfix/critical-security-fix
git push origin develop

# Delete hotfix branch
git branch -d hotfix/critical-security-fix
git push origin --delete hotfix/critical-security-fix
```

## Branch Protection Rules

### Main Branch
- Require pull request reviews (2 approvals)
- Require status checks to pass
- Require branches to be up to date
- Include administrators
- Restrict pushes

### Develop Branch
- Require pull request reviews (1 approval)
- Require status checks to pass
- Require branches to be up to date
- Restrict pushes

## CI/CD Integration

### Branch-Specific Workflows
- **Feature/Bugfix**: Run tests, build, deploy to preview
- **Develop**: Run full test suite, deploy to staging
- **Main**: Run full test suite, deploy to production

### Environment Deployment
- **Feature branches**: Preview environment
- **Develop**: Staging environment
- **Main**: Production environment

## Best Practices

### 1. Branch Naming
- Use descriptive names
- Use lowercase with hyphens
- Include issue numbers when applicable
- Examples:
  - `feature/user-authentication`
  - `bugfix/login-validation-issue-123`
  - `hotfix/security-patch-v1.2.1`

### 2. Commit Messages
- Use conventional commit format
- Be descriptive and clear
- Reference issues when applicable
- Keep commits atomic

### 3. Pull Requests
- Keep PRs small and focused
- Add clear descriptions
- Include screenshots for UI changes
- Request appropriate reviewers

### 4. Code Review
- Review for functionality
- Check code quality
- Ensure tests are included
- Verify documentation updates

## Tools and Automation

### GitHub Actions
- Automated testing on all branches
- Automated deployment to environments
- Automated code quality checks
- Automated security scanning

### Branch Management
- Automatic branch cleanup
- Branch naming validation
- PR template enforcement
- Status check requirements

## Troubleshooting

### Common Issues

#### Merge Conflicts
```bash
# Resolve conflicts
git status
# Edit conflicted files
git add .
git commit -m "resolve merge conflicts"
git push origin feature/branch-name
```

#### Branch Out of Date
```bash
# Update feature branch
git checkout feature/branch-name
git rebase develop
# or
git merge develop
```

#### Wrong Branch
```bash
# Stash changes and switch
git stash
git checkout correct-branch
git stash pop
```

## Summary

This branching strategy ensures:
- ✅ Clean, organized development workflow
- ✅ Safe production deployments
- ✅ Collaborative code review process
- ✅ Automated testing and deployment
- ✅ Clear separation of concerns
- ✅ Easy rollback and hotfix process

## Quick Reference

| Branch Type | Source | Target | Purpose |
|-------------|--------|--------|---------|
| `main` | - | - | Production code |
| `develop` | - | - | Integration branch |
| `feature/*` | `develop` | `develop` | New features |
| `bugfix/*` | `develop` | `develop` | Bug fixes |
| `hotfix/*` | `main` | `main` + `develop` | Critical fixes |
| `release/*` | `develop` | `main` + `develop` | Release prep | 