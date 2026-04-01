FROM node:20.20.1-slim

WORKDIR /app

ARG NPM_REGISTRY=https://registry.npmmirror.com/

COPY package.json package-lock.json ./
RUN npm config set registry "$NPM_REGISTRY" \
    && npm ci --no-audit --no-fund --fetch-retries=5 --fetch-retry-mintimeout=20000 --fetch-retry-maxtimeout=120000 \
    && npm cache clean --force

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

LABEL authors="yunxi-zhu"
