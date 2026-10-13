# ---- Build the static frontend ----
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# API base URL baked into the bundle. "/api" is proxied to the API container by nginx.
ARG VITE_BASE_URL=/api
ENV VITE_BASE_URL=$VITE_BASE_URL
RUN npm run build

# ---- Serve it with nginx ----
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
