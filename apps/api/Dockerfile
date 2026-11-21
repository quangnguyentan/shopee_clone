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
RUN npm run build --workspace=backend

FROM node:22-alpine AS runtime
ENV NODE_ENV=production PORT=8080
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/admin/package.json apps/admin/package.json
COPY apps/assets/package.json apps/assets/package.json
COPY apps/mobile/package.json apps/mobile/package.json
COPY apps/ui/package.json apps/ui/package.json
RUN npm ci --omit=dev --workspace=backend --include-workspace-root=false --no-audit --no-fund --cache=/tmp/npm-cache \
    && rm -rf /tmp/npm-cache package.json package-lock.json apps/admin/package.json apps/assets/package.json apps/mobile/package.json apps/ui/package.json

WORKDIR /app/apps/api
COPY --from=builder --chown=node:node /app/apps/api/dist ./dist
COPY --from=builder --chown=node:node /app/apps/api/public ./public
RUN mkdir -p /app/apps/api/uploads /app/apps/api/avatars \
    && chown -R node:node /app/apps/api

USER node
EXPOSE 8080
CMD ["node", "dist/main.js"]
