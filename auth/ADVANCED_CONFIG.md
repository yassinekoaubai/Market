# Configuration Avancée

## 🔐 Recommandations de Sécurité pour la Production

### 1. Variables d'Environnement

- Utilisez un gestionnaire de secrets (AWS Secrets Manager, HashiCorp Vault, etc.)
- Changez `JWT_SECRET` à une valeur très longue et aléatoire
- Ne commitez jamais les fichiers `.env`

### 2. HTTPS

Déployez toujours votre service derrière HTTPS en production:

```nginx
server {
    listen 443 ssl;
    server_name api.example.com;

    ssl_certificate /etc/ssl/certs/cert.pem;
    ssl_certificate_key /etc/ssl/private/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_set_header X-Forwarded-Proto https;
    }
}
```

### 3. Rate Limiting

Installez et configurez express-rate-limit:

```bash
npm install express-rate-limit
```

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/auth/', limiter);
```

### 4. Helmet pour les Headers de Sécurité

```bash
npm install helmet
```

```typescript
import helmet from 'helmet';
app.use(helmet());
```

### 5. Logs et Monitoring

Utiliser Winston ou Pino pour les logs structurés:

```bash
npm install winston
```

## 🔧 Personnalisations

### Modifier la Durée d'Expiration des Tokens

Dans `.env`:

```env
JWT_EXPIRE_IN="1h"              # Access token expire en 1 heure
JWT_REFRESH_EXPIRE_IN="30d"    # Refresh token expire en 30 jours
```

### Ajouter des Champs Utilisateur

Modifiez `prisma/schema.prisma`:

```prisma
model User {
  // ... existing fields
  profile_picture String?
  bio            String?
  preferences    Json?
}
```

Puis:

```bash
npm run db:migrate -- --name add_user_fields
```

### Implémenter l'Email Verification

```typescript
// Ajoutez un token de vérification
model VerificationToken {
  id        Int       @id @default(autoincrement())
  email     String    @unique
  token     String    @unique
  expires   DateTime
  user      User      @relation(fields: [userId], references: [id])
  userId    Int
}
```

### OAuth Integration (Google, GitHub)

```bash
npm install passport passport-google-oauth20
```

## 📊 Monitoring et Métriques

### Prometheus avec prom-client

```bash
npm install prom-client
```

### Application Performance Monitoring (APM)

Utilisez New Relic, DataDog, ou Elastic APM:

```typescript
const apm = require('elastic-apm-node');
apm.start();
```

## 🧪 Testing

### Setup Jest

```bash
npm install --save-dev jest @types/jest ts-jest
```

### Configuration Jest

```json
{
  "preset": "ts-jest",
  "testEnvironment": "node",
  "testMatch": ["**/__tests__/**/*.ts"],
  "collectCoverageFrom": ["src/**/*.ts"]
}
```

## 🚀 Déploiement

### Heroku

```bash
heroku create my-auth-service
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main
```

### Railway

```bash
railway link
railway up
```

### AWS ECS

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

## 📝 Checklist de Sécurité

- [ ] JWT_SECRET est fort et aléatoire
- [ ] CORS est correctement configuré
- [ ] HTTPS est activé
- [ ] Rate limiting est en place
- [ ] Helmet headers sont configurés
- [ ] Logs sensibles ne sont pas exposés
- [ ] Validation des inputs avec Zod
- [ ] Mots de passe hachés avec Bcrypt
- [ ] Tokens avec expiration
- [ ] Refresh tokens révocables
- [ ] Gestion des erreurs appropriée
- [ ] Tests unitaires en place
