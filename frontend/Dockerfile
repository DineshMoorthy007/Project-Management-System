# Stage 1: Build React/Vite application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install dependencies (ci mode)
RUN npm ci

# Copy frontend source files
COPY . .

# Run production build
RUN npm run build

# Stage 2: Production static web server
FROM nginx:1.25-alpine

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 for Nginx web serving
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
