# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # prisma generate --no-engine && next build
npm run lint         # ESLint
npx prisma studio    # Browse database
npx prisma db push   # Push schema changes to database
```

Deployed on Vercel at https://dm-companion-iota.vercel.app. Pushing to `main` triggers auto-deploy.

## Architecture

DM Companion is a Next.js 16 App Router application for tabletop RPG game masters. Users upload session audio recordings, which are transcribed and summarized by Google Gemini AI, then automatically turned into wiki entries (characters, locations, items, etc.).

### Core Flow

1. **Audio Upload** — Client-side upload to Vercel Blob (`components/audio/AudioUploader.tsx`), then DB record via `/api/audio/create-record`
2. **Processing** — `/api/audio/process` fires background pipeline: Gemini Pro transcription → Gemini Flash summary → entity extraction → wiki entry creation (`lib/gemini/wiki-generator.ts`)
3. **Wiki** — Auto-generated entries (SESSION_RECAP + entities) displayed in a Notion-like sidebar layout (`components/wiki/WikiPageLayout.tsx`). Users can also manually create/edit entries or trigger bulk wiki generation via "Update Wiki" button
4. **Chat** — Streaming AI chat (`/api/chat`) with campaign wiki context injected into prompts (`lib/gemini/chat.ts`)

### Key Patterns

- **Auth**: NextAuth v5 beta.30 with Google OAuth and **JWT session strategy** (not database sessions — Edge Runtime middleware can't query DB via Prisma). Config in `lib/auth.ts`, route protection in `proxy.ts`
- **Gemini clients**: Lazy-initialized in `lib/gemini/client.ts` to avoid breaking Vercel static analysis. Use `getGeminiPro()` for transcription, `getGeminiFlash()` for chat/wiki
- **Server actions**: `actions/` directory — campaigns.ts, audio.ts, wiki.ts, profile.ts. All campaign actions verify `ownerId` matches session user
- **Route groups**: `(auth)` for sign-in, `(dashboard)` for protected pages. Main campaign view is `/campaigns/[campaignId]` which renders `WikiPageLayout`
- **Prisma**: Uses Prisma Accelerate (pooled connection). Build script runs `prisma generate --no-engine` since Vercel caches node_modules

### Environment Variables

AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET, AUTH_SECRET, AUTH_URL, GEMINI_API_KEY, BLOB_READ_WRITE_TOKEN, POSTGRES_PRISMA_URL, POSTGRES_URL_NON_POOLING

Set via `vercel env add` — use `printf` not `echo` to avoid trailing newlines corrupting values.
