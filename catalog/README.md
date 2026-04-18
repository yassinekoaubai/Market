# Catalog Service

> Product and category management microservice for the Market platform with search, filtering, and inventory tracking.

## Overview

The Catalog Service manages all product-related operations including:
- Product CRUD operations with inventory tracking
- Category management and organization
- Product search and filtering by name, description, SKU, price range
- Real-time stock status checking
- Product ratings and reviews

## Architecture

```
catalog/
├── src/
│   ├── config/          # Configuration files
│   ├── schemas/         # Zod validation schemas
│   ├── types/           # TypeScript interfaces
│   ├── services/        # Business logic
│   ├── controllers/     # Request handlers
│   ├── routes/          # Route definitions
│   ├── middlewares/     # Express middleware
│   └── index.ts         # Server entry point
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Seed data
└── package.json
```

## Setup & Installation

### Prerequisites
- Node.js 20+
- PostgreSQL 14+
- npm or yarn

### Installation

```bash
cd catalog
npm install
```

### Environment Configuration

Create a `.env` file:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/catalog_db"
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000,http://localhost:3001,http://localhost:3002
AUTH_SERVICE_URL=http://localhost:3000
```

### Database Setup

```bash
# Create migration
npm run migrate:dev

# Seed database
npm run seed
```

## Running the Service

### Development

```bash
npm run dev
```

Service will be available at: `http://localhost:3001`

### Production

```bash
npm run build
npm run start
```

## API Endpoints

### Products

#### Create Product
```http
POST /products
Content-Type: application/json

{
  "name": "Wireless Headphones",
  "description": "High quality wireless headphones",
  "price": 99.99,
  "quantity": 50,
  "sku": "WH-001",
  "categoryId": 1,
  "image_url": "https://example.com/image.jpg"
}
```

#### Get Product
```http
GET /products/:id
```

#### Update Product
```http
PUT /products/:id
Content-Type: application/json

{
  "name": "Updated Name",
  "price": 89.99,
  "quantity": 45
}
```

#### Delete Product
```http
DELETE /products/:id
```

#### Search Products
```http
GET /search?search=headphones&categoryId=1&minPrice=50&maxPrice=150&limit=10&offset=0
```

#### Get Products by Category
```http
GET /category/:categoryId/products
```

### Categories

#### Create Category
```http
POST /categories
Content-Type: application/json

{
  "name": "Electronics",
  "description": "Electronic devices",
  "image_url": "https://example.com/category.jpg"
}
```

#### Get All Categories
```http
GET /categories
```

#### Get Category
```http
GET /categories/:id
```

#### Update Category
```http
PUT /categories/:id
Content-Type: application/json

{
  "name": "Updated Category Name"
}
```

#### Delete Category
```http
DELETE /categories/:id
```

### Inventory

#### Check Stock
```http
POST /check-stock
Content-Type: application/json

{
  "productId": 1,
  "quantity": 10
}
```

## Data Models

### Product
```typescript
{
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  sku: string;
  image_url?: string;
  categoryId: number;
  is_active: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Category
```typescript
{
  id: number;
  name: string;
  description: string;
  image_url?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Rating
```typescript
{
  id: number;
  productId: number;
  userId: number;
  score: number;
  review: string;
  created_at: Date;
}
```

## Error Handling

The service returns standardized error responses:

```json
{
  "success": false,
  "message": "Error message describing what went wrong"
}
```

HTTP Status Codes:
- `200 OK` - Successful request
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid input
- `404 Not Found` - Resource not found
- `409 Conflict` - Business logic conflict (duplicate SKU, etc.)
- `500 Internal Server Error` - Server error

## Inter-Service Communication

The Catalog Service communicates with:
- **Auth Service** - For JWT token verification
- **Orders Service** - For inventory checks (consumed via HTTP)

## Scripts

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm run start        # Run production build
npm run migrate:dev  # Create and run migrations
npm run seed         # Seed database with sample data
npm run prisma:ui    # Open Prisma Studio
```

## Testing

```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

## Deployment

### Docker

```bash
docker build -t catalog-service .
docker run -p 3001:3001 \
  -e DATABASE_URL="postgresql://..." \
  -e PORT=3001 \
  catalog-service
```

### Environment Variables

All required environment variables must be set before deployment. See `.env.example` for complete list.

## Performance Considerations

- Product search uses database indices on `name`, `description`, and `sku`
- Pagination implemented to handle large datasets
- Connection pooling via Prisma Client
- Lazy loading of product relationships

## Security

- Input validation using Zod schemas
- CORS configuration per environment
- Standard SQL injection protection via Prisma
- Request size limits (10MB)

## Logs

logs are output to console in development mode. In production, consider integrating with a logging service.

## Related Services

- [Auth Service Documentation](../auth/README.md)
- [Orders Service Documentation](../orders/README.md)

## License

MIT
