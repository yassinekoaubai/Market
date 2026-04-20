# Market - Microservices Architecture

> Complete e-commerce microservices ecosystem with authentication, catalog management, and order processing.

## 📋 Overview

Market is a scalable microservices-based e-commerce platform built with Node.js, TypeScript, and PostgreSQL. It provides three core services:

1. **Auth Service** - User authentication and authorization
2. **Catalog Service** - Product and category management
3. **Orders Service** - Shopping cart and order management

## 🏗️ Architecture

```
Market/
├── auth/                  # Authentication microservice (Port 3000)
├── catalog/               # Product management microservice (Port 3001)
├── orders/                # Order management microservice (Port 3002)
├── docker-compose.yml     # Multi-service orchestration
└── package.json          # Monorepo configuration
```

### Service Communication

```
┌─────────────────────────────────────────────────┐
│            Client Application                    │
└────────┬─────────────────────┬──────────────────┘
         │                     │
    ┌────▼────────────┐  ┌─────▼──────────────┐
    │  Auth Service   │  │ Orders Service     │
    │   (Port 3000)   │  │   (Port 3002)      │
    └─────────────────┘  └────────┬───────────┘
                                  │
                         ┌────────▼──────────┐
                         │ Catalog Service    │
                         │   (Port 3001)      │
                         └────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20+ ([Download](https://nodejs.org/))
- **PostgreSQL** 14+ ([Download](https://www.postgresql.org/))
- **npm** or **yarn**

### Installation

```bash
# Clone repository
git clone <repo-url>
cd Market

# Install root dependencies (monorepo management)
npm install

# Install service dependencies
cd auth && npm install && cd ..
cd catalog && npm install && cd ..
cd orders && npm install && cd ..
```

### Environment Setup

Create `.env` files in each service directory:

#### Auth Service (auth/.env)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/auth_db"
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000,http://localhost:3001,http://localhost:3002
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRE=7d
REFRESH_TOKEN_SECRET=your-refresh-secret-key
REFRESH_TOKEN_EXPIRE=30d
```

#### Catalog Service (catalog/.env)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/catalog_db"
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000,http://localhost:3001,http://localhost:3002
AUTH_SERVICE_URL=http://localhost:3000
```

#### Orders Service (orders/.env)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/orders_db"
PORT=3002
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000,http://localhost:3001,http://localhost:3002
AUTH_SERVICE_URL=http://localhost:3000
CATALOG_SERVICE_URL=http://localhost:3001
```

### Database Setup

```bash
# Auth Service
cd auth
npm run migrate:dev
npm run seed
cd ..

# Catalog Service
cd catalog
npm run migrate:dev
npm run seed
cd ..

# Orders Service
cd orders
npm run migrate:dev
npm run seed
cd ..
```

### Start All Services

#### Option 1: Docker Compose (Recommended)
```bash
docker-compose up --build
```

#### Option 2: Individual Services
```bash
# Terminal 1 - Auth Service
cd auth && npm run dev

# Terminal 2 - Catalog Service
cd catalog && npm run dev

# Terminal 3 - Orders Service
cd orders && npm run dev
```

All services will be running on their respective ports:
- Auth: `http://localhost:3000`
- Catalog: `http://localhost:3001`
- Orders: `http://localhost:3002`

## 📚 Service Documentation

### 🔐 Auth Service
Complete user authentication and authorization system.

[Read Full Documentation](./auth/README.md)

**Key Features:**
- User registration with email validation
- Secure password hashing with Bcrypt
- JWT token generation and refresh
- Role-based access control (RBAC)
- Protected endpoints

### 📦 Catalog Service
Product and category management with search and filtering.

[Read Full Documentation](./catalog/README.md)

**Key Features:**
- Product CRUD operations
- Category management
- Full-text search with filters
- Real-time inventory tracking
- Product ratings and reviews

### 🛒 Orders Service
Shopping cart and order management system.

[Read Full Documentation](./orders/README.md)

**Key Features:**
- Shopping cart operations
- Order creation and processing
- Multi-step order status tracking
- Payment status management
- Order history and audit trail

## 🔌 API Endpoints

### Health Checks
```http
GET /health
```

### Auth Service (Port 3000)
```
POST /auth/register       # User registration
POST /auth/login          # User login
POST /auth/refresh        # Refresh token
GET  /auth/users/:id      # Get user (protected)
```

### Catalog Service (Port 3001)
```
GET    /products           # List products
POST   /products           # Create product
GET    /products/:id       # Get product
PUT    /products/:id       # Update product
DELETE /products/:id       # Delete product
GET    /search             # Search products
POST   /check-stock        # Check inventory
GET    /categories         # List categories
POST   /categories         # Create category
```

### Orders Service (Port 3002)
```
GET    /orders/:id                     # Get order
POST   /orders                         # Create order
PUT    /orders/:id/status              # Update status
DELETE /orders/:id/cancel              # Cancel order
GET    /orders/user/:userId            # User's orders
GET    /orders/cart/:userId            # Get cart
POST   /orders/cart/:userId/items      # Add to cart
PUT    /orders/cart/:userId/items/:id  # Update cart item
DELETE /orders/cart/:userId            # Clear cart
POST   /orders/cart/:userId/checkout   # Checkout
```

## 🛠️ Technology Stack

### Core
- **Node.js 20** - JavaScript runtime
- **TypeScript 6.0** - Type-safe JavaScript
- **Express.js 5.2** - Web framework

### Database
- **PostgreSQL 14+** - Relational database
- **Prisma 7.7** - ORM and schema management

