# Multi-stage build for optimized production image
FROM node:20-alpine AS builder

WORKDIR /build

# Copy package files
COPY package.json package-lock.json ./
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

# Set environment
ENV NODE_ENV=production

# Copy package files
COPY package.json package-lock.json ./

# Install production dependencies only
RUN npm ci --omit=dev && npm cache clean --force

# Copy built application from builder
COPY --from=builder /build/dist ./dist
COPY --from=builder /build/prisma ./prisma
COPY --from=builder /build/node_modules/.prisma ./node_modules/.prisma

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3002/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Expose port
EXPOSE 3002

# Start application
CMD ["npm", "run", "start"]
