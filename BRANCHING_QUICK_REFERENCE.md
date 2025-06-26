# 🚀 GCMS Branching Quick Reference

## Current Branch Status
- ✅ **main**: Production-ready code (protected)
- ✅ **develop**: Development integration branch (protected)
- 🔄 **feature/***: Feature development branches
- 🔄 **bugfix/***: Bug fix branches
- 🔄 **hotfix/***: Critical production fixes
- 🔄 **release/***: Release preparation

## Quick Commands

### Starting New Work
```bash
# Always start from develop
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/your-feature-name

# Create bugfix branch
git checkout -b bugfix/issue-description

# Create hotfix branch (from main)
git checkout main
git pull origin main
git checkout -b hotfix/critical-fix
```

### Development Workflow
```bash
# Make your changes
# ... code, test, commit ...

# Use conventional commit messages
git commit -m "feat: add new user authentication"
git commit -m "fix: resolve login validation issue"
git commit -m "docs: update API documentation"

# Push your branch
git push -u origin feature/your-feature-name
```

### Creating Pull Requests
1. **Feature/Bugfix → Develop**
   - Create PR from your branch to `develop`
   - Use the PR template
   - Request code review
   - Ensure CI/CD passes

2. **Develop → Main**
   - Create PR from `develop` to `main`
   - Requires 2 approvals
   - All tests must pass

### Branch Protection Rules

#### Main Branch
- ✅ Require pull request reviews (2 approvals)
- ✅ Require status checks to pass
- ✅ Require branches to be up to date
- ✅ Include administrators
- ✅ Restrict pushes

#### Develop Branch
- ✅ Require pull request reviews (1 approval)
- ✅ Require status checks to pass
- ✅ Require branches to be up to date
- ✅ Restrict pushes

## Branch Naming Convention

| Type | Format | Example |
|------|--------|---------|
| Feature | `feature/description` | `feature/user-authentication` |
| Bug Fix | `bugfix/description` | `bugfix/login-validation-issue` |
| Hotfix | `hotfix/description` | `hotfix/security-patch` |
| Release | `release/version` | `release/v1.2.0` |

## Commit Message Format

```
type(scope): description

[optional body]

[optional footer]
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style
- `refactor`: Code refactoring
- `test`: Tests
- `chore`: Maintenance

### Examples
```bash
git commit -m "feat(auth): add JWT token validation"
git commit -m "fix(api): resolve user login issue"
git commit -m "docs: update API documentation"
git commit -m "test: add unit tests for user service"
```

## Environment Deployment

| Branch | Environment | Deployment |
|--------|-------------|------------|
| `main` | Production | Automatic |
| `develop` | Staging | Automatic |
| `feature/*` | Preview | Automatic |
| `bugfix/*` | Preview | Automatic |
| `hotfix/*` | Production | Manual approval |

## Common Workflows

### Feature Development
```bash
# 1. Start from develop
git checkout develop
git pull origin develop

# 2. Create feature branch
git checkout -b feature/new-feature

# 3. Develop and commit
# ... make changes ...
git add .
git commit -m "feat: implement new feature"

# 4. Push and create PR
git push -u origin feature/new-feature
# Create PR: feature/new-feature → develop
```

### Bug Fix
```bash
# 1. Start from develop
git checkout develop
git pull origin develop

# 2. Create bugfix branch
git checkout -b bugfix/fix-issue-123

# 3. Fix and commit
# ... fix the bug ...
git add .
git commit -m "fix: resolve issue #123"

# 4. Push and create PR
git push -u origin bugfix/fix-issue-123
# Create PR: bugfix/fix-issue-123 → develop
```

### Hotfix (Critical Production Fix)
```bash
# 1. Start from main
git checkout main
git pull origin main

# 2. Create hotfix branch
git checkout -b hotfix/critical-security-fix

# 3. Fix and commit
# ... fix the critical issue ...
git add .
git commit -m "fix: critical security vulnerability"

# 4. Push and create PRs
git push -u origin hotfix/critical-security-fix
# Create PR: hotfix/critical-security-fix → main
# Create PR: hotfix/critical-security-fix → develop
```

### Release Process
```bash
# 1. Create release branch from develop
git checkout develop
git pull origin develop
git checkout -b release/v1.2.0

# 2. Prepare release
# Update version numbers
# Update CHANGELOG.md
# Final testing

# 3. Merge to main and develop
git checkout main
git merge release/v1.2.0
git tag v1.2.0
git push origin main --tags

git checkout develop
git merge release/v1.2.0
git push origin develop

# 4. Delete release branch
git branch -d release/v1.2.0
git push origin --delete release/v1.2.0
```

## Troubleshooting

### Merge Conflicts
```bash
# Resolve conflicts
git status
# Edit conflicted files
git add .
git commit -m "resolve merge conflicts"
git push origin feature/branch-name
```

### Branch Out of Date
```bash
# Update feature branch
git checkout feature/branch-name
git rebase develop
# or
git merge develop
```

### Wrong Branch
```bash
# Stash changes and switch
git stash
git checkout correct-branch
git stash pop
```

## Best Practices

### ✅ Do's
- Always start from `develop` for new features
- Use descriptive branch names
- Write clear commit messages
- Keep PRs small and focused
- Request code reviews
- Test thoroughly before merging

### ❌ Don'ts
- Don't commit directly to `main` or `develop`
- Don't use generic branch names
- Don't commit without testing
- Don't merge without code review
- Don't leave branches open for too long

## Quick Status Check
```bash
# Check current branch
git branch

# Check status
git status

# Check remote branches
git branch -r

# Check recent commits
git log --oneline -10
```

---

**Remember**: Always work on feature branches, never directly on `main` or `develop`! 🚀 