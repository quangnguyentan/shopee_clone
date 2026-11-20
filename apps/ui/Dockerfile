FROM node:20-alpine AS builder
WORKDIR /app

# 1. Copy toàn bộ file cấu hình monorepo
COPY package*.json ./
COPY turbo.json ./
COPY apps/ui/package*.json ./apps/ui/

# 2. Cài đặt dependencies (dùng npm ci)
RUN npm install

# 3. Copy toàn bộ source code
COPY . .

# 4. Khai báo biến môi trường (Environment Variables) cho Next.js
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SOCKET_URL
ARG NEXT_PUBLIC_RECAPTCHA_SITE_KEY

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SOCKET_URL=$NEXT_PUBLIC_SOCKET_URL
ENV NEXT_PUBLIC_RECAPTCHA_SITE_KEY=$NEXT_PUBLIC_RECAPTCHA_SITE_KEY

# 5. Build dự án UI
RUN cd apps/ui && npm run build

# 6. Nếu dùng output: 'export' thì copy thư mục out sang Nginx
FROM nginx:alpine
COPY --from=builder /app/apps/ui/out /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]