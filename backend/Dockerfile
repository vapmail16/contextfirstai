# Multi-stage build for backend
# Addresses all issues from DEPLOYMENT_ISSUE_LOG.md

# ============================================================================
# BUILDER STAGE
# ============================================================================
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files (Issue #3: Handle package-lock.json gracefully)
COPY package.json ./
COPY package-lock.json* ./

# Install all dependencies including dev dependencies for build
# Issue #3: Use conditional logic to handle missing package-lock.json
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy Prisma schema first (needed for generating client)
# Issue #4: Copy Prisma schema before source code
COPY prisma ./prisma

# Generate Prisma Client BEFORE building TypeScript
# Issue #4: Prisma Client must be generated before TypeScript compilation
# TypeScript needs Prisma-generated types to compile successfully
RUN npx prisma generate

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# ============================================================================
# PRODUCTION STAGE
# ============================================================================
FROM node:18-alpine

WORKDIR /app

# Install OpenSSL for Prisma (Issue #7, #8)
# Prisma Client requires OpenSSL libraries to connect to PostgreSQL
RUN apk add --no-cache \
    openssl \
    openssl-dev \
    postgresql-client

# Copy package files
COPY package.json ./
COPY package-lock.json* ./

# Install production dependencies only
# Issue #3: Handle package-lock.json gracefully
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi

# Copy Prisma schema
COPY prisma ./prisma

# Regenerate Prisma Client in production stage with OpenSSL available
# Issue #8: Prisma Client must be regenerated in production stage
# This ensures Prisma binary is compiled against the correct OpenSSL version
# Prisma Client generated in builder stage may not work if OpenSSL wasn't available
RUN npx prisma generate

# Remove openssl-dev (keep openssl for runtime)
RUN apk del openssl-dev

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Create required directories (Issue #5)
# Winston logger writes to logs/ directory
# Upload service writes to uploads/ directory
RUN mkdir -p /app/logs /app/uploads

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership of the app directory
# Issue #5: Set proper permissions for directories the app needs to write to
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "dist/server.js"]

