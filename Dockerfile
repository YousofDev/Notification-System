# Use Node.js 18 Alpine as base image
FROM node:18-alpine AS base

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
RUN pnpm install

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Production stage
FROM node:18-alpine AS production

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package files
COPY package.json ./

# Install only production dependencies
RUN pnpm install

# Copy built application from base stage
COPY --from=base /app/dist ./dist

# Set permissions for logs directory (using existing node user)
RUN mkdir -p /app/logs && chown -R node:node /app/logs

USER node

EXPOSE 3000

# Start the application
CMD ["pnpm", "start"]