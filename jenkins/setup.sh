#!/bin/bash

# Jenkins Quick Start Setup Script
# Sets up Jenkins with pipeline jobs for Market microservices

set -e

echo "🚀 Starting Market Jenkins Setup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
check_prerequisites() {
    echo "📋 Checking prerequisites..."
    
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker is not installed${NC}"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}❌ Docker Compose is not installed${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Prerequisites check passed${NC}"
}

# Start Jenkins containers
start_jenkins() {
    echo "🐳 Starting Jenkins containers..."
    
    cd "$(dirname "$0")"
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        cat > .env << EOF
JENKINS_AGENT_SECRET=$(openssl rand -base64 32)
EOF
        echo -e "${GREEN}✅ Created .env file with agent secret${NC}"
    fi
    
    docker-compose up -d
    
    echo -e "${GREEN}✅ Jenkins containers started${NC}"
}

# Wait for Jenkins to be ready
wait_jenkins() {
    echo "⏳ Waiting for Jenkins to be ready..."
    
    local max_attempts=30
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -s http://localhost:8080/login &> /dev/null; then
            echo -e "${GREEN}✅ Jenkins is ready${NC}"
            return 0
        fi
        
        echo "⏳ Attempt $((attempt + 1))/$max_attempts..."
        sleep 2
        ((attempt++))
    done
    
    echo -e "${RED}❌ Jenkins failed to start within timeout${NC}"
    return 1
}

# Get initial admin password
get_admin_password() {
    echo ""
    echo "🔑 Initial Admin Password:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    docker-compose exec -T jenkins cat /var/jenkins_home/secrets/initialAdminPassword
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
}

# Print access information
print_info() {
    echo ""
    echo -e "${GREEN}✨ Jenkins Setup Complete!${NC}"
    echo ""
    echo "📊 Access Jenkins:"
    echo "   URL: http://localhost:8080"
    echo ""
    echo "🔐 First-time setup:"
    echo "   1. Navigate to http://localhost:8080"
    echo "   2. Use password above (or admin.txt)"
    echo "   3. Follow the setup wizard"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Install recommended plugins"
    echo "   2. Create GitHub credentials"
    echo "   3. Create GHCR credentials"
    echo "   4. Create SSH key credential for agents"
    echo "   5. Configure GitHub webhook"
    echo ""
    echo "🔧 Useful commands:"
    echo "   View logs:        docker-compose logs -f jenkins"
    echo "   Stop Jenkins:     docker-compose down"
    echo "   Restart Jenkins:  docker-compose restart jenkins"
    echo "   Enter Jenkins:    docker-compose exec jenkins bash"
    echo ""
}

# Main execution
main() {
    check_prerequisites
    start_jenkins
    wait_jenkins && get_admin_password
    print_info
}

# Run main function
main "$@"
