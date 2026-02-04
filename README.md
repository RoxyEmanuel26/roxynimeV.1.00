# RoxyNime - Anime Streaming Website

A production-ready anime streaming platform built with Next.js 15, featuring real-time anime data from MyAnimeList and streaming content from Kazuna API.

![RoxyNime Screenshot](./screenshot.png)

## ✨ Features

- 🎬 **Browse Anime** - Explore ongoing, completed series, and movies
- 📺 **Stream Episodes** - Watch anime with HLS video player
- 🔍 **Search & Filter** - Find anime by title, genre, or type
- 👤 **User Accounts** - Sign up/login with email or Google OAuth
- 📊 **Watch History** - Track your viewing progress
- ❤️ **Favorites** - Save anime to your personal list
- 🌙 **Dark/Light Mode** - Theme preference persisted
- 📱 **Responsive** - Works on desktop, tablet, and mobile
- 🎨 **Modern UI** - Beautiful anime-themed design

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite + Prisma ORM
- **Auth**: NextAuth.js (Google OAuth + Credentials)
- **State**: TanStack Query
- **Video**: HLS.js
- **Animations**: Framer Motion

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd roxynime

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# (Optional) Seed the database with demo data
npx prisma db seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Demo Account

- Email: `demo@roxynime.com`
- Password: `demo123`

## 📝 Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"  # Generate: openssl rand -base64 32

# Google OAuth (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# MyAnimeList API (optional, for metadata)
MAL_CLIENT_ID=""

# Kazuna API (streaming source)
KAZUNA_API_URL="https://luckyindraefendi.me/api/v2"
```

### Getting API Keys

1. **Google OAuth**: [Google Cloud Console](https://console.cloud.google.com/)
2. **MyAnimeList API**: [MAL API Dashboard](https://myanimelist.net/apiconfig)

## 📂 Project Structure

```
roxynime/
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Seed data
├── public/              # Static assets
├── src/
│   ├── app/             # Next.js App Router pages
│   │   ├── api/         # API routes
│   │   ├── anime/       # Anime detail pages
│   │   ├── auth/        # Auth pages
│   │   ├── browse/      # Browse page
│   │   ├── profile/     # User profile
│   │   └── watch/       # Video player
│   ├── components/      # React components
│   ├── lib/             # Utilities & API clients
│   └── types/           # TypeScript types
└── package.json
```

## 🎨 UI Components

- **AnimeCard** - Display anime with poster and info
- **AnimeCarousel** - Horizontal scrolling anime list
- **VideoPlayer** - HLS video player with controls
- **SearchFilter** - Search and filter functionality
- **BannerAd/SidebarAd** - Ad placeholder components

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/anime` | GET | List anime (ongoing/completed/movie) |
| `/api/anime/[id]` | GET | Get anime details |
| `/api/anime/search` | GET | Search anime |
| `/api/streaming/[animeId]/[episodeId]` | GET | Get streaming URLs |
| `/api/history` | GET/POST | User watch history |
| `/api/favorites` | GET/POST | User favorites |

## 🚢 Deployment

### Vercel (Recommended)

```bash
npm i -g vercel
vercel
```

Add environment variables in Vercel dashboard.

### Docker

```bash
docker build -t roxynime .
docker run -p 3000:3000 roxynime
```

### Railway/Render

For production, consider switching to PostgreSQL:

1. Update `DATABASE_URL` to PostgreSQL connection string
2. Change `provider = "sqlite"` to `provider = "postgresql"` in `schema.prisma`
3. Run migrations

## ⚠️ Disclaimer

This project is for educational purposes only. RoxyNime does not host or store any video content. All streaming content is provided by third-party APIs.

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

---

Made with ❤️ for anime fans
