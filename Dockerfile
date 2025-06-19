FROM node:20-alpine

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

# ⚡️ HEALTHCHECK for docker
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

# Define the command to run the app
CMD [ "pnpm", "start" ]