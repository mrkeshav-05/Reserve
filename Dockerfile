# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the application (Next.js config will output to standalone)
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy the standalone Next.js server and static files
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Expose the application port (Next.js defaults to 3000)
EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

# Start the application
CMD ["node", "server.js"]
