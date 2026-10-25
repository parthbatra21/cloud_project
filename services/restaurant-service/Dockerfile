# Use official Node.js Alpine LTS image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package descriptors first for layer caching
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy source code
COPY src ./src

# Expose service port
EXPOSE 5001

# Set production environment
ENV NODE_ENV=production
ENV PORT=5001

# Healthcheck
HEALTHCHECK --interval=15s --timeout=3s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5001/health || exit 1

# Start service
CMD ["node", "src/server.js"]
