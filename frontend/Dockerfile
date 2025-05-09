# Use an official Node image as the base
FROM node:23-slim

# Set the working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package files
COPY package*.json pnpm-lock.yaml ./

# Install dependencies using pnpm
RUN pnpm install --frozen-lockfile

# Copy the rest of the source code
COPY . .

# Expose port 5173 (default Vite port)
EXPOSE 5173

# Command to start the Vite development server
CMD [ "pnpm", "run", "dev", "--host" ]
