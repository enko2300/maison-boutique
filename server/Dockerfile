FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY server/package*.json ./
RUN npm ci --omit=dev

# Copy Prisma and generate
COPY server/prisma ./prisma
RUN npx prisma generate

# Copy source
COPY server/ .

EXPOSE 3001

CMD ["node", "--import", "tsx", "src/index.ts"]
