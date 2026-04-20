# GitHub Webhook Configuration Guide

Automate Jenkins builds by configuring GitHub webhooks to trigger on repository events.

## Prerequisites

- Jenkins running and accessible from GitHub
- GitHub repository access (Admin or Settings permission required)
- Jenkins credentials created (see QUICKSTART.md)

## Step 1: Get Your Jenkins Webhook URL

### Local Development (Ngrok)

If Jenkins is running locally, expose it via Ngrok:

```bash
# Install ngrok (if needed)
brew install ngrok  # macOS
# or download from https://ngrok.com/download

# Start ngrok tunnel
ngrok http 8080

# Your Jenkins URL is now: https://xxx.ngrok.io
```

### Production Jenkins

If Jenkins is running on a public server, use:
```
https://your-jenkins-domain.com:8080
```

Your webhook URL will be:
```
https://your-jenkins-url/github-webhook/
```

## Step 2: Configure GitHub Webhook

### Method 1: GitHub UI (Easy)

1. Go to repository settings:
   ```
   GitHub → Repository → Settings → Webhooks
   ```

2. Click **Add webhook**

3. Configure:
   - **Payload URL**: `https://your-jenkins-url/github-webhook/`
   - **Content type**: `application/json`
   - **Events**: Select which events trigger builds:
     - ☑ Push events (recommended)
     - ☑ Pull requests
     - ☑ Releases
   - **Active**: ☑ Checked

4. Click **Add webhook**

### Method 2: GitHub CLI

```bash
# Set variables
JENKINS_URL="https://your-jenkins-url"
WEBHOOK_URL="${JENKINS_URL}/github-webhook/"

# Create webhook
gh repo webhook create \
  --events push,pull_request \
  --payload-url "$WEBHOOK_URL" \
  --active
```

### Method 3: API (Scripted)

```bash
#!/bin/bash

GITHUB_TOKEN="ghp_xxxxxxxxxxxx"
REPO_OWNER="your-org"
REPO_NAME="market"
JENKINS_URL="https://your-jenkins-url"

curl -X POST \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/hooks \
  -d '{
    "name": "web",
    "active": true,
    "events": ["push", "pull_request"],
    "config": {
      "url": "'$JENKINS_URL'/github-webhook/",
      "content_type": "json",
      "insecure_ssl": "0"
    }
  }'
```

## Step 3: Verify Webhook Configuration

### Check in GitHub UI

1. Settings → Webhooks
2. Click the webhook you just created
3. Scroll to **Recent Deliveries**
4. Should see green checkmarks ✓ for successful deliveries

### View Delivery Details

Click any delivery to see:
- HTTP request sent
- Response status (should be 200)
- Response headers
- Response body

### Expected Response

```json
{
  "message": "GitHub received your webhook payload"
}
```

## Step 4: Test the Webhook

### Trigger manual test from GitHub

1. Go to webhook settings
2. Click **Recent Deliveries** tab
3. Click **Redeliver** on any delivery
4. Check Jenkins build queue in real-time

### Push a test commit

```bash
# Make a small change
echo "# Test" >> README.md

# Commit and push
git add README.md
git commit -m "test webhook trigger"
git push origin main

# Check Jenkins - build should start automatically
```

## Webhook Events Reference

### Push Events

- Triggers on: `git push`
- Jenkins parameter: `push`
- Use for: Main CI/CD pipeline
- Job: `market-main`

### Pull Request Events

- Triggers on: PR created, updated, synchronized
- Jenkins parameter: `pull_request`
- Use for: Pre-merge validation
- Job: `market-main` (with branch=PR)

### Release Events

- Triggers on: Release published
- Jenkins parameter: `release`
- Use for: Production deployment
- Job: `market-deploy`

## Troubleshooting

### Webhook not triggering builds

1. **Check webhook delivery status**:
   - Settings → Webhooks → Recent Deliveries
   - If red ✗: Jenkins not responding

2. **Verify Jenkins URL is accessible**:
   ```bash
   curl -I https://your-jenkins-url/github-webhook/
   ```

3. **Check Jenkins logs**:
   ```bash
   docker-compose logs jenkins | grep "github"
   ```

4. **Verify credentials**:
   - Jenkins must have GitHub token credential
   - Credential ID must match pipeline code

