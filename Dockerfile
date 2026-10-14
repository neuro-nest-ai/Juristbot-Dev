FROM node:20.13.1-bullseye-slim AS builder

WORKDIR /usr/src/app

# Install lightweight build tools for native modules (bcrypt)
RUN apt-get update \
 && apt-get install -y --no-install-recommends build-essential python3 git ca-certificates \
 && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./

RUN --mount=type=cache,target=/root/.npm \
    npm ci --prefer-offline --no-audit --progress=false

# Copy app sources
COPY . .

# Optional: run build step if you have one (will be a no-op otherwise)
RUN if [ -f package.json ] && npm run | grep -q " build"; then npm run build; fi

#----------

FROM node:20.13.1-bullseye-slim AS runtime
WORKDIR /usr/src/app

RUN apt-get update \
 && apt-get install -y --no-install-recommends curl ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN useradd --system --create-home --home-dir /home/app --user-group app \
 && mkdir -p /home/app/.npm/_logs \
 && chown -R app:app /home/app

# Copy built node_modules and app from builder
COPY --chown=app:app --from=builder /usr/src/app/node_modules ./node_modules
COPY --chown=app:app --from=builder /usr/src/app ./

RUN mkdir -p /usr/src/app/logs && chown -R app:app /usr/src/app/logs
#ENV NODE_ENV=production

USER app

WORKDIR /usr/src/app

EXPOSE 3001

CMD ["npm", "run", "start:prod"]