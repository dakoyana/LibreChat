# v0.8.0-rc3

# Base node image
FROM node:20-alpine AS node

# Install jemalloc + tooling
RUN apk add --no-cache jemalloc
RUN apk add --no-cache python3 py3-pip uv

# Use jemalloc
ENV LD_PRELOAD=/usr/lib/libjemalloc.so.2

# Add `uv` for extended MCP support
COPY --from=ghcr.io/astral-sh/uv:0.6.13 /uv /uvx /bin/
RUN uv --version

# App dir
RUN mkdir -p /app && chown node:node /app
WORKDIR /app
USER node

# ---- IMPORTANT: copy manifests BEFORE any npm ci ----
COPY --chown=node:node package.json package-lock.json ./

# (Workspace manifests for cache efficiency)
COPY --chown=node:node api/package.json ./api/package.json
COPY --chown=node:node client/package.json ./client/package.json
COPY --chown=node:node packages/data-provider/package.json ./packages/data-provider/package.json
COPY --chown=node:node packages/data-schemas/package.json ./packages/data-schemas/package.json
COPY --chown=node:node packages/api/package.json ./packages/api/package.json

# Verify lockfile is here, set npm retry knobs, then clean install
RUN node -v && npm -v && pwd && ls -lah package*.json \
 && test -f package-lock.json \
 && npm config set fetch-retry-maxtimeout 600000 \
 && npm config set fetch-retries 5 \
 && npm config set fetch-retry-mintimeout 15000 \
 && npm ci --no-audit

# Bring in the rest of the source
COPY --chown=node:node . .

# Build client, prune prod deps, clean cache
RUN NODE_OPTIONS="--max-old-space-size=2048" npm run frontend \
 && npm prune --production \
 && npm cache clean --force \
 && mkdir -p /app/client/public/images /app/api/logs

# Node API setup
EXPOSE 3080
ENV HOST=0.0.0.0
CMD ["npm", "run", "backend"]

# Optional: for client with nginx routing
# FROM nginx:stable-alpine AS nginx-client
# WORKDIR /usr/share/nginx/html
# COPY --from=node /app/client/dist /usr/share/nginx/html
# COPY client/nginx.conf /etc/nginx/conf.d/default.conf
# ENTRYPOINT ["nginx", "-g", "daemon off;"]
