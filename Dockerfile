FROM node:22-alpine AS base

ARG PORT=3000
ARG NODE_ENV=production
ENV PORT=${PORT}
ENV NODE_ENV=${NODE_ENV}

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.27.0 --activate

WORKDIR /app

FROM base AS build
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

FROM base AS prod-deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

FROM base AS runner

# Cần khai báo lại ARG nếu muốn dùng trong ENV của runner
ARG PORT=3000
ENV PORT=${PORT}
ENV NODE_ENV=production

RUN apk add --no-cache postgresql-client
RUN addgroup -S nodejs && adduser -S nodejs -G nodejs
USER nodejs

WORKDIR /app
COPY --from=build --chown=nodejs:nodejs /app/dist ./dist
COPY --from=prod-deps --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nodejs:nodejs /app/package.json ./package.json
COPY --from=build --chown=nodejs:nodejs /app/src/db ./src/db

EXPOSE ${PORT}

CMD ["node", "dist/server.js"]
