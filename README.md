# Market

Market is a full-stack e-commerce project split into two main applications:

- Frontend: React + Vite client app
- Backend: Node.js + TypeScript microservices (Auth, Catalog, Orders)

## Project Structure

```text
Market/
├── frontEnd/      # UI application
└── backEnd/       # API microservices + databases
```

## Frontend

Location: `frontEnd/`

### What it does

- Renders the user interface
- Handles navigation and user interactions
- Calls backend services through API URLs

### Tech stack

- React 18
- Vite 6
- Tailwind CSS 4
- MUI and Radix UI component libraries

### Run frontend locally

```bash
cd frontEnd
npm install
npm run dev
```

Default dev URL is usually `http://localhost:5173`.

### Run frontend with Docker

```bash
cd frontEnd
docker compose up --build
```

This serves the frontend on `http://localhost:4173`.

Frontend build-time API variables:

- `VITE_AUTH_API_URL` (default: `http://localhost:3000`)
- `VITE_CATALOG_API_URL` (default: `http://localhost:3001`)
- `VITE_ORDERS_API_URL` (default: `http://localhost:3002`)

## Backend

Location: `backEnd/`

### What it does

The backend is organized as microservices:

- Auth service (port `3000`): authentication and JWT
- Catalog service (port `3001`): product and category management
- Orders service (port `3002`): cart and order workflows

Each service uses PostgreSQL and Prisma.

### Services and ports

- `auth` -> API `3000`, Postgres `5432`
- `catalog` -> API `3001`, Postgres `5433`
- `orders` -> API `3002`, Postgres `5434`

### Run backend locally (service-by-service)

Install dependencies:

```bash
cd backEnd/auth && npm install
cd ../catalog && npm install
cd ../orders && npm install
```

Start services in separate terminals:

```bash
cd backEnd/auth && npm run dev
cd backEnd/catalog && npm run dev
cd backEnd/orders && npm run dev
```

Useful database commands inside each service:

- `npm run db:migrate`
- `npm run db:push`
- `npm run db:reset`
- `npm run db:studio`
- `npm run generate`

### Run backend with Docker

```bash
cd backEnd
docker-compose up --build
```

This starts:

- 3 Postgres containers
- 3 API service containers

## End-to-end local flow

1. Start backend services first (`backEnd/`).
2. Start frontend (`frontEnd/`).
3. Open the UI on `http://localhost:5173` (or `4173` if using frontend Docker).
4. Frontend sends requests to Auth/Catalog/Orders APIs.

## API Health Checks

Use these to verify services are running:

- `http://localhost:3000/health`
- `http://localhost:3001/health`
- `http://localhost:3002/health`

## Notes

- Backend service-specific details are available in:
  - `backEnd/auth/README.md`
  - `backEnd/catalog/README.md`
  - `backEnd/orders/README.md`
- Frontend details are available in:
  - `frontEnd/README.md`
