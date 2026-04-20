# Jenkins Configuration for Market Microservices

## Overview

This directory contains Jenkins pipeline definitions for the Market microservices application. Replace GitHub Actions with Jenkins for CI/CD automation.

## Pipeline Files

### 1. **Jenkinsfile** (Main Pipeline)
Primary pipeline handling build, test, and code quality across all three services.

**Triggers:**
- GitHub push events (via webhook)
- Poll SCM every 15 minutes
- Manual trigger

**Stages:**
1. Checkout - Clone repository
2. Setup - Verify environment
3. Install Dependencies - Parallel npm install for all services
4. Build & TypeScript Check - Parallel builds for all services
5. Code Quality Analysis - Lint and audit for all services
6. Build Docker Images - Build Docker images for all services
7. Push to Registry - Push to GHCR (conditional on main branch)
8. Deploy to Production - Production deployment (conditional on parameter)

**Parameters:**
- `SKIP_TESTS` - Skip running tests
- `DEPLOY_PRODUCTION` - Deploy to production
- `NODE_VERSION` - Select Node.js version (18, 20, or 22)

### 2. **jenkins/Jenkinsfile.e2e** (End-to-End Testing)
Dedicated pipeline for integration testing with real database instances.

**Triggers:**
- Daily at 2 AM UTC
- GitHub push events
- Manual trigger

**Setup:**
- Creates Docker network
- Starts PostgreSQL containers for each service
- Initializes services with test databases
- Runs health checks
- Performs basic E2E tests

### 3. **jenkins/Jenkinsfile.deploy** (Deployment Pipeline)
Handles Docker image building and deployment to container registry.

**Triggers:**
- Main branch pushes
- Manual trigger

**Stages:**
1. Checkout
2. Build & Push Docker Images - Build for all three services
3. Security Scan - Container security scanning
4. Registry Login
5. Push Images - Push to GHCR
6. Create Release Tags - Create version tags
7. Deploy - Production deployment
8. Health Check - Post-deployment verification

**Parameters:**
- `DEPLOYMENT_ENV` - staging or production
- `PUSH_TAGS` - Create version tags

## Setup Instructions

### 1. Jenkins Configuration

#### Prerequisites
- Jenkins 2.387+ installed
- Docker installed on Jenkins agent
- Node.js 20+ installed
- PostgreSQL client tools available

#### Required Jenkins Plugins
- Pipeline: Declarative Agent
- Docker Pipeline
- Docker Commons
- GitHub Integration
- Timestamper
- Log Parser

#### Installation
```bash
# Install plugins via Jenkins UI or Jenkins CLI
java -jar jenkins-cli.jar install-plugin \
  pipeline-stage-view \
  docker-plugin \
  docker-commons-plugin \
  github-integration \
  timestamper
```

### 2. Credentials Setup

In Jenkins, create the following credentials:

#### GitHub Webhook
- Type: GitHub App
- ID: `github-app`
- Store app credentials for push events

#### Container Registry
- Type: Username and password
- ID: `ghcr-credentials`
- Username: GitHub username
- Password: GitHub Personal Access Token (with packages:read, packages:write)

```bash
# Jenkins CLI to add credentials
java -jar jenkins-cli.jar add-credentials system::system domain _ \
  -c username=<github-username> \
  -c password=<github-pat-token> \
  -c scope=GLOBAL \
  -c id=ghcr-credentials \
  username_password
```

### 3. Pipeline Creation

#### Create Main Pipeline Job
1. New Item → Pipeline
2. Name: `market-main`
3. Pipeline script from SCM:
   - SCM: Git
   - Repository URL: `https://github.com/yassinekoaubai/Market.git`
   - Branch: `*/main`
   - Script path: `Jenkinsfile`
4. Build Triggers:
   - GitHub hook trigger for GITScm polling
   - Poll SCM: `H/15 * * * *`

#### Create E2E Testing Job
1. New Item → Pipeline
2. Name: `market-e2e-tests`
3. Pipeline script from SCM:
   - Script path: `jenkins/Jenkinsfile.e2e`
4. Build Triggers:
   - GitHub hook trigger
   - Periodic builds: `0 2 * * *`

