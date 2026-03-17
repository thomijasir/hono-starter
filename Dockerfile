# Stage 1: builder
FROM oven/bun:1 AS builder
WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

COPY . .

# Stage 2: runtime
FROM oven/bun:1-slim AS runtime
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/package.json ./
COPY --from=builder /app/tsconfig.json ./
COPY docker-entrypoint.sh ./docker-entrypoint.sh

RUN chmod +x ./docker-entrypoint.sh

EXPOSE 3099

ENTRYPOINT ["./docker-entrypoint.sh"]
