# Contributing Guide

> Thank you for your interest in contributing to Market! This guide will help you get started.

## Code of Conduct

Be respectful, inclusive, and professional in all interactions.

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL 14+
- Git
- Docker & Docker Compose (optional, for containerized development)

### Setup Development Environment

```bash
# Clone the repository
git clone <repository-url>
cd Market

# Install dependencies for all services
npm install                # Root level
cd auth && npm install     # Auth service
cd ../catalog && npm install    # Catalog service
cd ../orders && npm install     # Orders service
```

### Create Working Branch

```bash
# Update main branch
git checkout main
git pull origin main

# Create feature branch (use descriptive names)
git checkout -b feature/add-product-filters
git checkout -b fix/cart-checkout-bug
git checkout -b docs/update-api-docs
```

## Development Workflow

### Starting All Services

```bash
# Terminal 1: Auth Service
cd auth && npm run dev

# Terminal 2: Catalog Service
cd catalog && npm run dev

# Terminal 3: Orders Service
cd orders && npm run dev

# All services available at:
# - Auth: http://localhost:3000
# - Catalog: http://localhost:3001
# - Orders: http://localhost:3002
```

### Or Use Docker Compose

```bash
docker-compose up --build
```

### Environment Files

Create `.env` in each service directory (copy from `.env.example`):

```bash
cd auth && cp .env.example .env
cd ../catalog && cp .env.example .env
cd ../orders && cp .env.example .env
```

## Making Changes

### Code Style

- **TypeScript** - Use strict mode, no `any` types
- **Naming** - Use camelCase for variables/functions, PascalCase for classes/types
- **Comments** - Add meaningful comments for complex logic
- **Error Handling** - Always handle errors, don't let them propagate silently

### File Organization

```
src/
├── config/       # Constants, environment setup
├── schemas/      # Zod validation schemas
├── types/        # TypeScript interfaces
├── services/     # Business logic
├── controllers/  # HTTP request handlers
├── routes/       # Route definitions
├── middlewares/  # Express middleware
└── index.ts      # Server entry point
```

### Creating New Features

1. **Create validation schema** (src/schemas/)
   ```typescript
   // Request body validation
   export const createProductSchema = z.object({
     name: z.string().min(1),
     price: z.number().positive(),
   });
   ```

2. **Add TypeScript types** (src/types/)
   ```typescript
   export interface Product {
     id: number;
     name: string;
     price: number;
   }
   ```

3. **Implement service layer** (src/services/)
   ```typescript
   export class ProductService {
     static async create(data: CreateProduct) {
       // Business logic here
     }
   }
   ```

4. **Create controller** (src/controllers/)
   ```typescript
   export class ProductController {
     static async create(req: Request, res: Response) {
       // Request handling
     }
   }
   ```

5. **Add routes** (src/routes/)
   ```typescript
   router.post("/products", ProductController.create);
   ```

6. **Update database schema** if needed (prisma/schema.prisma)
   ```
   model Product {
     id Int @id @default(autoincrement())
     name String
   }
   ```

### Database Changes

```bash
# Make schema changes in prisma/schema.prisma
# Then run:
cd <service>
npm run migrate:dev  # Creates migration

# Name your migration descriptively
# Example: "add product filters"

# Apply migration
npm run migrate:dev
```

## Testing

### Writing Tests

Create test files alongside implementation:
```
src/
├── services/
│   ├── product.service.ts
│   └── product.service.test.ts
```

### Running Tests

```bash
# Run all tests in a service
cd <service> && npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Test Structure

```typescript
describe("ProductService", () => {
  describe("create", () => {
    it("should create a product with valid data", async () => {
      const result = await ProductService.create({
        name: "Test Product",
        price: 99.99,
      });
      expect(result.id).toBeDefined();
      expect(result.name).toBe("Test Product");
    });

    it("should throw error with invalid data", async () => {
      expect(() => ProductService.create({
        name: "",
        price: -10,
      })).toThrow();
    });
  });
});
```

## Committing Changes

### Commit Message Format

```
<type>: <subject>

<body>

