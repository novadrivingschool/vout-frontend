# ---------- Build stage ----------
FROM node:22-alpine AS build
WORKDIR /app

# Manifiestos primero para cache
COPY package*.json ./
RUN npm ci --no-audit --no-fund || npm install --no-audit --no-fund

# Código y build
COPY . .
RUN npm run build

# ---------- Runtime stage (sin Nginx) ----------
FROM node:22-alpine AS runtime
WORKDIR /app

# Server estático liviano
RUN npm i -g serve

# Copiamos el build
COPY --from=build /app/dist ./dist

EXPOSE 80
CMD ["serve", "-s", "dist", "-l", "80"]
