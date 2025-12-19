# Multi-stage build for frontend
# Based on ai-nextwave-launchpad deployment (1-go success)

# ============================================================================
# BUILDER STAGE
# ============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for better caching
COPY package.json ./
COPY package-lock.json* ./

# Install dependencies
# Handle both cases: with and without package-lock.json
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy configuration files
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY postcss.config.js ./
COPY tailwind.config.ts ./
COPY components.json ./

# Copy source code
COPY . .

# Build frontend with increased memory limit for large builds
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm run build

# ============================================================================
# PRODUCTION STAGE
# ============================================================================
FROM nginx:alpine

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port (DCDeploy will map this)
EXPOSE 3001

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

