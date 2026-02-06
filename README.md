# Her

## Production Deploy (One Command, Docker Compose)

Prereqs:
- A Linux server with Docker + Docker Compose
- Your domain `A` record points to the server
- Ports `80` and `443` open

1) Clone and configure:
```bash
git clone https://github.com/L0stInFades/Her.git
cd Her
cp deploy/PROD_ENV.example .env
${EDITOR:-nano} .env
```

2) Start everything (HTTPS via Caddy):
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Notes:
- Frontend defaults to same-origin `/api` so you can keep `NEXT_PUBLIC_API_URL` empty.
- For first boot, you can set `AUTO_DB_PUSH=1` in `.env` to auto-apply the Prisma schema.

## Admin Panel

- URL: `/admin`
- First admin:
  - Set `ADMIN_BOOTSTRAP_TOKEN` in server `.env`
  - Create a normal user via `/register`, then open `/admin` and paste the token to promote your account

Admin capabilities:
- Enable/disable models and set the default model
- Control context size (`maxContextMessages`)
- Control user API key policy (`allowUserApiKeys`, `requireUserApiKey`)
- Manage users (list, ban/unban, assign plan Art/ProArt)
- Usage limits (monthly quota enforced at `/api/messages/stream`)

> Your warm, intelligent AI companion

Her is a modern AI chat application with a warm, elegant design inspired by the concept of "温润如玉" (warm and smooth like jade). Experience a chat companion that feels like conversing with a wise, understanding friend.

## ✨ Features

- 🎨 **Elegant Design**: "温润如玉" design philosophy with warm jade tones
- 💬 **ChatGPT-like Experience**: Modern, intuitive chat interface
- 🤖 **Multi-Model Support**: Access multiple AI models via OpenRouter
- 💾 **Conversation History**: Save and manage your conversations
- 🌙 **Dark Mode**: Beautiful light and dark themes
- 📱 **Cross-Platform**: Works on all modern browsers
- ⚡ **Real-time Streaming**: Fast, streaming responses
- 🔐 **Secure**: JWT authentication and secure data storage

## 🛠️ Tech Stack

### Frontend
- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Zustand (state management)
- React Query
- Framer Motion

### Backend
- NestJS
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT Authentication
- OpenRouter SDK

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- Docker & Docker Compose (for local database)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd her
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your configuration:
```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/her_db

# JWT
JWT_SECRET=your-super-secret-jwt-key

# OpenRouter (optional - users can provide their own)
OPENROUTER_API_KEY=your-openrouter-api-key
```

4. Start the database:
```bash
docker-compose up -d postgres
```

5. Run database migrations:
```bash
pnpm db:push
```

6. Start the development server:
```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to see Her in action.

## 📦 Project Structure

```
her/
├── frontend/          # Next.js frontend application
├── backend/           # NestJS backend API
├── docker-compose.yml # Docker services configuration
└── README.md          # This file
```

## 🎨 Design Philosophy

Her embodies the concept of "温润如玉" - warm, gentle, and elegant like fine jade.

- **Colors**: Soft jade greens, warm neutrals, and gentle accents
- **Shapes**: Rounded corners (16-24px) for a friendly feel
- **Motion**: Smooth, fluid animations
- **Typography**: Clean, readable fonts with excellent hierarchy

## 🌐 Deployment

### Development

```bash
pnpm dev
```

### Production Build

```bash
pnpm build
```

### Using Docker Compose

```bash
docker-compose up -d
```

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Made with ❤️ by the Her team
