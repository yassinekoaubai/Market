# Quick Start Guide - Jenkins Setup

Get Jenkins running in 5 minutes with Docker Compose.

## Prerequisites

- Docker installed
- Docker Compose installed
- Git repository cloned locally
- This directory structure:
  ```
  jenkins/
  ├── docker-compose.yml
  ├── setup.sh
  ├── jenkins.yml
  ├── README.md
  └── Jenkinsfile.e2e
  ```

## 1️⃣ Run Setup Script

```bash
cd jenkins
chmod +x setup.sh
./setup.sh
```

This will:
- Start Jenkins master container
- Start Docker-enabled agent
- Start PostgreSQL database
- Wait for Jenkins to be ready
- Display admin password

## 2️⃣ Access Jenkins Web UI

Open: **http://localhost:8080**

Login with:
- **Username**: `admin`
- **Password**: See script output above

## 3️⃣ Create Credentials

### GitHub Token (Required for webhook)

1. Navigate to: **Jenkins Dashboard** → **Manage Jenkins** → **Manage Credentials** → **System** → **Global credentials**
2. Click **Add Credentials**
3. Configure:
   - **Kind**: Username with password
   - **Username**: `github`
   - **Password**: [GitHub Personal Access Token with `repo` scope]
   - **ID**: `github-token`
   - Click **Create**

### GHCR Token (Required for image push)

1. **Add Credentials** (same path)
2. Configure:
   - **Kind**: Username with password
   - **Username**: `USERNAME` (your GitHub username)
   - **Password**: [GitHub Container Registry token]
   - **ID**: `ghcr-credentials`
   - Click **Create**

### SSH Key (Required for agent communication)

1. **Add Credentials** (same path)
2. Configure:
   - **Kind**: SSH Username with private key
   - **Username**: `jenkins`
   - **Private Key**: Enter directly or upload
   - **ID**: `jenkins-ssh`
   - Click **Create**

## 4️⃣ Create Pipeline Jobs

### Job 1: market-main

1. **New Item** → **Pipeline**
   - **Name**: `market-main`
   - **Pipeline** section:
     - **Definition**: Pipeline script from SCM
     - **SCM**: Git
       - **Repository URL**: `https://github.com/YOUR_ORG/market.git`
       - **Credentials**: `github-token`
       - **Branch**: `*/main`
     - **Script Path**: `Jenkinsfile`
     - **Poll SCM**: `H H * * *` (daily)
   - Click **Save**

### Job 2: market-e2e-tests

1. **New Item** → **Pipeline**
   - **Name**: `market-e2e-tests`
   - **Pipeline** section:
     - **Definition**: Pipeline script from SCM
     - **SCM**: Git (same as above)
     - **Script Path**: `jenkins/Jenkinsfile.e2e`
     - **Poll SCM**: `0 2 * * *` (2 AM daily)
   - Click **Save**

### Job 3: market-deploy

1. **New Item** → **Pipeline**
   - **Name**: `market-deploy`
   - **Pipeline** section:
     - **Definition**: Pipeline script from SCM
     - **SCM**: Git (same as above)
     - **Script Path**: `jenkins/Jenkinsfile.deploy`
   - Click **Save**

## 5️⃣ Configure GitHub Webhook

1. Go to GitHub repository settings
2. **Webhooks** → **Add webhook**
3. Configure:
   - **Payload URL**: `http://YOUR_JENKINS_URL:8080/github-webhook/`
   - **Content type**: `application/json`
   - **Events**: Push events
   - **Active**: ✓
4. Click **Add webhook**

## ✅ Verification

### Check containers are running:
```bash
docker-compose ps
```

### View Jenkins logs:
```bash
docker-compose logs -f jenkins
```

### Trigger a manual build:
1. Go to Jenkins Dashboard
2. Click **market-main** job
3. Click **Build Now**
4. Watch the console output

### Expected success output:
```
✅ Build stage completed
✅ Dependencies installed
✅ TypeScript compilation successful
✅ Docker image built and tagged
✅ Image pushed to GHCR
```

## 🔧 Troubleshooting

### Jenkins won't start
```bash
# Check logs
docker-compose logs jenkins

# Rebuild container
docker-compose down
docker-compose up -d --build
```

### Build fails with credential errors
- Verify credentials exist in Jenkins
- Check credential IDs match pipeline code
- Ensure GitHub token has `repo` scope
- Verify GHCR token is URL-encoded if needed

### Agent not connecting
```bash
# Check agent logs
docker-compose logs jenkins-agent

# Restart agent
docker-compose restart jenkins-agent
```

### Port already in use
```bash
# Find process using port 8080
lsof -i :8080

# Modify docker-compose.yml ports (change 8080:8080 to 8081:8080)
```

## 📊 Monitoring Jenkins

### View running builds:
```bash
docker-compose logs -f jenkins | grep "Starting build"
```

### Check agent status in Jenkins UI:
- Dashboard → **Build Executor Status** (left sidebar)
- Should show: `docker-agent-1` with green circle

### View build artifacts:
- Each job → **Recent Builds** → Click build number
- **Artifacts** section shows logs and test results

## 🛑 Stop/Restart

### Stop Jenkins:
```bash
docker-compose down
```

### Start Jenkins (keeping data):
```bash
docker-compose up -d
```

### Full reset (removes data):
```bash
docker-compose down -v
```

## 📚 Additional Resources

- Full setup documentation: [README.md](README.md)
- Main pipeline: [../../Jenkinsfile](../../Jenkinsfile)
- E2E pipeline: [Jenkinsfile.e2e](Jenkinsfile.e2e)
- Deploy pipeline: [Jenkinsfile.deploy](Jenkinsfile.deploy)

---

**Next**: Once running, follow environment variable setup in [README.md](README.md#environment-variables)
