# Stage 1: builder
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# Stage 2: runner
FROM node:20-alpine AS runner

WORKDIR /app

# Install production dependencies
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --omit=dev

# Copy compiled output
COPY --from=builder /app/dist ./dist

# Copy and setup entrypoint script
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Change ownership to non-root user 'node'
RUN chown -R node:node /app
USER node

EXPOSE 3015

ENTRYPOINT ["./docker-entrypoint.sh"]
