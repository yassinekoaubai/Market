# GitHub Workflows & CI/CD

> Automated testing, building, and deployment pipelines for the Market microservices platform.

## Overview

This project uses GitHub Actions to automate build, test, and deployment processes for all three microservices. All workflows run on every push to `develop` and `main` branches, as well as on pull requests.

## Available Workflows

### 🔨 Build & Test (`build-and-test.yml`)

**Triggers:** Push to main/develop, Pull requests

**Purpose:** Verify that all services build correctly and pass linting

**Steps:**
1. Checkout code
2. Setup Node.js (v20)
3. For each service (Auth, Catalog, Orders):
   - Install dependencies
   - Run linting (if configured)
   - Build TypeScript to JavaScript
4. Build Docker images for each service (on main branch only)

**Duration:** ~5-10 minutes

**Status Badge:**
```markdown
![Build & Test](https://github.com/YOUR_USERNAME/Market/actions/workflows/build-and-test.yml/badge.svg)
```

---

### 🧪 End-to-End Testing (`e2e-tests.yml`)

**Triggers:** Push to main/develop, Pull requests, Daily at 2 AM UTC

**Purpose:** Run comprehensive integration tests with all services running

**Database Setup:**
- Spins up 3 PostgreSQL instances (one per service)
- Runs migrations and seeds data for each service

**Steps:**
1. Setup PostgreSQL services
2. Install dependencies for all services
3. Create test environment files
4. Run database migrations
5. Seed test data
6. Start all three services in background
7. Wait for health checks to pass
8. Run test suites for each service
9. Verify inter-service communication

**Services Started:**
- Auth Service on port 3000
- Catalog Service on port 3001
- Orders Service on port 3002

**Duration:** ~15-20 minutes

---

### ✨ Code Quality (`code-quality.yml`)

**Triggers:** Push to main/develop, Pull requests

**Purpose:** Ensure code quality and security standards

**Checks:**
1. TypeScript compilation for all services
2. ESLint (if configured)
3. NPM dependency audit (moderate level)

**Issues Flagged:**
- TypeScript errors ❌ (blocks merge)
- Lint errors ⚠️ (for review)
- Dependency vulnerabilities ⚠️ (for review)

**Duration:** ~8-10 minutes

---

### 🚀 Deploy to Production (`deploy.yml`)

**Triggers:** Push to main branch, Version tags (v*.*.**)

**Purpose:** Build and push Docker images to container registry

**Steps:**
1. Build Docker images for all services
2. Push to GitHub Container Registry (GHCR)
3. Tag with:
   - Branch name (e.g., `main-abc1234`)
   - Semantic version (e.g., `v1.0.0`)
   - Commit SHA

**Required Secrets:**
- `GITHUB_TOKEN` (automatically provided)

**Images Published:**
- `ghcr.io/{owner}/market-auth`
- `ghcr.io/{owner}/market-catalog`
- `ghcr.io/{owner}/market-orders`

**Duration:** ~10-15 minutes

---

## Workflow Structure

```
.github/
└── workflows/
    ├── build-and-test.yml      # Build all services
    ├── e2e-tests.yml           # Integration testing
    ├── code-quality.yml        # Quality checks
    └── deploy.yml              # Production deployment
```

## Environment Setup

### PostgreSQL Services

Each workflow spins up dedicated PostgreSQL 15 instances:

```yaml
auth_db:
  User: market_user
  Password: market_password
  Port: 5432

catalog_db:
  User: market_user
  Password: market_password
  Port: 5433

orders_db:
  User: market_user
  Password: market_password
  Port: 5434
```

### Node.js

All workflows use Node.js 20 LTS with npm caching for faster builds.

## Workflow Execution Flow

```
Pull Request Created
       ↓
├─ Build & Test (starts immediately)
├─ Code Quality (starts immediately)
├─ E2E Tests (starts after code quality)
       ↓
All pass? → Ready for merge ✅
Fail? → Requires fixes ❌
```

**On merge to main:**
```
Push to main
       ↓
Build & Test
       ↓
Deploy to Production
       ↓
Docker images pushed to GHCR
```

## Monitoring Workflows

### View Workflow Runs

1. Go to **Actions** tab in GitHub repository
2. Select a workflow to view recent runs
3. Click individual run to see details

### Workflow Status

- 🟢 **Success** - All checks passed
- 🟡 **In Progress** - Workflow running
- 🔴 **Failed** - One or more checks failed

### Troubleshooting Failed Workflows

#### Build Failures
```bash
# Locally reproduce the issue
cd <service>
npm ci
npm run build
```

#### Test Failures
```bash
# Run tests locally
npm test

# With coverage
npm run test:coverage
```

#### Database Errors
- Check PostgreSQL connection strings in .env files
- Verify migrations are up to date
- Check seed data for conflicts

## Local Development vs CI/CD

| Aspect | Local | CI/CD |
|--------|-------|-------|
| Node Version | Any | 20 (fixed) |
| OS | Your OS | Ubuntu Latest |
| Database | Your local DB | Fresh instances |
| Dependencies | Cached | Fresh install |
| Build | Incremental | Full |

## Setting Up Secrets

For deployment to work, configure these GitHub Secrets:

### In Repository Settings → Secrets and variables → Actions

```
REGISTRY_TOKEN     # If using private registry
DEPLOYMENT_KEY     # For production deployment
NOTIFICATION_URL   # For Slack/webhook notifications
```

## Customization

### Add Service-Specific Workflows

Create `.github/workflows/auth-test.yml`:

```yaml
name: Auth Service Tests

on:
  push:
    paths:
      - "auth/**"

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      # Auth-specific workflow here
```

### Modify Retry Policy

Add retry logic to steps:

```yaml
- name: Build Service
  run: npm run build
  with:
    max-attempts: 3
    timeout-minutes: 10
```

### Add Notifications

Integrate with Slack or email on failure:

```yaml
- name: Notify on failure
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

## Performance Tips

- ✅ Cache npm dependencies between runs
- ✅ Run checks in parallel where possible
- ✅ Use matrix strategy for services
- ✅ Only run expensive tests in E2E workflow
- ✅ Skip deploy workflow for non-main branches

## Common Issues

### Port Already in Use
```bash
# Kill any processes using ports 3000-3002
lsof -ti:3000,3001,3002 | xargs kill -9
```

### Database Connection Timeout
- Check PostgreSQL service health
- Verify DATABASE_URL format
- Increase timeout in workflow (adjust `health-retries`)

### Node Modules Cache Issues
```yaml
- uses: actions/setup-node@v4
  with:
    cache: 'npm'
    cache-dependency-path: ./**/package-lock.json
```

## Next Steps

1. **Add Test Coverage Reports** - Use codecov.io
2. **Add Semantic Versioning** - Use semantic-release
3. **Add Code Quality Gates** - Use SonarQube
4. **Add Performance Monitoring** - Track build times
5. **Add Infrastructure as Code** - Use Terraform/CloudFormation

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Matrix Strategy Guide](https://docs.github.com/en/actions/using-jobs/using-a-matrix-for-your-jobs)
- [Docker Build Push Action](https://github.com/docker/build-push-action)
- [PostgreSQL Service Container](https://docs.github.com/en/actions/using-containerized-services/creating-postgresql-service-containers)

---

**Keep your pipelines clean and your deployments safe!** 🚀
