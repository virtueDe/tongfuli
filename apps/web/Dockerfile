FROM node:20-bookworm-slim AS deps
WORKDIR /workspace

RUN corepack enable && corepack prepare pnpm@8.15.7 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc tsconfig.base.json ./
COPY apps/web/package.json ./apps/web/package.json
COPY packages/domain-sdk/package.json ./packages/domain-sdk/package.json
COPY packages/ui/package.json ./packages/ui/package.json

RUN pnpm install --frozen-lockfile

FROM deps AS builder
WORKDIR /workspace

COPY apps/web ./apps/web
COPY packages/domain-sdk ./packages/domain-sdk
COPY packages/ui ./packages/ui

ARG NEXT_PUBLIC_CORE_PLATFORM_BASE_URL=http://127.0.0.1:8080
ENV NEXT_PUBLIC_CORE_PLATFORM_BASE_URL=${NEXT_PUBLIC_CORE_PLATFORM_BASE_URL}

RUN pnpm --filter web build

FROM node:20-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /workspace/apps/web/.next/standalone ./
COPY --from=builder /workspace/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /workspace/apps/web/public ./apps/web/public

EXPOSE 3000

CMD ["node", "apps/web/server.js"]
