# build 
FROM node:24-slim AS build

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# L'URL de l'API est injectee au build (Vite l'incorpore dans le bundle).
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN pnpm build

#  nginx sert les fichiers statiques 
FROM nginx:1.27-alpine AS production

# Config nginx pour une SPA (react-router)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Fichiers buildes
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]