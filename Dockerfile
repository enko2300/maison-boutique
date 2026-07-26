FROM node:20-slim

WORKDIR /app

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy client files for build
COPY client/package*.json client/.npmrc* ./client/
RUN cd client && npm install

COPY client/ ./client/
RUN cd client && npm run build

# Copy server files
COPY server/package*.json server/.npmrc ./server/
RUN cd server && npm install --legacy-peer-deps

COPY server/ ./server/

# Copy frontend build to server/public
RUN mkdir -p server/public && cp -r client/dist/* server/public/

# Generate Prisma
RUN cd server && npx prisma generate

EXPOSE 3001

CMD ["npx", "tsx", "server/src/index.ts"]
