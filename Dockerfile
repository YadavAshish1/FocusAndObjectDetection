# ---------- FRONTEND BUILD ----------
    FROM node:18-alpine as frontend-build
    WORKDIR /app/frontend
    COPY frontend/package*.json ./
    RUN npm ci
    COPY frontend/ ./
    RUN npm run build
    
    # ---------- BACKEND BUILD ----------
    FROM node:18-alpine as backend-build
    WORKDIR /app/server
    COPY server/package*.json ./
    RUN npm ci --only=production
    COPY server/ ./
    
    # ---------- PRODUCTION IMAGE ----------
    FROM node:18-alpine
    
    WORKDIR /app
    
    # Copy backend files
    COPY --from=backend-build /app/server ./
    
    # Copy built frontend into backend's static folder
    COPY --from=frontend-build /app/frontend/dist ./frontend/dist
    
    # Create videos directory
    RUN mkdir -p /app/videos
    
    # Create non-root user
    RUN addgroup -g 1001 -S appuser \
        && adduser -S appuser -u 1001 \
        && chown -R appuser:appuser /app
    
    USER appuser
    
    EXPOSE 3001
    
    # Healthcheck
    HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
      CMD node -e "require('http').get('http://localhost:3001', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"
    
    # Start backend (which also serves frontend build)
    CMD ["node", "server.js"]
    