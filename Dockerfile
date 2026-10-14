# stage 1: Build React App

FROM node:20.13.1-alpine AS build

WORKDIR /app

# Copy only package files to cache deps

COPY package*.json ./
#RUN npm i --force

RUN --mount=type=cache,target=/root/.npm \
    --mount=type=cache,target=/root/.cache \
    npm ci --no-audit --no-fund

# Copy source and build
COPY . .
RUN npm run build:prod

# Stage 2: Copy frontend file  to Nginx

FROM nginx:alpine

WORKDIR /usr/share/nginx/html

# Copy build output from build stage

COPY --from=build /app/build ./

COPY nginx.conf  /etc/nginx/conf.d/default.conf
# Optional: custom nginx config for SPA
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]