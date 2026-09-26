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

# Install ONLY production dependencies - cuts the image size down by ~40%
RUN bun install --production --frozen-lockfile

ENV PORT=80
EXPOSE 80

CMD ["bun", "dist/server/server.js"]
