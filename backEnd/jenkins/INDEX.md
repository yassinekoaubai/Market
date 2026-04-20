# Jenkins CI/CD Documentation Index

Complete guide for setting up and managing Jenkins for the Market microservices platform.

## 📚 Documentation Files

### 1. **START HERE** → [QUICKSTART.md](QUICKSTART.md)
- ⏱️ **Time**: 5-10 minutes
- 🎯 **Purpose**: Get Jenkins running quickly with Docker Compose
- 📋 **Includes**:
  - Prerequisites checklist
  - One-command Jenkins startup
  - 5-step job creation
  - Basic verification steps
  - Troubleshooting top issues

**👉 Start here if**: You want Jenkins running immediately for testing

---

### 2. **Setup & Configuration** → [README.md](README.md)
- ⏱️ **Time**: 20-30 minutes
- 🎯 **Purpose**: Complete Jenkins setup for production
- 📋 **Includes**:
  - Detailed prerequisites and plugin requirements
  - Step-by-step setup instructions
  - Credentials creation procedures
  - Environment variable configuration
  - Jenkins agent setup with Docker
  - Pipeline configuration walkthrough
  - Complete troubleshooting guide
  - Best practices and optimization

**👉 Start here if**: You want a production-ready Jenkins setup with all configurations

---

### 3. **Quick Reference** → This File
- ⏱️ **Time**: 5 minutes
- 🎯 **Purpose**: Navigate all documentation
- 📋 **Includes**: File descriptions and suggested reading order

---

## 🚀 Quick Start Path

### For Local Testing (5 minutes)
```
1. QUICKSTART.md (setup)
2. Run: ./setup.sh
3. QUICKSTART.md (create jobs)
4. Test webhook (WEBHOOK_SETUP.md optional)
```

### For Production (30 minutes)
```
1. QUICKSTART.md (overview)
2. README.md (detailed setup)
3. credentials-setup.sh (create credentials)
4. WEBHOOK_SETUP.md (GitHub integration)
5. Monitor builds in Jenkins UI
```

---

## 📁 Infrastructure Files

### Deployment Files

| File | Purpose | When to Use |
|------|---------|-----------|
| [docker-compose.yml](docker-compose.yml) | Docker containers for Jenkins, agent, database | Run: `docker-compose up -d` |
| [setup.sh](setup.sh) | Automated setup script | Run: `bash setup.sh` |
| [.env.example](.env.example) | Environment variables template | Copy to `.env` and fill values |
| [jenkins.yml](jenkins.yml) | Jenkins Configuration as Code | Applied automatically by docker-compose |

### Automation Scripts

| File | Purpose | How to Use |
|------|---------|-----------|
| [credentials-setup.sh](credentials-setup.sh) | Create Jenkins credentials | `bash credentials-setup.sh` |

### Pipeline Files

| File | Purpose | Triggered By |
|------|---------|-------------|
| [../Jenkinsfile](../Jenkinsfile) | Main CI/CD pipeline (build, test, deploy) | Push to main |
| [Jenkinsfile.e2e](Jenkinsfile.e2e) | End-to-end testing pipeline | Daily 2 AM or manual |
| [Jenkinsfile.deploy](Jenkinsfile.deploy) | Docker image build and push | Manual or release |

### Configuration Guides

| File | Purpose | When |
|------|---------|------|
| [QUICKSTART.md](QUICKSTART.md) | Quick setup (5-10 min) | Initial setup |
| [README.md](README.md) | Full documentation | Reference & detailed setup |
| [WEBHOOK_SETUP.md](WEBHOOK_SETUP.md) | GitHub webhook integration | GitHub integration |

---

## 🎯 Common Tasks

### Get Jenkins Running

```bash
cd jenkins
chmod +x setup.sh
./setup.sh
# Open http://localhost:8080
```

### Create Credentials

**Option 1: Interactive Script**
```bash
export JENKINS_TOKEN=<your-token>
bash credentials-setup.sh
```

**Option 2: Manual (See QUICKSTART.md Step 3)**

### Deploy to Production

```bash
# 1. Update docker-compose.yml for production
# 2. Set environment variables in .env
# 3. Run setup with production settings
docker-compose up -d
```

### Add New Pipeline Job

See **QUICKSTART.md → Step 4** for detailed instructions

### Debug Pipeline Build

```bash
# View logs for main pipeline
docker-compose logs -f jenkins | grep "market-main"

# Or view in Jenkins UI:
# Job → Recent Builds → Console Output
```

### Monitor Pipeline Status

```bash
# Check agent status
docker-compose ps

# View Jenkins dashboard
# Open http://localhost:8080/
# Left sidebar: Build Executor Status
```

---

## 🔧 Configuration Reference

