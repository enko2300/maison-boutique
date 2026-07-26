FROM node:20-slim

WORKDIR /app

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy server files
COPY server/package*.json server/.npmrc ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy server source
COPY server/ .

# Generate Prisma
RUN npx prisma generate

EXPOSE 3001

CMD ["npx", "tsx", "src/index.ts"]