### Validation & Security
- **Zod 3.22** - Schema validation
- **Bcrypt 5.1** - Password hashing
- **JWT 9.0** - Token management
- **CORS** - Cross-origin request handling

### Development
- **TypeScript Compiler** - Compilation
- **Axios 1.6** - HTTP client for inter-service calls
- **dotenv** - Environment configuration
- **Prisma CLI** - Database management

## 📊 Data Models

### User (Auth Service)
```typescript
{
  id: number;
  email: string;
  password: string (hashed);
  firstName: string;
  lastName: string;
  role: "USER" | "ADMIN";
  createdAt: Date;
  updatedAt: Date;
}
```

### Product (Catalog Service)
```typescript
{
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  sku: string;
  categoryId: number;
  is_active: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Order (Orders Service)
```typescript
{
  id: number;
  orderNumber: string;
  userId: number;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  items: OrderItem[];
  history: OrderHistory[];
  createdAt: Date;
  updatedAt: Date;
}
```

## 🔄 Inter-Service Communication

| From | To | Purpose |
|------|-----|---------|
| Orders | Catalog | Stock verification, Price lookup |
| Orders | Auth | JWT validation (optional) |
| Catalog | Auth | JWT validation (optional) |

Communication happens via HTTP using Axios with environment-based service URLs.

## 🐳 Docker Deployment

### Using Docker Compose

```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Using Individual Docker Containers

```bash
# Build image for Auth Service
cd auth
docker build -t market-auth:1.0 .
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  market-auth:1.0
```

## 📝 Configuration

All services use environment variables for configuration:

- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Service port
- `NODE_ENV` - Environment (development/production)
- `CORS_ORIGIN` - Allowed origins
- `JWT_SECRET` - JWT secret key
- Service URLs for inter-service communication

See `.env.example` files in each service directory for complete list.

## 🧪 Testing

```bash
# Run tests in all services
npm run test

# Run tests with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## 📈 Performance Optimization

- **Database Indices** - Optimized queries on frequently accessed columns
- **Connection Pooling** - Prisma Client connection management
- **Pagination** - Large dataset handling
- **Lazy Loading** - On-demand data loading
- **Caching** - Strategic caching for catalog data

## 🔒 Security Best Practices

- ✅ Input validation with Zod schemas
- ✅ SQL injection prevention via Prisma ORM
- ✅ Password hashing with Bcrypt (12 rounds)
- ✅ JWT token security
- ✅ CORS configuration per environment
- ✅ Request size limits
- ✅ Error handling without exposing internals
- ✅ Environment-based secrets management

## 🚨 Error Handling

All services return standardized error responses:

```json
{
  "success": false,
  "message": "Descriptive error message"
}
```

HTTP Status Codes:
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## 📖 API Documentation

For detailed API documentation, see:
- [Auth Service API](./auth/README.md#-api-endpoints)
- [Catalog Service API](./catalog/README.md#-api-endpoints)
- [Orders Service API](./orders/README.md#-api-endpoints)

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
psql --version

# Verify DATABASE_URL format
postgresql://user:password@host:port/database
```

### Port Already in Use
```bash
# Change PORT in .env file or
# Kill process on port
lsof -ti:3000 | xargs kill -9
```

### Service Not Starting
```bash
# Check logs
npm run dev

# Verify dependencies
npm install

# Rebuild
npm run build
```

## 🔄 CI/CD Pipeline

All code is automatically tested and deployed using GitHub Actions:

### Workflows

- **Build & Test** - Builds all services and runs linting on every push
- **Code Quality** - TypeScript compilation and dependency audits
- **E2E Tests** - Integration tests with all services running (daily + on push)
- **Deploy** - Pushes Docker images to registry on main branch

### Automatic Testing

Every pull request triggers:
1. ✅ TypeScript compilation for all services
2. ✅ Linting (ESLint)
3. ✅ Integration tests with PostgreSQL instances
4. ✅ Docker image build validation

**[View Workflow Documentation](./.github/WORKFLOWS.md)**

### Deployment

Merging to `main` automatically:
1. Builds Docker images for all three services
2. Pushes to GitHub Container Registry (GHCR)
3. Tags with semantic versioning

### Status Badges

```markdown
![Build & Test](https://github.com/YOUR_USERNAME/Market/actions/workflows/build-and-test.yml/badge.svg)
![Code Quality](https://github.com/YOUR_USERNAME/Market/actions/workflows/code-quality.yml/badge.svg)
![E2E Tests](https://github.com/YOUR_USERNAME/Market/actions/workflows/e2e-tests.yml/badge.svg)
```

## 🤝 Contributing

For detailed contributing guidelines, see [CONTRIBUTING.md](./CONTRIBUTING.md):

1. Create a feature branch
2. Make your changes with tests
3. Ensure all CI checks pass
4. Submit a pull request with detailed description

**[Start Contributing](./CONTRIBUTING.md)**

## 📄 License

MIT

## 📞 Support

For issues and questions:
1. Check individual service READMEs
2. Review error logs
3. Verify environment configuration

---

## 🎯 Project Status

| Component | Status | Coverage |
|-----------|--------|----------|
| Auth Service | ✅ Complete | Production Ready |
| Catalog Service | ✅ Complete | Production Ready |
| Orders Service | ✅ Complete | Production Ready |
| Docker Compose  | ✅ Ready | Multi-service |
| Documentation | ✅ Complete | Full |
| Testing | 🔄 In Progress | Service-specific |

---

**Built with ❤️ using Node.js, TypeScript, and PostgreSQL**
