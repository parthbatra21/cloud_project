# Use official Node.js Alpine LTS image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy Prisma schema
COPY prisma ./prisma

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY src ./src

# Expose service port
EXPOSE 5003

# Environment defaults
ENV NODE_ENV=production
ENV PORT=5003
ENV DATABASE_URL="file:/app/data/delivery.db"
ENV ORDER_SERVICE_URL="http://order-service:5002"

# Create data directory for SQLite volume persistence
RUN mkdir -p /app/data

# Healthcheck
HEALTHCHECK --interval=15s --timeout=3s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5003/health || exit 1

# Push database schema and start server
CMD ["sh", "-c", "npx prisma db push && node src/server.js"]
