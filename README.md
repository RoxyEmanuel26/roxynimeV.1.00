# RoxyAnimeHub - Anime Streaming Website

A production-ready anime streaming platform built with Next.js 15, powered by the **Sanka Vollerei API** for anime data and streaming links, featuring Prisma-based caching and full authenticaton.

![RoxyAnimeHub Screenshot](./screenshot.png)

## ✨ Features

- 🎬 **Browse Anime** - Explore ongoing, completed series, and movies from Sanka's vast library
- 📺 **Stream Episodes** - Watch anime with HLS/iframe video player (multiple servers supported)
- 🔍 **Search & Filter** - Find anime by title
- 👤 **User Accounts** - Sign up/login with email or Google OAuth
- 📊 **Watch History** - Track your viewing progress automatically
- ❤️ **Favorites** - Save anime to your personal list
- 🌙 **Dark/Light Mode** - Theme preference persisted
- 📱 **Responsive** - Works on desktop, tablet, and mobile
- ⚡ **Performance** - Server-side caching for API responses

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Shadcn UI
- **Database**: SQLite + Prisma ORM
- **Auth**: NextAuth.js (Google OAuth + Credentials)
- **State**: React Query (TanStack Query)
- **API Integration**: Sanka Vollerei API (via custom cached wrapper)

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd roxynime
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your credentials:
   ```env
   # Database
   DATABASE_URL="file:./dev.db"

   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"  # Generate with: openssl rand -base64 32

   # Google OAuth (Optional)
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"

   # Sanka API (Optional - defaults to https://www.sankavollerei.com)
   SANKA_API_BASE="https://www.sankavollerei.com"
   ```

4. **Initialize Database**
   ```bash
   npx prisma generate
   npx prisma db push
   
   # (Optional) Seed demo data
   npx prisma db seed
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

6. **Open in Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Demo Account (if seeded)
- Email: `demo@roxynime.com`
- Password: `demo123`

## 📂 Project Structure

```
roxynime/
├── prisma/
│   ├── schema.prisma       # Database schema (User, Favorite, History, ApiCache)
│   └── seed.ts             # Seed data
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── api/            # API routes
│   │   │   ├── anime/      # Anime list & details endpoints (proxies Sanka)
│   │   │   ├── streaming/  # Episode streaming data (proxies Sanka)
│   │   ├── anime/[id]/     # Anime detail pages
│   │   ├── watch/[...slug]/ # Video player page
│   │   └── browse/         # Browse/filter page
│   ├── components/
│   │   ├── ads/            # Ad placeholder components
│   │   ├── anime/          # Anime cards, carousels
│   │   └── player/         # Video player components
│   ├── lib/
│   │   ├── sankaClient.ts  # MAIN external API client (Sanka Vollerei)
│   │   ├── animbus.ts      # Adapter layer for UI compatibility
│   │   ├── cache.ts        # Prisma-based caching utility
│   │   └── auth.ts         # NextAuth configuration
└── package.json
```

## 🔌 API Integration

This project uses **Sanka Vollerei API** as the primary data source. 
- All external API calls are cached in the `ApiCache` table (SQLite) for 1 hour to improve performance and reduce load on Sanka's servers.
- The `sankaClient.ts` handles normalization of data specifically for this UI.

## 🚢 Deployment

### Vercel (Frontend + Serverless)
Note: SQLite does not work persistently on Vercel unless you use Vercel Postgres or another external DB.
For full functionality with SQLite, deploy to a VPS, Railway (with volume), or Docker.

### Docker
```bash
docker build -t roxynime .
docker run -p 3000:3000 -v $(pwd)/prisma:/app/prisma roxynime
```

## 📄 License
MIT License
