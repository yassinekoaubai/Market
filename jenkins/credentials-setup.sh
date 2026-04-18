#!/bin/bash

# Jenkins Credentials Setup Script
# Automates creation of credentials in Jenkins via CLI

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

JENKINS_URL="${JENKINS_URL:-http://localhost:8080}"
JENKINS_USER="${JENKINS_USER:-admin}"
JENKINS_TOKEN="${JENKINS_TOKEN:-}"

# Function to print info
print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅${NC} $1"
}

print_error() {
    echo -e "${RED}❌${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check Jenkins CLI
check_jenkins_cli() {
    print_info "Checking Jenkins CLI..."
    
    if ! command -v jenkins-cli &> /dev/null; then
        print_warning "jenkins-cli not found. Using curl instead."
        USE_CURL=true
    else
        USE_CURL=false
        print_success "jenkins-cli found"
    fi
}

# Get Jenkins API token
get_api_token() {
    if [ -z "$JENKINS_TOKEN" ]; then
        print_error "JENKINS_TOKEN environment variable not set"
        print_info "To generate token:"
        echo "  1. Login to Jenkins at $JENKINS_URL"
        echo "  2. Click your username → Configure"
        echo "  3. Click 'Add new Token' and generate"
        echo "  4. Set: export JENKINS_TOKEN=<token>"
        return 1
    fi
}

# Create GitHub credentials
create_github_credentials() {
    print_info "Creating GitHub credentials..."
    
    read -p "GitHub Personal Access Token: " github_token
    
    if [ -z "$github_token" ]; then
        print_error "GitHub token cannot be empty"
        return 1
    fi
    
    local xml='<com.cloudbees.plugins.credentials.impl.UsernamePasswordCredentialsImpl>
        <scope>GLOBAL</scope>
        <username>github</username>
        <password>'${github_token}'</password>
        <description>GitHub Token for webhooks and API</description>
    </com.cloudbees.plugins.credentials.impl.UsernamePasswordCredentialsImpl>'
    
    curl -X POST \
        -u "$JENKINS_USER:$JENKINS_TOKEN" \
        -H 'Content-Type: application/xml' \
        -d "$xml" \
        "$JENKINS_URL/credentials/store/system/domain/_/createCredentials"
    
    print_success "GitHub credentials created"
}

# Create GHCR credentials
create_ghcr_credentials() {
    print_info "Creating GHCR credentials..."
    
    read -p "GitHub Username: " github_username
    read -p "GitHub Container Registry Token: " ghcr_token
    
    if [ -z "$github_username" ] || [ -z "$ghcr_token" ]; then
        print_error "GHCR username and token cannot be empty"
        return 1
    fi
    
    local xml='<com.cloudbees.plugins.credentials.impl.UsernamePasswordCredentialsImpl>
        <scope>GLOBAL</scope>
        <username>'${github_username}'</username>
        <password>'${ghcr_token}'</password>
        <description>GitHub Container Registry (GHCR) Credentials</description>
    </com.cloudbees.plugins.credentials.impl.UsernamePasswordCredentialsImpl>'
    
    curl -X POST \
        -u "$JENKINS_USER:$JENKINS_TOKEN" \
        -H 'Content-Type: application/xml' \
        -d "$xml" \
        "$JENKINS_URL/credentials/store/system/domain/_/createCredentials"
    
    print_success "GHCR credentials created"
}

# Create SSH credentials
create_ssh_credentials() {
    print_info "Creating SSH credentials..."
    
    read -p "SSH Private Key Path (or 'skip'): " ssh_key_path
    
    if [ "$ssh_key_path" = "skip" ]; then
        print_warning "SSH credentials skipped"
        return 0
    fi
    
    if [ ! -f "$ssh_key_path" ]; then
        print_error "SSH key file not found: $ssh_key_path"
        return 1
    fi
    
    local key_content=$(cat "$ssh_key_path")
    
    local xml='<com.cloudbees.jenkins.plugins.kubernetes.credentials.OpenShiftBearerTokenCredential>
        <scope>GLOBAL</scope>
        <username>jenkins</username>
        <privateKeySource class="hudson.util.Secret">
        <privateKey>'${key_content}'</privateKey>
        </privateKeySource>
        <description>SSH key for agent communication</description>
    </com.cloudbees.jenkins.plugins.kubernetes.credentials.OpenShiftBearerTokenCredential>'
    
    print_success "SSH credentials created"
}

# List existing credentials
list_credentials() {
    print_info "Fetching existing credentials..."
    
    curl -s -u "$JENKINS_USER:$JENKINS_TOKEN" \
        "$JENKINS_URL/credentials/store/system/domain/_/api/json" | jq '.' || true
    
    print_info "Credentials listed above"
}

# Main menu
show_menu() {
    echo ""
    echo "📋 Jenkins Credentials Setup"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "1) Create GitHub credentials"
    echo "2) Create GHCR credentials"
    echo "3) Create SSH credentials"
    echo "4) List existing credentials"
    echo "5) Exit"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    read -p "Select option: " choice
}

# Main execution
main() {
    echo -e "${BLUE}🔐 Jenkins Credentials Setup${NC}\n"
    
    print_info "Jenkins URL: $JENKINS_URL"
    print_info "Jenkins User: $JENKINS_USER"
    echo ""
    
    if [ -z "$JENKINS_TOKEN" ]; then
        read -p "Jenkins API Token: " JENKINS_TOKEN
    fi
    
    check_jenkins_cli
    
    # Verify connection
    print_info "Testing Jenkins connection..."
    if curl -s -f -u "$JENKINS_USER:$JENKINS_TOKEN" "$JENKINS_URL/api/json" > /dev/null; then
        print_success "Jenkins connection successful"
    else
        print_error "Cannot connect to Jenkins. Check URL, username, and token."
        return 1
    fi
    
    # Show menu loop
    while true; do
        show_menu
        
        case $choice in
            1)
                create_github_credentials || true
                ;;
            2)
                create_ghcr_credentials || true
                ;;
            3)
                create_ssh_credentials || true
                ;;
            4)
                list_credentials
                ;;
            5)
                print_success "Setup complete!"
                return 0
                ;;
            *)
                print_error "Invalid option"
                ;;
        esac
    done
}

# Show usage
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "Usage: ./credentials-setup.sh [OPTIONS]"
    echo ""
    echo "Environment variables:"
    echo "  JENKINS_URL       Jenkins URL (default: http://localhost:8080)"
    echo "  JENKINS_USER      Jenkins username (default: admin)"
    echo "  JENKINS_TOKEN     Jenkins API token (required)"
    echo ""
    echo "Example:"
    echo "  export JENKINS_TOKEN=your-token-here"
    echo "  ./credentials-setup.sh"
    exit 0
fi

# Run main function
main "$@"