#### Create Deployment Job
1. New Item → Pipeline
2. Name: `market-deploy`
3. Pipeline script from SCM:
   - Script path: `jenkins/Jenkinsfile.deploy`
4. Build Triggers:
   - Manual (parametrized builds)
   - GitHub push on main branch

### 4. GitHub Webhook Configuration

1. Go to: Repository Settings → Webhooks
2. Add webhook:
   - Payload URL: `https://jenkins.example.com/github-webhook/`
   - Content type: `application/json`
   - Events: Push events, Pull requests
   - Active: ✓

### 5. Update Environment Variables

Create a `.env.jenkins` file or set via Jenkins pipeline:

```bash
# Jenkins System Configuration
export NODE_VERSION=20
export REGISTRY=ghcr.io
export REPOSITORY_OWNER=yassinekoaubai
export DOCKER_BUILDKIT=1
```

## Usage

### Trigger Main Pipeline
```bash
# Via Jenkins UI or CLI
java -jar jenkins-cli.jar build market-main \
  -p SKIP_TESTS=false \
  -p DEPLOY_PRODUCTION=false
```

### Trigger E2E Tests
```bash
java -jar jenkins-cli.jar build market-e2e-tests
```

### Trigger Deployment
```bash
java -jar jenkins-cli.jar build market-deploy \
  -p DEPLOYMENT_ENV=production \
  -p PUSH_TAGS=true
```

## Docker Agent Configuration (Recommended)

For better isolation, run Jenkins agents in Docker:

```yaml
# docker-compose.yml for Jenkins agent
version: '3.8'
services:
  jenkins-agent:
    image: jenkins/agent:latest
    environment:
      JENKINS_URL: http://jenkins-master:8080
      JENKINS_SECRET: <agent-secret>
      JENKINS_AGENT_NAME: docker-agent
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - /usr/bin/docker:/usr/bin/docker
    depends_on:
      - jenkins-master
```

## Monitoring & Logging

- Jenkins UI Dashboard: `http://jenkins.example.com`
- Pipeline execution logs accessible from job run page
- Archived artifacts: Test results, build logs
- Email notifications on build failure (configure via Jenkins)

## Troubleshooting

### Common Issues

1. **Docker socket permission error**
   ```bash
   sudo usermod -aG docker jenkins
   sudo systemctl restart jenkins
   ```

2. **GHCR push unauthorized**
   - Verify credentials are correct
   - Check GitHub PAT has `write:packages` scope
   - Confirm `ghcr-credentials` is bound to pipeline

3. **Database connection timeout in E2E tests**
   - Ensure Docker daemon is running
   - Check PostgreSQL container logs: `docker logs postgres-auth`
   - Increase timeout in pipeline config

4. **Node modules cache issues**
   - Clear Jenkins workspace: `Discard old builds`
   - Run with `npm ci --force`

## Best Practices

1. **Use separate nodes for different job types**
   - Build jobs: Regular Linux nodes
   - E2E tests: Docker-enabled nodes
   - Deployment: Secured nodes with registry access

2. **Manage secrets securely**
   - Use Jenkins credentials store
   - Never commit secrets to repository
   - Rotate PATs regularly

3. **Monitor pipeline performance**
   - Track build times
   - Identify bottlenecks
   - Optimize parallel stages

4. **Keep pipelines DRY**
   - Use shared libraries for common functions
   - Reuse pipeline templates
   - Document custom functions

## References

- [Jenkins Pipeline Documentation](https://www.jenkins.io/doc/book/pipeline/)
- [Docker Pipeline Plugin](https://plugins.jenkins.io/docker-workflow/)
- [GitHub Integration Plugin](https://plugins.jenkins.io/github-integration/)
- [Declarative Pipeline Syntax](https://www.jenkins.io/doc/book/pipeline/syntax/)

## Support & Maintenance

For issues or improvements:
1. Check Jenkins logs: `/var/log/jenkins/jenkins.log`
2. Review pipeline execution in UI
3. Contact DevOps team for infrastructure issues
4. Create issues in repository for pipeline improvements
