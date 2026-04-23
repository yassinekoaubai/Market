# Market Backend

Backend services for the Market e-commerce platform.

## Overview

This folder contains three TypeScript microservices:

1. auth (port 3000): authentication, tokens, and user access
2. catalog (port 3001): product and category management
3. orders (port 3002): carts, checkout, and order processing

Each service owns its own PostgreSQL database and Prisma schema.

## Project Layout

- auth
- catalog
- orders
- docker-compose.yml
- jenkins

## Prerequisites

- Node.js 20+
- npm 10+
- Docker + Docker Compose (recommended)

## Run With Docker

From this directory:

```bash
docker compose up --build
```

Services:

- auth API: http://localhost:3000
- catalog API: http://localhost:3001
- orders API: http://localhost:3002

Databases:

- auth-db: localhost:5432
- catalog-db: localhost:5433
- orders-db: localhost:5434

## Run Locally Without Docker

1. Install service dependencies:

   ```bash
   npm run install:services
   ```

2. Start each service in a separate terminal:

   ```bash
   npm run dev:auth
   npm run dev:catalog
   npm run dev:orders
   ```

## Database and Prisma Commands

Run these inside a specific service directory (auth, catalog, or orders):

- npm run db:push
- npm run db:migrate
- npm run db:reset
- npm run db:studio
- npm run db:seed
- npm run generate

## Health Checks

- http://localhost:3000/health
- http://localhost:3001/health
- http://localhost:3002/health

## Service Documentation

- auth/README.md
- catalog/README.md
- orders/README.md

## CI/CD

Jenkins resources are available in jenkins and the root Jenkinsfile.
