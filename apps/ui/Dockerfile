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

ARG NEXT_PUBLIC_API_URL=http://localhost:8080
ARG NEXT_PUBLIC_SOCKET_URL=http://localhost:8080
ARG NEXT_PUBLIC_RECAPTCHA_SITE_KEY=local-development-site-key
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_SOCKET_URL=$NEXT_PUBLIC_SOCKET_URL \
    NEXT_PUBLIC_RECAPTCHA_SITE_KEY=$NEXT_PUBLIC_RECAPTCHA_SITE_KEY
RUN npm run build --workspace=client

FROM node:22-alpine AS runtime
ENV NODE_ENV=production PORT=8080 HOSTNAME=0.0.0.0
WORKDIR /app

COPY --from=builder --chown=node:node /app/apps/ui/.next/standalone ./
COPY --from=builder --chown=node:node /app/apps/ui/.next/static ./apps/ui/.next/static
COPY --from=builder --chown=node:node /app/apps/ui/public ./apps/ui/public
RUN mkdir -p /app/apps/ui/.next && chown -R node:node /app/apps/ui/.next

WORKDIR /app/apps/ui
USER node
EXPOSE 8080
CMD ["node", "server.js"]