### Environment Variables

See [.env.example](.env.example) for complete list:
- GitHub configuration
- GHCR credentials
- Jenkins agent settings
- Service ports
- Database configuration

### Jenkins Settings

See [jenkins.yml](jenkins.yml) for:
- Security configuration
- Credential definitions
- Agent setup
- Tool versions
- Pre-configured jobs

### Pipeline Parameters

#### Main Jenkinsfile
- `SKIP_TESTS`: Skip unit tests (default: false)
- `DEPLOY_PRODUCTION`: Deploy to production (default: false)
- `NODE_VERSION`: Node.js version to use (default: 20.9.0)

#### E2E Jenkinsfile
- No parameters (runs all tests)

#### Deploy Jenkinsfile
- `DEPLOYMENT_ENV`: Target environment (staging/production)
- `PUSH_TAGS`: Push all tags to registry (default: true)

---

## 🔐 Security Checklist

- ✅ GitHub token created with `repo` scope only
- ✅ GHCR token created and URL-encoded if needed
- ✅ SSH keys generated and distributed to agents
- ✅ Jenkins credentials stored securely (encrypted)
- ✅ GitHub webhook signature validated
- ✅ HTTPS used for all connections
- ✅ Firewall rules restrict port access
- ✅ Jenkins admin password changed
- ✅ Default Jenkins plugins disabled
- ✅ Agent communication secured with SSH

---

## 📊 Monitoring & Logs

### Key Log Files

```bash
# Jenkins master logs
docker-compose logs jenkins

# Jenkins agent logs
docker-compose logs jenkins-agent

# PostgreSQL logs
docker-compose logs postgres

# View specific job logs
# Jenkins UI → Job Name → Build # → Console Output
```

### Health Checks

```bash
# Check Jenkins is responding
curl http://localhost:8080/login

# Check agent connectivity
curl http://localhost:8080/api/json | jq '.executors'

# Check database connection
docker-compose exec postgres psql -U market_user -d market_test -c "SELECT 1"
```

### Build Metrics

Access via Jenkins UI:
- Dashboard: Overall health
- Job: Build history and trends
- Agent: Executor availability
- System: Resource usage

---

## 🆘 Common Issues

| Issue | Solution | Reference |
|-------|----------|-----------|
| Jenkins won't start | Check logs: `docker-compose logs jenkins` | README.md → Troubleshooting |
| Build fails with auth error | Create credentials: `bash credentials-setup.sh` | QUICKSTART.md → Step 3 |
| Agent not connecting | Ensure agent secret in .env | docker-compose.yml |
| Webhook not triggering | Verify GitHub webhook payload URL | WEBHOOK_SETUP.md → Troubleshooting |
| Docker build fails | Check Docker socket permissions | README.md → Agent Setup |

See detailed troubleshooting in:
- [README.md](README.md#troubleshooting)
- [QUICKSTART.md](QUICKSTART.md#-troubleshooting)
- [WEBHOOK_SETUP.md](WEBHOOK_SETUP.md#troubleshooting)

---

## 📚 Additional Resources

### Jenkins Documentation
- [Official Jenkins Documentation](https://www.jenkins.io/doc/)
- [Declarative Pipeline Syntax](https://www.jenkins.io/doc/book/pipeline/syntax/)
- [Jenkins Configuration as Code](https://www.jenkins.io/projects/jcasc/)

### GitHub Integration
- [GitHub Webhooks API](https://docs.github.com/en/developers/webhooks-and-events/webhooks)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)

### Docker & Containers
- [Jenkins Docker Image](https://hub.docker.com/r/jenkins/jenkins)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)

---

## 🎓 Learning Path

**Beginner** (First time setup):
1. Read QUICKSTART.md
2. Run setup.sh
3. Create one test job
4. Trigger manual build

**Intermediate** (Production deployment):
1. Read README.md completely
2. Understand all 3 pipeline files
3. Configure credentials properly
4. Set up GitHub webhooks

**Advanced** (Customization):
1. Study jenkins.yml JCaC format
2. Modify Jenkinsfile stages
3. Add security scanning tools
4. Implement deployment automation

---

## ✨ Next Steps

1. **Decide your path**: Local testing or production?
2. **Read appropriate docs**: QUICKSTART.md or README.md
3. **Run setup**: `bash setup.sh`
4. **Create credentials**: Follow Step 3 in QUICKSTART.md
5. **Create jobs**: Follow Step 4 in QUICKSTART.md
6. **Test pipeline**: Trigger manual build

---

**Questions?** Check the troubleshooting section in the relevant documentation file.

**Ready?** Start with [QUICKSTART.md](QUICKSTART.md) → 5-10 minutes to running Jenkins!
