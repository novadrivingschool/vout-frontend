# ---------- Build stage ----------
FROM node:22-alpine AS build
WORKDIR /app

# Copia manifiestos primero
COPY package*.json ./

# Instala dependencias (compat. con builder legado)
# usa npm ci si hay lockfile; si no, cae en npm install
RUN npm ci --no-audit --no-fund || npm install --no-audit --no-fund

# Copia el resto del código y construye
COPY . .
RUN npm run build

# ---------- Runtime stage ----------
FROM nginx:1.27-alpine AS runtime

# Config de Nginx para SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Archivos estáticos de Vite
COPY --from=build /app/dist /usr/share/nginx/html

# Exponer el puerto interno (puedes dejar 80 y mapear afuera a 7070)
EXPOSE 80

# Healthcheck simple
HEALTHCHECK CMD wget --spider -q http://localhost/ || exit 1
