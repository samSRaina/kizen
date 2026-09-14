FROM node:22-alpine AS build

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY web/package.json web/pnpm-lock.yaml ./
COPY web/patches ./patches

#install dependencies
RUN pnpm install --frozen-lockfile

#copy source code
COPY web ./

RUN pnpm run build

#serve static app
FROM nginx:alpine

COPY infra/docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
