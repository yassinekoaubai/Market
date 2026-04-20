# Guide de Contribution

Merci de votre intérêt pour contribuer au service d'authentification! 🙏

## 📋 Avant de Commencer

1. Fork le repository
2. Clone votre fork localement
3. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
4. Commitez vos changements (`git commit -m 'Add some AmazingFeature'`)
5. Push vers la branche (`git push origin feature/AmazingFeature`)
6. Ouvrez une Pull Request

## 🎯 Guidelines

### Code Style

- Utilisez TypeScript avec strict mode
- Respectez les conventions de nommage camelCase
- Ajoutez des commentaires JSDoc pour les fonctions publiques
- Formatez le code avec Prettier (si configuré)

### Commits

- Utilisez des messages clairs et descriptifs
- Préfixe vos commits:
  - `feat:` pour les nouvelles fonctionnalités
  - `fix:` pour les corrections
  - `docs:` pour la documentation
  - `refactor:` pour les refactors
  - `test:` pour les tests
  - `chore:` pour les tâches de maintenance

Exemple:
```
feat: Add email verification endpoint
fix: Correct token refresh logic
docs: Update API documentation
```

### Tests

- Écrivez des tests pour les nouvelles fonctionnalités
- Assurez-vous que les tests existants passent
- Maintenez une couverture de test élevée

### Documentation

- Mettez à jour le README si nécessaire
- Documentez les nouvelles API endpoints
- Ajoutez des exemples d'utilisation

## 🐛 Signaler un Bug

1. Utilisez GitHub Issues
2. Décrivez le bug en détail
3. Fournissez des étapes pour le reproduire
4. Incluez les logs et versions pertinentes

Template:
```
**Description du bug:**
[Description claire du bug]

**Étapes pour reproduire:**
1. [Première étape]
2. [Deuxième étape]
3. [Étape qui cause le bug]

**Comportement attendu:**
[Ce qui devrait se produire]

**Comportement actuel:**
[Ce qui se produit réellement]

**Environnement:**
- OS: [ex: Ubuntu 22.04]
- Node: [ex: 20.10.0]
- npm/yarn: [ex: 10.0.0]
```

## ✨ Proposer une Nouvelle Fonctionnalité

1. Ouv ez une issue pour discuter de l'idée
2. Attendez le feedback des mainteneurs
3. Implémentez (si approuvé)
4. Ouvrez une PR avec la référence à l'issue

## 📚 Architecture et Structure

```
src/
├── config/          # Configuration de l'app
├── controllers/     # Logique des endpoints
├── middlewares/     # Middlewares Express
├── routes/          # Définition des routes
├── schemas/         # Validations Zod
├── services/        # Logique métier
├── types/           # Types TypeScript
├── utils/           # Fonctions utilitaires
└── index.ts         # Entrée principale
```

### Ajouter une Nouvelle Feature

**Exemple: Ajouter un endpoint de profil utilisateur**

1. **Créez un schéma Zod** (`src/schemas/profile.schemas.ts`):
```typescript
export const updateProfileSchema = z.object({
  name: z.string().optional(),
  bio: z.string().optional(),
});
```

2. **Ajoutez au contrôleur** (`src/controllers/profile.controller.ts`):
```typescript
export class ProfileController {
  static async getProfile(req: Request, res: Response) {
    // Logique ici
  }
}
```

3. **Créez les routes** (`src/routes/profile.routes.ts`):
```typescript
router.get('/profile', verifyToken, ProfileController.getProfile);
```

4. **Importez dans index.ts**:
```typescript
import profileRoutes from './routes/profile.routes';
app.use('/api', profileRoutes);
```

5. **Écrivez les tests** et documentez

## 🚀 Process de Release

1. Mettez à jour `package.json` avec la nouvelle version
2. Mettez à jour `CHANGELOG.md`
3. Créez un tag git: `git tag v1.2.3`
4. Push le tag: `git push origin v1.2.3`
5. GitHub Actions déclenche automatiquement le build Docker

## 💬 Questions?

- Ouvrez une discussion dans les Issues
- Contactez les mainteneurs
- Consultez la documentation existante

## 📄 Licence

En contribuant, vous acceptez que vos contributions soient sous la licence MIT.

---

Merci de faire partie de ce projet! 🎉
