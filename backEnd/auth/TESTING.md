# 🧪 Guide de Test - Service d'Authentification

Tous les exemples ci-dessous utilisent curl. Adaptez-les selon votre client HTTP préféré.

## 📋 Prérequis

- Service d'authentification démarré sur `http://localhost:3000`
- PostgreSQL en cours d'exécution
- Variables d'environnement configurées

## 🚀 Démarrer le Service

```bash
npm run dev
```

## 🗄️ Initialiser la Base de Données

### Créer la base de données et les tables

```bash
npm run db:migrate
```

### Ajouter des données de test (Optional)

```bash
npm run db:seed
```

Cela créera automatiquement :
- Admin: `admin@example.com` / `AdminPass123`
- User: `user@example.com` / `UserPass123`

## 🧪 Test des Endpoints

### 1️⃣ Test de Santé

Vérifier que le serveur fonctionne:

```bash
curl -X GET http://localhost:3000/health \
  -H "Content-Type: application/json"
```

**Réponse attendue:**

```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 2️⃣ Enregistrement (Register)

#### ✅ Test Valide

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePassword123",
    "confirmPassword": "SecurePassword123",
    "name": "John Doe",
    "phone": "+1234567890"
  }'
```

**Réponse attendue (201):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "john.doe@example.com",
      "name": "John Doe",
      "role": "USER"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### ❌ Email Invalide

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": "SecurePassword123",
    "confirmPassword": "SecurePassword123",
    "name": "John Doe",
    "phone": "+1234567890"
  }'
```

**Réponse attendue (400):**

```json
{
  "success": false,
  "message": "Invalid email address"
}
```

#### ❌ Mot de Passe Faible

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "weak",
    "confirmPassword": "weak",
    "name": "John Doe",
    "phone": "+1234567890"
  }'
```

**Réponse attendue (400):**

```json
{
  "success": false,
  "message": "Password must be at least 8 characters"
}
```

#### ❌ Les Mots de Passe Ne Correspondent Pas

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePassword123",
    "confirmPassword": "DifferentPassword123",
    "name": "John Doe",
    "phone": "+1234567890"
  }'
```

**Réponse attendue (400):**

```json
{
  "success": false,
  "message": "Passwords don't match"
}
```

#### ❌ Email Déjà Utilisé

```bash
# D'abord, enregistrez un utilisateur avec un email spécifique
# Puis, essayez de vous enregistrer avec le même email

curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePassword123",
    "confirmPassword": "SecurePassword123",
    "name": "Jane Doe",
    "phone": "+1111111111"
  }'
```

**Réponse attendue (409):**

```json
{
  "success": false,
  "message": "User already exists with this email"
}
```

### 3️⃣ Connexion (Login)

#### ✅ Identifiants Valides

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePassword123"
  }'
```

**Réponse attendue (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "email": "john.doe@example.com",
      "name": "John Doe",
      "role": "USER"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### ❌ Mot de Passe Incorrect

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "WrongPassword123"
  }'
```

**Réponse attendue (401):**

```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

#### ❌ Email Non Trouvé

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nonexistent@example.com",
    "password": "Password123"
  }'
```

**Réponse attendue (401):**

```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

### 4️⃣ Renouvellement du Token (Refresh Token)

Récupérez d'abord un `refreshToken` via login ou register.

#### ✅ Token Valide

```bash
curl -X POST http://localhost:3000/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

**Réponse attendue (200):**

```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### ❌ Token Invalide

```bash
curl -X POST http://localhost:3000/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "invalid.token.here"
  }'
```

**Réponse attendue (401):**

```json
{
  "success": false,
  "message": "Invalid token"
}
```

### 5️⃣ Déconnexion (Logout)

Besoin d'un `accessToken` valide et `refreshToken`.

#### ✅ Logout Valide

```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

**Réponse attendue (200):**

```json
{
  "success": true,
  "message": "Logout successful"
}
```

#### ❌ Token Expiré

```bash
# Attendre que le token expire (par défaut 15 minutes)
# ou passez un accessToken expiré

curl -X POST http://localhost:3000/auth/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer expired.token.here" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

**Réponse attendue (401):**

```json
{
  "success": false,
  "message": "Token has expired"
}
```

### 6️⃣ Logout de Tous les Appareils

Besoin d'un `accessToken` valide uniquement.

#### ✅ Logout All Valide

```bash
curl -X POST http://localhost:3000/auth/logout-all \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Réponse attendue (200):**

```json
{
  "success": true,
  "message": "Logout successful"
}
```

#### ❌ Pas de Token

```bash
curl -X POST http://localhost:3000/auth/logout-all \
  -H "Content-Type: application/json"
```

**Réponse attendue (401):**

```json
{
  "success": false,
  "message": "Unauthorized access"
}
```

## 🔄 Workflow Complet

### Scénario: Enregistrement → Login → Refresh Token → Logout

```bash
# 1. Enregistrement
echo "1️⃣ Enregistrement..."
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test.user@example.com",
    "password": "NewPassword123",
    "confirmPassword": "NewPassword123",
    "name": "Test User",
    "phone": "+9876543210"
  }')

ACCESS_TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
REFRESH_TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"refreshToken":"[^"]*' | cut -d'"' -f4)

echo "Access Token: $ACCESS_TOKEN"
echo "Refresh Token: $REFRESH_TOKEN"

# 2. Attendre que le token expire ou utilisez le refresh token immédiatement
echo "2️⃣ Refresh Token..."
REFRESH_RESPONSE=$(curl -s -X POST http://localhost:3000/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d "{
    \"refreshToken\": \"$REFRESH_TOKEN\"
  }")

NEW_ACCESS_TOKEN=$(echo $REFRESH_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
NEW_REFRESH_TOKEN=$(echo $REFRESH_RESPONSE | grep -o '"refreshToken":"[^"]*' | cut -d'"' -f4)

echo "New Access Token: $NEW_ACCESS_TOKEN"
echo "New Refresh Token: $NEW_REFRESH_TOKEN"

# 3. Logout
echo "3️⃣ Logout..."
curl -s -X POST http://localhost:3000/auth/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $NEW_ACCESS_TOKEN" \
  -d "{
    \"refreshToken\": \"$NEW_REFRESH_TOKEN\"
  }" | jq .
```

## 📊 Variables d'Environnement pour les Tests

Créez un fichier `.env.test`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/auth_test_db"
JWT_SECRET="test_secret_key"
JWT_EXPIRE_IN="15m"
JWT_REFRESH_EXPIRE_IN="7d"
PORT=3000
NODE_ENV="development"
CORS_ORIGIN="http://localhost:3000"
```

## 🐛 Debugging

### Voir les logs du serveur

```bash
npm run dev
```

### Inspecter les tokens éconduits

```bash
# Décodez un JWT sur https://jwt.io
# ou utilisez:
node -e "console.log(require('jsonwebtoken').decode('your_token_here'))"
```

### Vérifier la base de données

```bash
npm run db:studio
```

Cela ouvre Prisma Studio sur `http://localhost:5555`

## 📝 Notes

- Les tokens d'accès expirent par défaut après **15 minutes**
- Les tokens de rafraîchissement expirent par défaut après **7 jours**
- Les mots de passe doivent contenir:
  - Au moins 8 caractères
  - Au moins 1 majuscule
  - Au moins 1 minuscule
  - Au moins 1 chiffre
- Les numéros de téléphone doivent être au format international valide (ex: +1234567890)
