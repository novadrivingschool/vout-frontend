# ---------- Build stage ----------
FROM node:22-alpine AS build
WORKDIR /app

# Copiamos manifiestos primero para aprovechar caché
COPY package*.json ./

# Instala dependencias (usa caché de npm para acelerar)
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund || npm install --no-audit --no-fund

# Copia el resto del código y construye
COPY . .
# Si usas variables Vite en build: docker build --build-arg VITE_API_URL=...
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

# ---------- Runtime stage ----------
FROM nginx:1.27-alpine AS runtime

# Config de Nginx para SPA (history mode) y cache de assets
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Archivos estáticos construidos por Vite
COPY --from=build /app/dist /usr/share/nginx/html

# Puerto interno
EXPOSE 80

# Healthcheck básico
HEALTHCHECK CMD wget --spider -q http://localhost/ || exit 1
