# Use an official Node image as the base
# FROM node:23-slim

# # Set the working directory
# WORKDIR /app

# # Install pnpm globally
# RUN npm install -g pnpm

# # Copy package files
# # COPY package*.json pnpm-lock.yaml ./
# COPY package*.json ./

# # Install dependencies using pnpm
# # RUN pnpm install --frozen-lockfile
# RUN pnpm install

# # Copy the rest of the source code
# COPY . .

# # Expose port 5173 (default Vite port)
# EXPOSE 5173

# # Command to start the Vite development server
# CMD [ "pnpm", "run", "dev", "--host" ]

# Use an official Node LTS (Long-Term Support) image for stability
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Expose the Vite port
EXPOSE 5173

# The command will be run from docker-compose.yml