# -------- Builder --------
FROM node:22-alpine AS builder

WORKDIR /app

# Install ALL dependencies (including devDependencies) — we need @nestjs/cli
# and typescript to compile.
COPY package*.json ./
RUN npm ci --include=dev

# Copy source and compile TypeScript -> dist/
COPY . .
RUN npm run build && test -f /app/dist/main.js

# -------- Runtime --------
FROM node:22-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production

# Install production deps only (plus ts-node/tsconfig-paths for migrations & seed).
COPY package*.json ./
RUN npm ci --omit=dev

# Bring compiled output, source (needed by migration/seed ts-node scripts),
# and configs from builder.
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src ./src
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/tsconfig.json ./tsconfig.json

EXPOSE 3000

# Railway sets $PORT; main.ts reads it via process.env.PORT.
CMD ["sh", "-c", "npm run migration:run && npm run seed && npm run super-admin && node dist/main"]
