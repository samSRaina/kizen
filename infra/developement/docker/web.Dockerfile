FROM node:26-alpine3.24 AS build

WORKDIR /app

RUN npm install -g corepack && corepack enable && corepack prepare pnpm@latest --activate

# Copy manifest and patch layer prior to strictly locked installation
COPY web/pnpm-lock.yaml web/package.json ./
COPY web/patches ./patches

RUN pnpm install --frozen-lockfile

COPY web ./
RUN pnpm run build

FROM nginx:alpine
COPY infra/developement/docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
