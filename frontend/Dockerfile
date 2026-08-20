# --- Stage 1: build the React app ---
FROM node:22-alpine AS build
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# --- Stage 2: serve with Nginx ---
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY gateway/nginx.container.conf /etc/nginx/conf.d/default.conf
COPY gateway/proxy_params.conf /etc/nginx/proxy_params.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]