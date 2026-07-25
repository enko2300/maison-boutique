FROM node:20-alpine

WORKDIR /app

# Copy server package files
COPY server/package*.json ./

# Install dependencies
RUN npm install

# Copy server source
COPY server/ .

# Generate Prisma client
RUN npx prisma generate

# Expose port
EXPOSE 3001

# Start the server with tsx (runs TypeScript directly)
CMD ["npx", "tsx", "src/index.ts"]
