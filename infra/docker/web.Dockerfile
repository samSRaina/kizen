FROM node:22-alpine AS build

WORKDIR /app

COPY web/package*.json ./

#install dependencies
RUN npm ci

#copy source code
COPY web ./

RUN npm run build

#serve static app
FROM nginx:alpine

COPY infra/docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