5. **Check firewall/networking**:
   - GitHub must reach your Jenkins URL
   - Port 8080 or 443 must be open
   - If using ngrok: tunnel must be active

### Webhook test delivery shows 403 Forbidden

**Cause**: Jenkins CSRF protection

**Solution**:
1. Go to Jenkins: Manage Jenkins → Security
2. Find "Prevent Cross Site Request Forgery exploits"
3. Uncheck or whitelist GitHub IP
4. Resend webhook

### Webhook test shows 404 Not Found

**Cause**: Jenkins plugin not installed

**Solution**:
1. Install GitHub plugin:
   - Manage Jenkins → Manage Plugins → Available
   - Search "GitHub Plugin"
   - Install and restart

2. Or enable webhook endpoint:
   - Manage Jenkins → Security
   - Find "Enable GitHub webhook"
   - Restart Jenkins

## Security Considerations

### 1. Validate GitHub Signature

Jenkins automatically validates GitHub webhook signatures. To verify manually:

```bash
# Get webhook secret from GitHub settings
SECRET="your-webhook-secret"

# Check X-Hub-Signature-256 header
curl -I \
  -H "X-Hub-Signature-256: sha256=..." \
  https://your-jenkins-url/github-webhook/
```

### 2. Use HTTPS

Always use HTTPS for webhook URLs:
- ✅ `https://jenkins.example.com/github-webhook/`
- ❌ `http://jenkins.example.com/github-webhook/`

### 3. Restrict IP Access

Add GitHub IP whitelist in Jenkins:

```groovy
// In Jenkins Security configuration
// Only allow GitHub webhook IPs
// Download latest: curl https://api.github.com/meta | jq .hooks_ips
```

### 4. Use Webhook Secret

1. In GitHub: Settings → Webhooks → Edit
2. Scroll to "Secret"
3. Enter a strong secret
4. Jenkins validates automatically

## Webhook Payload Example

When webhook is triggered, GitHub sends:

```json
{
  "ref": "refs/heads/main",
  "before": "9049e3...",
  "after": "0d1a26b...",
  "repository": {
    "id": 123456,
    "name": "market",
    "full_name": "your-org/market",
    "private": false,
    "owner": {
      "name": "your-org",
      "email": "org@example.com"
    }
  },
  "pusher": {
    "name": "developer",
    "email": "dev@example.com"
  },
  "commits": [
    {
      "id": "0d1a26b42...",
      "tree_id": "f9d2a07...",
      "message": "Update README",
      "timestamp": "2024-01-15T12:30:00Z",
      "author": {
        "name": "Developer",
        "email": "dev@example.com"
      }
    }
  ],
  "head_commit": { ... }
}
```

## Advanced Configuration

### Multiple Webhooks

Create separate webhooks for different events:

```bash
# Main CI pipeline (all push events)
Payload URL: https://jenkins.example.com/github-webhook/
Events: Push events

# PR validation (PR events)
Payload URL: https://jenkins.example.com/github-webhook/
Events: Pull request events

# Production deploy (release events)
Payload URL: https://jenkins.example.com/github-webhook/
Events: Release events
```

### Conditional Triggers

Jenkins Pipelines support branch/tag filtering:

```groovy
// In Jenkinsfile
triggers {
    githubPush()
}

// Or with conditions
when {
    branch 'main'
    // or tag 'v*'
}
```

### Webhook Retries

GitHub automatically retries failed webhooks:
- First retry: After 1 second
- Second retry: After 10 seconds
- Third retry: After 100 seconds
- Max 5 retries total

## Monitoring

### View webhook activity

```bash
# Check Jenkins GitHub plugin logs
docker-compose exec jenkins tail -f /var/jenkins_home/logs/github-webhook.log
```

### Set up alerts

```bash
# Get webhook delivery status via API
curl -H "Authorization: Bearer $GITHUB_TOKEN" \
  https://api.github.com/repos/$OWNER/$REPO/hooks \
  | jq '.[] | select(.name=="web") | .deliveries'
```

## References

- [Jenkins GitHub Plugin](https://plugins.jenkins.io/github/)
- [GitHub Webhooks Documentation](https://docs.github.com/en/developers/webhooks-and-events/webhooks)
- [GitHub Webhook IP Whitelist](https://api.github.com/meta)

---

**Next**: After webhook is configured, test with a push to main branch and verify Jenkins build starts automatically.
