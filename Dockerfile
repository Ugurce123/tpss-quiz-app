# Multi-stage build for production
FROM node:18-alpine AS client-build

# Client build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci --only=production
COPY client/ ./
RUN npm run build

# Server build
FROM node:18-alpine AS server

WORKDIR /app
COPY server/package*.json ./
RUN npm ci --only=production

COPY server/ ./
COPY --from=client-build /app/client/build ./public

# Security: Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S baggage-app -u 1001

# Change ownership
RUN chown -R baggage-app:nodejs /app
USER baggage-app

EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

CMD ["npm", "start"]