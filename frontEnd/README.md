# Market Frontend

Frontend application for the Market e-commerce platform.

## Overview

This app is built with React and Vite, and communicates with the backend microservices:

- auth service
- catalog service
- orders service

## Stack

- React 18
- Vite 6
- Tailwind CSS 4
- MUI and Radix UI components

## Local Development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start development server:

   ```bash
   npm run dev
   ```

Default URL: http://localhost:5173

## Production Build

- npm run build
- npm run preview

## Docker

Build and run:

```bash
docker compose up --build
```

Container URL: http://localhost:4173

## Environment Variables

Vite reads the following build-time variables:

- VITE_AUTH_API_URL (default: http://localhost:3000)
- VITE_CATALOG_API_URL (default: http://localhost:3001)
- VITE_ORDERS_API_URL (default: http://localhost:3002)

Set these values before running build or docker compose if backend services use different hosts or ports.
