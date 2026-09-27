FROM oven/bun:alpine AS build

WORKDIR /app

# Copy lockfile and package.json
COPY web/bun.lock web/package.json ./

RUN bun i --frozen-lockfile

COPY web ./

RUN bun run build

FROM oven/bun:alpine

WORKDIR /app

# Copy only the compiled output and config files
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./
COPY --from=build /app/bun.lock ./
COPY --from=build /app/src ./src
COPY --from=build /app/server.ts ./server.ts

# Install ONLY production dependencies - cuts the image size down by ~40%
RUN bun install --production --frozen-lockfile

# Data directory for sqlite persistence
RUN mkdir -p /app/data

ENV PORT=80
ENV NODE_ENV=production
ENV AUTH_DATABASE_PATH=/app/data/auth.db
EXPOSE 80

CMD ["bun", "server.ts"]
