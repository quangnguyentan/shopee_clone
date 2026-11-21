FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json turbo.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/admin/package.json apps/admin/package.json
COPY apps/assets/package.json apps/assets/package.json
COPY apps/mobile/package.json apps/mobile/package.json
COPY apps/ui/package.json apps/ui/package.json
RUN npm ci

COPY . .
ARG VITE_PUBLIC_API_URL=http://localhost:8080
ARG VITE_PUBLIC_SOCKET_URL=http://localhost:8080
ARG VITE_ASSET_URL=http://localhost:8082
ARG VITE_NODE_ENV=production
ENV VITE_PUBLIC_API_URL=$VITE_PUBLIC_API_URL \
    VITE_PUBLIC_SOCKET_URL=$VITE_PUBLIC_SOCKET_URL \
    VITE_ASSET_URL=$VITE_ASSET_URL \
    VITE_NODE_ENV=$VITE_NODE_ENV
RUN npm run build --workspace=admin

FROM nginxinc/nginx-unprivileged:alpine
COPY --from=builder /app/apps/admin/dist /usr/share/nginx/html
COPY deploy/nginx/admin.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
