# Stage 1: Build and dependency resolution
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install all dependencies (ci mode)
RUN npm ci

# Copy Prisma schema and compile Prisma Client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy source code files
COPY src ./src/

# Stage 2: Production runner
FROM node:20-alpine AS runner

WORKDIR /app

# Copy built application and compiled node_modules from builder stage
COPY --from=builder /app ./

# Expose backend port
EXPOSE 5000

# Set environment mode
ENV NODE_ENV=production

# Deploy migrations first and start server
CMD ["sh", "-c", "npx prisma migrate deploy && node src/index.js"]
