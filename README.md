# Market

Market is a full-stack e-commerce platform with a React frontend and a Node.js microservices backend.

## Architecture

- frontEnd: React + Vite client application
- backEnd/auth: authentication and token lifecycle
- backEnd/catalog: products and categories
- backEnd/orders: cart and order workflows

Each backend service has its own PostgreSQL database and Prisma schema.

## Tech Stack

- Frontend: React 18, Vite 6, Tailwind CSS 4, MUI, Radix UI
- Backend: Node.js 20+, TypeScript, Express 5, Prisma, PostgreSQL
- DevOps: Docker Compose, Jenkins pipelines

## Prerequisites

- Node.js 20 or newer
- npm 10 or newer
- Docker and Docker Compose (optional, recommended for quick start)

## Quick Start

### Option A: Docker (fastest)

1. Start backend services:

  ```bash
  cd backEnd
  docker compose up --build
  ```

2. Start frontend:

  ```bash
  cd ../frontEnd
  docker compose up --build
  ```

Application URLs:

- Frontend: http://localhost:4173
- Auth API: http://localhost:3000
- Catalog API: http://localhost:3001
- Orders API: http://localhost:3002

### Option B: Local development

1. Install backend service dependencies:

  ```bash
  cd backEnd
  npm run install:services
  ```

2. Start backend services in separate terminals:

  ```bash
  npm run dev:auth
  npm run dev:catalog
  npm run dev:orders
  ```

3. Start frontend:

  ```bash
  cd ../frontEnd
  npm install
  npm run dev
  ```

Local frontend URL: http://localhost:5173

## Service Ports

- auth API: 3000, database: 5432
- catalog API: 3001, database: 5433
- orders API: 3002, database: 5434

## Health Checks

- http://localhost:3000/health
- http://localhost:3001/health
- http://localhost:3002/health

## Environment Variables

Frontend build-time API endpoints:

- VITE_AUTH_API_URL (default: http://localhost:3000)
- VITE_CATALOG_API_URL (default: http://localhost:3001)
- VITE_ORDERS_API_URL (default: http://localhost:3002)

Service-level environment files and examples are documented in each service README.

## Documentation

- Root backend guide: backEnd/README.md
- Frontend guide: frontEnd/README.md
- Auth service: backEnd/auth/README.md
- Catalog service: backEnd/catalog/README.md
- Orders service: backEnd/orders/README.md
