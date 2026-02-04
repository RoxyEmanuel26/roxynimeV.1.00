# Deployment Guide for RoxyNime

## Prerequisites

- **Node.js**: Version 18 or higher
- **Database**: SQLite (local) or PostgreSQL (production)
- **API Keys**:
  - Google OAuth Credentials
  - MyAnimeList API Client ID (Optional)

## Local Development

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd roxynime
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    # or if you encounter issues:
    npm install --legacy-peer-deps
    ```

3.  **Environment Setup**
    Copy `.env.example` to `.env` and fill in your keys.
    ```bash
    cp .env.example .env
    ```

4.  **Database Setup**
    Initialize the database schema and seed data.
    ```bash
    # Generate Prisma Client
    npx prisma generate

    # Push schema to database (simpler for dev than migrate)
    npx prisma db push

    # Seed the database
    npm run db:seed
    ```

5.  **Run the Server**
    ```bash
    npm run dev
    ```
    Visit `http://localhost:3000`.

## Production Deployment (Vercel)

1.  **Push to GitHub/GitLab**
2.  **Import Project in Vercel**
    - Select Next.js framework
    - Root directory: `./`
3.  **Configure Environment Variables**
    Add all variables from `.env` to Vercel Project Settings.
4.  **Database (Important)**
    - Vercel does not support persistent SQLite.
    - Provision a PostgreSQL database (e.g., Vercel Postgres, Railway, or Supabase).
    - Update `DATABASE_URL` in Vercel to the Postgres connection string.
    - Update `prisma/schema.prisma`:
      ```prisma
      datasource db {
        provider = "postgresql"
        url      = env("DATABASE_URL")
      }
      ```
5.  **Deploy**

## Troubleshooting

- **Prisma Errors**: Ensure `npx prisma generate` runs during build (it usually does automatically).
- **Video Playback**: If HLS streams fail, check the browser console for CORS issues or API limits.
