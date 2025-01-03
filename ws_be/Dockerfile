FROM node:latest AS base

FROM base AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN npm install -g pnpm
RUN pnpm install 
COPY . .
RUN pnpm build

# Production Stage
FROM node:20.11.1-alpine3.19
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist .
ENTRYPOINT ["node", "index.js"]
