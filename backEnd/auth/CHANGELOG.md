# Changelog

Tous les changements importants de ce projet seront documentés dans ce fichier.

## [1.0.0] - 2024-01-15

### Added

- ✨ Service d'authentification complet avec Express, TypeScript, PostgreSQL et Prisma
- 🔐 Authentification par email/password avec Bcrypt
- 🎫 JWT pour les access tokens avec expiration configurable
- 🔄 Refresh tokens avec stockage en base de données
- ✅ Validation des données entrantes avec Zod
- 🛡️ Middlewares d'authentification pour les routes protégeuses
- 👥 Gestion des rôles (USER, ADMIN)
- 🧩 Architecture modulaire et bien structurée
- 📝 Documentation complète (README, TESTING, QUICKSTART)
- 🐳 Support Docker et Docker Compose
- 🔄 CI/CD pipeline avec GitHub Actions
- 📊 Prisma Studio pour la gestion de la BD
- 🌍 CORS configuré
- ⚡ Support ES modules
- 🧪 Scripts de seed pour données de test

### Features

#### API Endpoints

- `POST /auth/register` - Création de compte
- `POST /auth/login` - Connexion
- `POST /auth/refresh-token` - Renouvellement du token
- `POST /auth/logout` - Déconnexion
- `POST /auth/logout-all` - Déconnexion tous appareils
- `GET /health` - Vérifier la santé du serveur

#### Database Models

- User (id, name, email, phone, password_hash, email_verified, role, timestamps)
- RefreshTokens (id, token, expires_at, revoked, device_info, userId)
- Role Enum (USER, ADMIN)

#### Services

- `PasswordService` - Hachage et comparaison Bcrypt
- `JwtService` - Création et vérification JWT
- `AuthService` - Logique métier d'authentification

### Configuration

- Environnement basé sur variables d'environnement
- Support développement et production
- CORS configurable
- Expiration des tokens configurable
- Base de données PostgreSQL
- TS strict mode activé

### Security

- Mots de passe hachés avec Bcrypt (10 rounds)
- JWT signés avec clé secrète
- Tokens avec expiration
- Refresh tokens révocables
- Validation d'entrées avec Zod
- Gestion des erreurs sécurisée

## [Upcoming]

### Planned Features

- [ ] Email verification
- [ ] Password reset functionality
- [ ] Two-factor authentication (2FA)
- [ ] OAuth2 integration (Google, GitHub)
- [ ] Rate limiting
- [ ] Request logging
- [ ] Helmet security headers
- [ ] Unit tests
- [ ] Integration tests
- [ ] GraphQL support
- [ ] API versioning
