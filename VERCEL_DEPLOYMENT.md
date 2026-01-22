# Vercel Monorepo Deployment Guide

## Prerequisites
- Vercel account
- GitHub repository connected to Vercel
- Database URL (Prisma Accelerate or direct PostgreSQL)

## Deployment Steps

1. **Delete Old Projects**: To avoid confusion, delete the old `backend` and `brics` projects from your Vercel dashboard.

2. **Create New Project**:
   - Go to your Vercel Dashboard and click "New Project".
   - Import your GitHub repository (`BRICS`).
   - Vercel will detect it as a monorepo. **Do not change the Root Directory**. Leave it as `./`.

3. **Configure Environment Variables**:
   - In the project settings on Vercel, go to **Settings -> Environment Variables**.
   - Add the following variables. These are secrets for your backend.
     - `DATABASE_URL`: Your full PostgreSQL connection string.
     - `JWT_SECRET`: A long, random string for signing tokens.
     - `FOOTBALL_API_KEY`: (Optional) Your key for the football data API.

4. **Deploy**:
   - Click the "Deploy" button.
   - Vercel will now build both the `backend` and `frontend` and deploy them under a single domain.

That's it! Your application will now work seamlessly, with frontend and backend under one roof. You no longer need to manage separate URLs or worry about `NEXT_PUBLIC_API_URL`.