FROM node:20-bookworm-slim

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY frontend/package.json frontend/package.json

RUN pnpm install --frozen-lockfile --filter ./frontend...

COPY frontend frontend
RUN pnpm --filter ./frontend build

WORKDIR /app/frontend
EXPOSE 3000

CMD ["pnpm", "start"]

