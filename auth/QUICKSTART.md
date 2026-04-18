# ⚡ Quick Start Guide

Commencez avec le service d'authentification en 5 minutes.

## 📥 Installation Rapide

```bash
# 1. Naviguez au dossier auth
cd auth

# 2. Installez les dépendances
npm install

# 3. Configurez les variables d'environnement
cp .env.example .env

# Éditez .env avec vos valeurs:
# - Modifiez DATABASE_URL pour votre base PostgreSQL
# - Changez JWT_SECRET en production
```

## 🗄️ Setup Base de Données

```bash
# 1. Créez la base de données et les tables
npm run db:migrate

# 2. (Optional) Ajoutez des données de test
npm run db:seed
```

## 🚀 Démarrage

```bash
# Mode développement (avec hot-reload)
npm run dev

# Mode production
npm run build
npm start
```

Votre API est maintenant sur `http://localhost:3000`

## ✅ Test Rapide

### 1. Vérifier que le serveur fonctionne

```bash
curl http://localhost:3000/health
```

### 2. Créer un compte

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123",
    "confirmPassword": "Password123",
    "name": "Test User",
    "phone": "+1234567890"
  }'
```

### 3. Se connecter

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123"
  }'
```

Vous obtenez `accessToken` et `refreshToken`!

## 🎯 Prochaines Étapes

1. **Lire la documentation complète**: [README.md](README.md)
2. **Voir les exemples de test**: [TESTING.md](TESTING.md)
3. **Configuration avancée**: [ADVANCED_CONFIG.md](ADVANCED_CONFIG.md)
4. **Intégrer à votre application**: Utilisez les tokens dans vos requêtes

## 🔗 Endpoints Clés

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/auth/register` | Créer un compte |
| POST | `/auth/login` | Se connecter |
| POST | `/auth/refresh-token` | Renouveler le token |
| POST | `/auth/logout` | Se déconnecter |
| POST | `/auth/logout-all` | Déconnexion tous appareils |
| GET | `/health` | Vérifier le serveur |

## 🐛 Troubleshooting

### Erreur de connexion à la base de données

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution**: Assurez-vous que PostgreSQL est en cours d'exécution et que `DATABASE_URL` est correct.

### Erreur de migration

```
Error: Migration failed
```

**Solution**: Réinitialiser la base de données:

```bash
npm run db:reset
```

### Port déjà utilisé

```
Error: listen EADDRINUSE :::3000
```

**Solution**: Changez le PORT dans `.env` ou arrêtez le processus utilisant le port 3000.

## 📚 Documentation Complète

Voir [README.md](README.md) pour la documentation complète, la liste complète des endpoints, et les exemples détaillés.

## 🆘 Besoin d'Aide?

1. Vérifiez [TESTING.md](TESTING.md) pour des exemples détaillés
2. Consultez [ADVANCED_CONFIG.md](ADVANCED_CONFIG.md) pour les configurations avancées
3. Regardez les logs du serveur pour les détails des erreurs
4. Utilisez `npm run db:studio` pour inspecter la base de données

## ✨ Fonctionnalités Clés Prêtes à Utiliser

✅ Authentification par email/mot de passe
✅ Validation forte avec Zod
✅ Hachage sécurisé avec Bcrypt
✅ JWT pour les accès sécurisés
✅ Refresh tokens pour la persistance
✅ Gestion des rôles (USER, ADMIN)
✅ Revocation des tokens
✅ Middleware d'authentification
✅ Gestion complète des erreurs
✅ CORS configuré

Bon développement! 🚀
