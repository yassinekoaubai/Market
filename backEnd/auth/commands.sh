#!/bin/bash
# Commandes Utiles - Service d'Authentification

# ============================================
# 🔧 Setup Initial
# ============================================

# Installer les dépendances
install() {
    npm install
}

# Configurer .env
setup_env() {
    cp .env.example .env
    echo "📝 Éditez .env avec vos paramètres"
}

# ============================================
# 🗄️ Base de Données
# ============================================

# Initialiser la BD
init_db() {
    npm run db:migrate
}

# Réinitialiser la BD
reset_db() {
    npm run db:reset
}

# Ajouter des données de test
seed_db() {
    npm run db:seed
}

# Ouvrir Prisma Studio
open_studio() {
    npm run db:studio
}

# ============================================
# 🚀 Développement
# ============================================

# Démarrer en développement
dev() {
    npm run dev
}

# Compiler TypeScript
build() {
    npm run build
}

# Lancer la version compilée
prod() {
    npm run build && npm start
}

# ============================================
# 🧪 Test API
# ============================================

# Health check
health_check() {
    curl http://localhost:3000/health | jq .
}

# Enregistrement
register() {
    EMAIL=${1:-"test@example.com"}
    NAME=${2:-"Test User"}
    PHONE=${3:-"+1234567890"}
    
    curl -X POST http://localhost:3000/auth/register \
      -H "Content-Type: application/json" \
      -d "{
        \"email\": \"$EMAIL\",
        \"password\": \"Password123\",
        \"confirmPassword\": \"Password123\",
        \"name\": \"$NAME\",
        \"phone\": \"$PHONE\"
      }" | jq .
}

# Connexion
login() {
    EMAIL=${1:-"test@example.com"}
    PASSWORD=${2:-"Password123"}
    
    curl -X POST http://localhost:3000/auth/login \
      -H "Content-Type: application/json" \
      -d "{
        \"email\": \"$EMAIL\",
        \"password\": \"$PASSWORD\"
      }" | jq .
}

# Refresh token
refresh() {
    REFRESH_TOKEN=$1
    
    curl -X POST http://localhost:3000/auth/refresh-token \
      -H "Content-Type: application/json" \
      -d "{
        \"refreshToken\": \"$REFRESH_TOKEN\"
      }" | jq .
}

# Logout
logout() {
    ACCESS_TOKEN=$1
    REFRESH_TOKEN=$2
    
    curl -X POST http://localhost:3000/auth/logout \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $ACCESS_TOKEN" \
      -d "{
        \"refreshToken\": \"$REFRESH_TOKEN\"
      }" | jq .
}

# Logout all devices
logout_all() {
    ACCESS_TOKEN=$1
    
    curl -X POST http://localhost:3000/auth/logout-all \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $ACCESS_TOKEN" | jq .
}

# ============================================
# 📊 Information
# ============================================

# Afficher l'aide
help() {
    echo "🔧 Commandes Disponibles:"
    echo ""
    echo "Setup:"
    echo "  install              - Installer les dépendances"
    echo "  setup_env            - Configurer .env"
    echo ""
    echo "Base de Données:"
    echo "  init_db              - Initialiser la BD"
    echo "  reset_db             - Réinitialiser la BD"
    echo "  seed_db              - Ajouter données de test"
    echo "  open_studio          - Ouvrir Prisma Studio"
    echo ""
    echo "Développement:"
    echo "  dev                  - Démarrer en mode dev"
    echo "  build                - Compiler TypeScript"
    echo "  prod                 - Démarrer en production"
    echo ""
    echo "Tests API (nécessite le serveur en cours d'exécution):"
    echo "  health_check         - Vérifier la santé du serveur"
    echo "  register [email] [name] [phone]"
    echo "  login [email] [password]"
    echo "  refresh [token]      - Renouveler le token"
    echo "  logout [access_token] [refresh_token]"
    echo "  logout_all [access_token]"
    echo ""
    echo "Exemple:"
    echo "  source commands.sh"
    echo "  dev"
    echo "  register user@example.com 'John Doe' '+1234567890'"
}

# Afficher l'aide par défaut
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    help
fi
