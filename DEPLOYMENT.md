# Deployment Guide: FoodBridge

This guide provides instructions for deploying FoodBridge to Vercel and connecting the Supabase backend.

## 🚀 One-Click Deployment

If you are using the Vercel Dashboard to import this repository, follow these steps:

1. **Import Project**: Select the GitHub repository you created.
2. **Framework Preset**: Vercel should automatically detect **Next.js**.
3. **Environment Variables**: You MUST add the following variables during the "Configure Project" step:

| Key | Value | Description |
|-----|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `your-anon-key` | Your Supabase public anonymous key |
| `GEMINI_API_KEY` | `your-gemini-key` | Your Google AI Studio API key |

4. **Deploy**: Click Deploy.

## 🛠️ Post-Deployment Setup

### 1. Supabase Callback URLs
Ensure your Supabase project allows the Vercel deployment URL in the Auth settings:
- Go to **Authentication > Settings** in Supabase.
- Add your Vercel URL (e.g., `https://foodbridge-platform.vercel.app`) to the **Redirect URLs** list.

### 2. Database Migrations
If you haven't already, run the SQL found in `docs/SUPABASE_SETUP.md` in the Supabase SQL Editor to initialize the tables.

### 3. Data Seeding
To populate your live database with demo data:
1. Locally, update your `.env.local` to point to the production Supabase instance.
2. Run:
   ```bash
   node scripts/supabase-seed.js
   ```

## 🔍 Deployment Readiness Checklist

- [x] Environment variables used via `process.env` (No hardcoded keys).
- [x] All client-side env vars prefixed with `NEXT_PUBLIC_`.
- [x] `.gitignore` includes `.env*`.
- [x] Build command is `next build`.
- [x] Output directory is `.next`.

## 🐛 Troubleshooting

- **404 on API Routes**: Ensure the `GOOGLE_AI_API_KEY` is correctly set in Vercel.
- **Supabase Connection Errors**: Double-check that your Vercel environment variables don't have trailing spaces.
- **Hydration Errors**: This project uses React 19; ensure all third-party components are compatible with the App Router.
