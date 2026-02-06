# Her - Setup Guide

Complete guide to setting up and running the Her AI chat application.

## Prerequisites

Ensure you have the following installed on your system:

- **Node.js** 18.0 or higher
- **pnpm** 8.0 or higher
- **Docker** & **Docker Compose** (for PostgreSQL database)
- **Git** (for version control)

### Installing pnpm

If you don't have pnpm installed:

```bash
npm install -g pnpm
```

## Quick Start

### 1. Clone or Navigate to Project

```bash
cd E:\Her
```

### 2. Install Dependencies

```bash
# Install all dependencies for the monorepo
pnpm install
```

This will install dependencies for both frontend and backend.

### 3. Environment Setup

Create environment files for both frontend and backend:

**Backend (.env):**
```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/her_db
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
OPENROUTER_API_KEY=your-openrouter-api-key  # Optional - users can provide their own
OPENROUTER_SITE_URL=http://localhost:3000
OPENROUTER_APP_NAME=Her
CORS_ORIGIN=http://localhost:3000
PORT=3001
NODE_ENV=development
```

**Frontend (.env.local):**
```bash
cp .env.example .env.local
```

Edit `.env.local` (in root):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=Her
```

### 4. Start PostgreSQL Database

```bash
docker-compose up -d postgres
```

This will start PostgreSQL in a Docker container.

### 5. Initialize Database

```bash
# Generate Prisma client
pnpm --filter backend prisma:generate

# Push database schema
pnpm db:push
```

### 6. Start Development Servers

**Option 1: Start both frontend and backend**
```bash
pnpm dev
```

**Option 2: Start separately**
```bash
# Terminal 1 - Backend
pnpm dev:backend

# Terminal 2 - Frontend
pnpm dev:frontend
```

### 7. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **Database**: localhost:5432

## Development Workflow

### Project Structure

```
her/
├── frontend/          # Next.js frontend application
│   ├── src/
│   │   ├── app/      # App Router pages
│   │   ├── components/
│   │   ├── lib/      # Utilities, stores, types
│   │   └── styles/
│   ├── package.json
│   └── tailwind.config.ts
│
├── backend/           # NestJS backend API
│   ├── src/
│   │   ├── modules/  # Feature modules
│   │   ├── prisma/   # Prisma schema
│   │   └── main.ts
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
│
├── docker-compose.yml
├── pnpm-workspace.yaml
├── package.json
└── README.md
```

### Available Scripts

**Root-level commands:**
```bash
pnpm dev              # Start both frontend and backend
pnpm dev:frontend     # Start only frontend
pnpm dev:backend      # Start only backend
pnpm build            # Build both for production
pnpm lint             # Lint all code
pnpm format           # Format code with Prettier

# Database commands
pnpm db:migrate       # Run database migrations
pnpm db:generate      # Generate Prisma client
pnpm db:push          # Push schema changes
pnpm db:studio        # Open Prisma Studio
```

**Frontend-specific:**
```bash
cd frontend
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm lint             # Run ESLint
pnpm type-check       # Check TypeScript types
```

**Backend-specific:**
```bash
cd backend
pnpm start:dev        # Start dev server with watch
pnpm build            # Build for production
pnpm start:prod       # Start production server
pnpm lint             # Run ESLint
pnpm test             # Run tests
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

### Conversations
- `GET /api/conversations` - List all conversations
- `POST /api/conversations` - Create new conversation
- `GET /api/conversations/:id` - Get conversation details
- `PATCH /api/conversations/:id` - Update conversation
- `DELETE /api/conversations/:id` - Delete conversation

### Messages
- `POST /api/messages/stream` - Send message and stream response (SSE)

## Database Management

### View Database with Prisma Studio

```bash
pnpm db:studio
```

This opens a web interface at http://localhost:5555 to view and edit database records.

### Reset Database

```bash
# Drop all tables and recreate
pnpm --filter backend prisma migrate reset

# Or push fresh schema
pnpm db:push
```

### Seed Database (Optional)

Create `backend/prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create sample users
  await prisma.user.create({
    data: {
      email: 'test@example.com',
      password: 'hashed_password_here',
      name: 'Test User',
    },
  });
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Add to `backend/package.json`:
```json
"prisma": {
  "seed": "ts-node prisma/seed.ts"
}
```

Run:
```bash
pnpm --filter backend prisma db seed
```

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL container is running
docker ps

# View container logs
docker logs her-postgres

# Restart container
docker-compose restart postgres
```

### Port Already in Use

If port 3000 or 3001 is already in use:

1. Find the process using the port:
   ```bash
   # Windows
   netstat -ano | findstr :3000

   # Mac/Linux
   lsof -i :3000
   ```

2. Kill the process or change the port in `.env` files.

### Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules frontend/node_modules backend/node_modules
rm pnpm-lock.yaml
pnpm install
```

### Prisma Client Issues

```bash
# Regenerate Prisma client
pnpm db:generate

# Or specifically for backend
pnpm --filter backend prisma:generate
```

### TypeScript Errors

```bash
# Clean build files
rm -rf frontend/.next backend/dist

# Rebuild
pnpm build
```

## Production Deployment

### Building for Production

```bash
# Build both frontend and backend
pnpm build
```

### Environment Variables for Production

Create `.env.production` with production values:

**Backend:**
```env
DATABASE_URL=postgresql://user:password@production-host:5432/her_db
JWT_SECRET=strong-random-production-secret
JWT_EXPIRES_IN=7d
OPENROUTER_API_KEY=your-production-key
OPENROUTER_SITE_URL=https://your-domain.com
OPENROUTER_APP_NAME=Her
CORS_ORIGIN=https://your-domain.com
PORT=3001
NODE_ENV=production
```

**Frontend:**
```env
NEXT_PUBLIC_API_URL=https://api.your-domain.com
NEXT_PUBLIC_APP_NAME=Her
```

### Deployment Options

1. **Vercel (Frontend) + Railway/Render (Backend)**
2. **Self-hosted with Docker Compose**
3. **Kubernetes (for scaling)**

See README.md for more deployment options.

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [OpenRouter API](https://openrouter.ai/docs)

## Support

For issues or questions:
- Check the troubleshooting section above
- Review error logs in terminal
- Check browser console for frontend errors
- Check backend terminal for API errors

Happy coding with Her! 💚
