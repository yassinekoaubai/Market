# Service d'Authentification

Un service d'authentification sécurisé et complet construit avec Express, TypeScript, Prisma, PostgreSQL, Zod, Bcrypt et JWT.

## 📋 Fonctionnalités

- ✅ Authentification par email/password
- ✅ Inscription avec validation Zod
- ✅ Hachage sécurisé des mots de passe avec Bcrypt
- ✅ JWT pour les tokens d'accès
- ✅ Refresh tokens avec stockage en base de données
- ✅ Revocation des tokens
- ✅ Logout depuis tous les appareils
- ✅ Middlewares d'authentification protégeant les routes
- ✅ Gestion des rôles (USER, ADMIN)
- ✅ Validation complète des données entrantes

## 🛠️ Technologie Utilisée

- **Server**: Express.js 5.x
- **Language**: TypeScript 6.x
- **Database**: PostgreSQL with Prisma ORM 7.x
- **Validation**: Zod 3.x
- **Password Hashing**: Bcrypt 5.x
- **JWT**: jsonwebtoken 9.x
- **Development**: ts-node-dev 2.x

## 📦 Installation

### 1. Cloner et installer les dépendances

```bash
cd auth
npm install
```

### 2. Configuration des variables d'environnement

Créez un fichier `.env` basé sur `.env.example`:

```bash
cp .env.example .env
```

Mettez à jour les variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/auth_db"

# JWT Configuration
JWT_SECRET="your_very_secret_key_change_in_production_absolutely"
JWT_EXPIRE_IN="15m"
JWT_REFRESH_EXPIRE_IN="7d"

# Server Configuration
PORT=3000
NODE_ENV="development"

# CORS
CORS_ORIGIN="http://localhost:3000,http://localhost:3001"
```

### 3. Initialiser la base de données

```bash
npm run db:push
```

Pour créer une migration nommée:

```bash
npm run db:migrate
```

### 4. Démarrer le serveur

**Mode développement:**

```bash
npm run dev
```

**Mode production:**

```bash
npm run build
npm start
```

## 📚 API Endpoints

### Authentification

#### 1. Register - Création d'un compte

```
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123",
  "name": "John Doe",
  "phone": "+1234567890"
}
```

**Réponse (201):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### 2. Login - Connexion

```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Réponse (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### 3. Refresh Token - Renouvellement du token d'accès

```
POST /auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Réponse (200):**

```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### 4. Logout - Déconnexion

```
POST /auth/logout
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Réponse (200):**

```json
{
  "success": true,
  "message": "Logout successful"
}
```

#### 5. Logout All Devices - Déconnexion depuis tous les appareils

```
POST /auth/logout-all
Authorization: Bearer <accessToken>
```

**Réponse (200):**

```json
{
  "success": true,
  "message": "Logout successful"
}
```

#### 6. Health Check

```
GET /health
```

**Réponse (200):**

```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 🔐 Utilisation des Tokens

### Access Token

Utilisez l'access token pour accéder aux ressources protégeuses:

```
Authorization: Bearer <accessToken>
```

### Refresh Token

Utilisez le refresh token pour obtenir un nouveau access token quand celui-ci expire:

```bash
curl -X POST http://localhost:3000/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "..."}'
```

## 🛡️ Sécurité

- Les mots de passe sont hachés avec Bcrypt (10 rounds)
- Les JWT sont signés avec une clé secrète forte
- Les tokens de rafraîchissement sont stockés en base et peuvent être révoqués
- Les tokens expirent automatiquement après la durée configurée
- CORS est configuré pour autoriser seulement les origins de confiance

## 📝 Validation Zod

### Register

- **email**: Format email valide
- **password**: Au minimum 8 caractères, doit contenir:
  - Au moins une majuscule
  - Au moins une minuscule
  - Au moins un chiffre
- **confirmPassword**: Doit correspondre à password
- **name**: 2-100 caractères
- **phone**: Format international valide

### Login

- **email**: Format email valide
- **password**: Non vide

## 🗄️ Schéma de Base de Données

```prisma
model User {
  id             Int             @id @default(autoincrement())
  name           String
  email          String          @unique
  phone          String          @unique
  password_hash  String
  email_verified Boolean         @default(false)
  role           Role            @default(USER)
  created_at     DateTime        @default(now())
  updated_at     DateTime        @updatedAt
  RefreshTokens  RefreshTokens[]
}

model RefreshTokens {
  id          Int      @id @default(autoincrement())
  token       String
  expires_at  DateTime
  revoked     Boolean
  created_at  DateTime @default(now())
  device_info String?
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId      Int
}

enum Role {
  USER
  ADMIN
}
```

## 🧪 Tester les Endpoints

### Avec curl

```bash
# Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123",
    "confirmPassword": "Password123",
    "name": "Test User",
    "phone": "+1234567890"
  }'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123"
  }'

# Refresh Token
curl -X POST http://localhost:3000/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }'
```

### Avec Postman

1. Importez la collection Postman (à venir)
2. Configurez les variables d'environnement
3. Testez les endpoints

## 📖 Structure du Projet

```
auth/
├── src/
│   ├── config/
│   │   ├── constants.ts        # Constantes et messages
│   │   └── env.ts              # Configuration environnement
│   ├── controllers/
│   │   └── auth.controller.ts  # Contrôleurs d'authentification
│   ├── middlewares/
│   │   └── auth.middleware.ts  # Middlewares d'authentification
│   ├── routes/
│   │   └── auth.routes.ts      # Routes d'authentification
│   ├── schemas/
│   │   └── auth.schemas.ts     # Validations Zod
│   ├── services/
│   │   ├── auth.service.ts     # Logique métier d'authentification
│   │   ├── jwt.service.ts      # Service JWT
│   │   └── password.service.ts # Service de hachage
│   ├── types/
│   │   └── auth.types.ts       # Types TypeScript
│   ├── utils/
│   │   └── prisma.ts           # Client Prisma
│   └── index.ts                # Point d'entrée
├── prisma/
│   └── schema.prisma           # Schéma Prisma
├── .env.example                # Exemple de configuration
├── .gitignore                  # Fichiers à ignorer
├── package.json                # Dépendances et scripts
└── tsconfig.json               # Configuration TypeScript
```

## 🚀 Déploiement

### Sur Vercel/Railway

1. Connectez votre repository
2. Configurez les variables d'environnement
3. Déployez automatiquement

```bash
# Example for Railway
railway link
railway up
```

### Avec Docker

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production && npm prune --production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

## 🤝 Contribution

Les contributions sont bienvenues! N'hésitez pas à créer un PR.

## 📄 Licence

MIT

## 📞 Support

Pour toute question ou problème, ouvrez un issue sur le repository.
