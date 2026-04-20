# Multi-stage build for optimized production image
FROM node:20-alpine AS builder

WORKDIR /build

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src

# Install dependencies
RUN npm ci

# Generate Prisma client
RUN npm run generate

# Build application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

ARG DATABASE_URL

# Set environment
ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev && npm cache clean --force

# Install Prisma CLI for runtime schema sync
RUN npm install -g prisma@7.7.0

# Copy built application from builder
COPY --from=builder /build/dist ./dist
COPY --from=builder /build/prisma ./prisma
COPY --from=builder /build/generated ./generated

# Prepare the database and seed it during image build
RUN prisma db push --url "$DATABASE_URL" && node dist/prisma/seed.js

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
RUN chown -R 1001:1001 /app/generated /app/prisma /app/dist
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "--experimental-specifier-resolution=node", "dist/src/index.js"]
