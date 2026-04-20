# Orders Service

> Order and cart management microservice for the Market platform with multi-step order processing and cart functionality.

## Overview

The Orders Service manages all order and cart-related operations including:
- Shopping cart management (add, remove, update items)
- Order creation from cart items
- Order status tracking and history
- Payment status management
- Order lookup and user order history
- Integration with Catalog Service for inventory verification

## Architecture

```
orders/
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
cd orders
npm install
```

### Environment Configuration

Create a `.env` file:

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

Service will be available at: `http://localhost:3002`

### Production

```bash
npm run build
npm run start
```

## API Endpoints

### Orders

#### Create Order
```http
POST /orders
Content-Type: application/json

{
  "userId": 1,
  "items": [
    {
      "productId": 1,
      "quantity": 2,
      "unitPrice": 99.99
    }
  ]
}
```

Response:
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "id": 1,
    "orderNumber": "ORD-1708123456789",
    "userId": 1,
    "totalAmount": 199.98,
    "status": "PENDING",
    "paymentStatus": "UNPAID",
    "items": [...],
    "history": [...]
  }
}
```

#### Get Order
```http
GET /orders/:id
```

#### Get User Orders
```http
GET /orders/user/:userId?limit=10&offset=0
```

#### Update Order Status
```http
PUT /orders/:id/status
Content-Type: application/json

{
  "status": "CONFIRMED",
  "note": "Payment received and verified"
}
```

Order statuses: `PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`

#### Cancel Order
```http
DELETE /orders/:id/cancel
```

### Cart

#### Get Cart
```http
GET /orders/cart/:userId
```

Response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 1,
    "items": [
      {
        "id": 1,
        "cartId": 1,
        "productId": 1,
        "quantity": 2
      }
    ]
  }
}
```

#### Add to Cart
```http
POST /orders/cart/:userId/items
Content-Type: application/json

{
  "productId": 1,
  "quantity": 2
}
```

#### Update Cart Item
```http
PUT /orders/cart/:userId/items/:productId
Content-Type: application/json

{
  "quantity": 3
}
```

Set quantity to 0 to remove item from cart.

#### Clear Cart
```http
DELETE /orders/cart/:userId
```

#### Checkout
```http
POST /orders/cart/:userId/checkout
```

Converts cart to order and clears the cart.

## Data Models

### Order
```typescript
{
  id: number;
  orderNumber: string;           // Unique identifier (ORD-{timestamp})
  userId: number;
  totalAmount: number;
  status: OrderStatus;           // PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED
  paymentStatus: PaymentStatus;  // UNPAID, PAID, FAILED, REFUNDED
  items: OrderItem[];
  history: OrderHistory[];
  createdAt: Date;
  updatedAt: Date;
}
```

### OrderItem
```typescript
{
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}
```

### Cart
```typescript
{
  id: number;
  userId: number;
  items: CartItem[];
  createdAt: Date;
  updatedAt: Date;
}
```

### CartItem
```typescript
{
  id: number;
  cartId: number;
  productId: number;
  quantity: number;
}
```

### OrderHistory
```typescript
{
  id: number;
  orderId: number;
  status: OrderStatus;
  note?: string;
  created_at: Date;
}
```

## Enums

### OrderStatus
- `PENDING` - Order created but not confirmed
- `CONFIRMED` - Payment confirmed
- `PROCESSING` - Being prepared
- `SHIPPED` - On the way
- `DELIVERED` - Successfully delivered
- `CANCELLED` - Order cancelled

### PaymentStatus
- `UNPAID` - Not yet paid
- `PAID` - Payment received
- `FAILED` - Payment failed
- `REFUNDED` - Refund issued

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
- `400 Bad Request` - Invalid input or business logic error
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## Inter-Service Communication

The Orders Service communicates with:
- **Auth Service** - For JWT token verification
- **Catalog Service** - For:
  - Stock verification before order creation
  - Product price retrieval during checkout
  - Product information lookups

Stock checks are performed:
- When creating an order with items
- When adding items to cart for future checkout

## Order Workflow

```
1. User adds items to cart
   ↓
2. User proceeds to checkout
   ↓
3. System verifies stock with Catalog Service
   ↓
4. Order created with status: PENDING
   ↓
5. Payment processing (external service)
   ↓
6. Payment confirmed → status: CONFIRMED
   ↓
7. Order processing → status: PROCESSING
   ↓
8. Shipment → status: SHIPPED
   ↓
9. Delivery → status: DELIVERED
```

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
docker build -t orders-service .
docker run -p 3002:3002 \
  -e DATABASE_URL="postgresql://..." \
  -e PORT=3002 \
  -e CATALOG_SERVICE_URL="http://catalog:3001" \
  orders-service
```

### Environment Variables

All required environment variables must be set before deployment. See `.env.example` for complete list.

## Performance Considerations

- Pagination implemented for order history queries
- Batch stock verification with Catalog Service
- Connection pooling via Prisma Client
- Database indices on frequently queried fields

## Security

- Input validation using Zod schemas
- CORS configuration per environment
- Standard SQL injection protection via Prisma
- Request size limits (10MB)
- User ID validation for cart/order access

## Logs

Logs are output to console in development mode. In production, consider integrating with a logging service.

## Related Services

- [Auth Service Documentation](../auth/README.md)
- [Catalog Service Documentation](../catalog/README.md)

## License

MIT
