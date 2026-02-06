FROM node:20-bookworm-slim

WORKDIR /app

# pnpm via corepack
RUN corepack enable

# Copy workspace manifests first for better layer caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json backend/package.json

# Install deps for backend (includes dev deps; simplest + reliable for Prisma CLI)
RUN pnpm install --frozen-lockfile --filter ./backend...

# Copy backend source and build
COPY backend backend
RUN pnpm --filter ./backend build

WORKDIR /app/backend
EXPOSE 3001

# Optional: push schema automatically on first boot (avoid for mature prod)
CMD ["sh", "-lc", "if [ \"${AUTO_DB_PUSH:-0}\" = \"1\" ]; then pnpm prisma:push; fi; node dist/main.js"]