<footer>
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation only
- `style:` - Code style changes (formatting, semicolons, etc.)
- `refactor:` - Code refactoring
- `test:` - Test additions/updates
- `chore:` - Build, dependencies, tooling

**Examples:**
```
feat: add product search filters

- Implement full-text search
- Add price range filter
- Add category filtering

Fixes #123
```

```
fix: fix cart checkout bug where quantity wasn't updated

The issue was in updateCartItem where the quantity wasn't
being persisted to the database.

Refs #456
```

### Commit Best Practices

- ✅ Commit related changes together
- ✅ Write descriptive messages
- ✅ Reference issues/PRs when relevant
- ✅ Keep commits small and logical
- ✅ Don't commit debug code or temporary changes

## Creating Pull Requests

### Before Creating PR

- [ ] Code follows project style guide
- [ ] All tests pass locally
- [ ] No TypeScript errors
- [ ] Database migrations run without issues
- [ ] Related documentation updated
- [ ] Branch is up-to-date with main

### PR Title Format

```
[Service] Brief description of changes

Examples:
[Catalog] Add product search filters
[Orders] Fix cart checkout bug
[Auth] Update JWT expiration handling
[Docs] Update API documentation
```

### PR Description Template

```markdown
## Description
Brief explanation of what changed and why.

## Changes Made
- Point 1
- Point 2

## Testing
- How to test these changes
- Expected behavior

## Related Issues
Fixes #123
Closes #456

## Screenshots/Logs (if applicable)
```

## Code Review Process

### What Reviewers Look For

- ✅ Correctness of logic
- ✅ Error handling
- ✅ Performance implications
- ✅ Security concerns
- ✅ Test coverage
- ✅ Documentation accuracy

### Addressing Review Comments

- Answer questions clearly
- Make requested changes promptly
- Re-request review when ready
- Mark conversations as resolved only when fully addressed

## Deployment Process

### For Main Branch

```
Push to main
    ↓
All workflows pass (build, test, quality)
    ↓
Deploy workflow runs automatically
    ↓
Docker images pushed to registry
    ↓
Ready for production deployment
```

### For Production Release

1. Create release branch from main
2. Update version numbers
3. Update CHANGELOG
4. Create pull request with release notes
5. After merge, create git tag: `git tag v1.2.3`
6. Push tag: `git push origin v1.2.3`

## Reporting Issues

### Bug Report

```markdown
**Description**
Clear description of the bug.

**Steps to Reproduce**
1. First step
2. Second step
3. ...

**Expected Behavior**
What should happen.

**Actual Behavior**
What actually happened.

**Environment**
- Node version: 20.x
- OS: macOS/Linux/Windows
- Service: Auth/Catalog/Orders

**Logs/Screenshots**
Relevant error messages or screenshots.
```

### Feature Request

```markdown
**Description**
Clear description of the feature.

**Motivation**
Why this feature is needed.

**Proposed Solution**
How it could be implemented.

**Alternatives**
Other possible approaches.
```

## Documentation

### README Updates
Update service READMEs when:
- Adding new endpoints
- Changing configuration
- Adding environment variables
- Modifying data models

### Add Comments For
- Complex algorithms
- Non-obvious business logic
- Workarounds or hacks
- Important assumptions

### Avoid Comments For
- Self-explanatory code
- Language features
- Variable types (use TypeScript instead)

## Performance Considerations

- Optimize database queries (use indices, pagination)
- Cache frequently accessed data
- Use lazy loading for relationships
- Monitor N+1 queries
- Profile slow endpoints

## Security Guidelines

- ✅ Validate ALL inputs (use Zod)
- ✅ Never log sensitive data
- ✅ Use environment variables for secrets
- ✅ Implement rate limiting for public endpoints
- ✅ Regular dependency audits
- ✅ SQL injection prevention (Prisma handles this)
- ✅ CORS configuration per environment

## Resources

- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/)
- [Express.js Guide](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Zod Validation](https://zod.dev/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)

## Getting Help

- 📖 Check existing documentation
- 🔍 Search closed issues for similar problems
- 💬 Ask in pull request comments
- 📧 Contact maintainers via email

## Thank You!

Your contributions help make Market better! 🎉

---

**Happy coding! 🚀**
