# Memo App (Next.js + Supabase)

Minimal production-ready memo app built with:
- Next.js (App Router)
- Supabase (Postgres)
- Vercel-ready API routes

Features:
- CRUD notes (create, read, update, delete)
- Simple clean UI
- Basic validation + error handling
- Optional local mock mode for development (`USE_MOCK_DATA=true`)

## 1) Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open: `http://localhost:3000`

## 2) Supabase setup

1. Create a Supabase project
2. In Supabase SQL editor, run `supabase/schema.sql`
3. Copy credentials from **Project Settings → API** into `.env.local`

## 3) Environment variables

- `SUPABASE_URL` (required unless mock mode)
- `SUPABASE_ANON_KEY` (required unless mock mode)
- `SUPABASE_SERVICE_ROLE_KEY` (recommended for secure server-side CRUD)
- `USE_MOCK_DATA` (`true` or `false`)

### Mock mode

If `USE_MOCK_DATA=true`, data is stored in `.data/notes.json` locally and Supabase is not required.

## 4) Deploy to Vercel

1. Push this repo to GitHub/GitLab/Bitbucket
2. Import project in Vercel
3. Add environment variables from `.env.example` in Vercel Project Settings
4. Deploy

No extra Vercel config is required.

## Notes on security

- API routes run server-side; do **not** expose `SUPABASE_SERVICE_ROLE_KEY` to browser code.
- Current SQL policy allows anon/authenticated full access for simplicity.
  Tighten policies if you add user auth.
