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

**Important**: After changing `prisma/schema.prisma`, always run `npx prisma db push` to sync the remote database. The Vercel build only runs `prisma generate`, not `db push`.

## Architecture

DM Companion is a Next.js 16 App Router application for tabletop RPG game masters. Users upload session audio recordings, which are transcribed and summarized by Google Gemini AI, then automatically turned into wiki entries (characters, locations, items, etc.). CHARACTER-type wiki entries can have linked character sheets (D&D 5e style) with data imported from PDF or created manually.

### Core Flow

1. **Audio Upload** — Client-side upload to Vercel Blob (`components/audio/AudioUploader.tsx`), then DB record via `/api/audio/create-record`
2. **Processing** — `/api/audio/process` fires background pipeline: Gemini 2.5 Flash transcription → summary → entity extraction → wiki entry creation (`lib/gemini/wiki-generator.ts`)
3. **Wiki** — Auto-generated entries (SESSION_RECAP + entities) displayed in a Notion-like sidebar layout (`components/wiki/WikiPageLayout.tsx`). Users can also manually create/edit entries or trigger bulk wiki generation via "Update Wiki" button
4. **Character Sheets** — CHARACTER wiki entries can have a linked `CharacterSheet` with structured D&D data. Import from PDF (`/api/character-sheet/process` uses Gemini Flash to parse) or create blank. Rendered as interactive board (`components/character-sheet/CharacterSheetBoard.tsx`) with auto-save
5. **Chat** — Streaming AI chat (`/api/chat`) with campaign wiki context + session recap fallback. Uses Gemini 2.5 Flash (`lib/gemini/chat.ts`). Desktop: persistent side panel. Mobile: floating popup

### Key Patterns

- **Auth**: NextAuth v5 beta.30 with Google OAuth and **JWT session strategy** (not database sessions — Edge Runtime middleware can't query DB via Prisma). Config in `lib/auth.ts`, route protection in `proxy.ts`. Landing page (`/`) and sign-in page redirect to `/campaigns` if already authenticated
- **Gemini clients**: Lazy-initialized in `lib/gemini/client.ts` to avoid breaking Vercel static analysis. All three functions (`getGeminiPro`, `getGeminiFlash`, `getGeminiFlashLite`) available. Chat uses Flash, transcription uses Flash (labeled "Pro" historically)
- **Server actions**: `actions/` directory — campaigns.ts, audio.ts, wiki.ts, profile.ts, character-sheet.ts. All campaign actions verify `ownerId` matches session user
- **Route groups**: `(auth)` for sign-in (server component with auth check + client `SignInForm`), `(dashboard)` for protected pages. Main campaign view is `/campaigns/[campaignId]` which renders `WikiPageLayout`
- **Prisma**: Uses Prisma Accelerate (pooled connection). Build script runs `prisma generate --no-engine` since Vercel caches node_modules
- **i18n**: `lib/i18n.ts` with `en` and `it` locales. UI language stored in `User.uiLanguage`. Campaign content language stored in `Campaign.language`
- **React keys**: Never use mutable data (like `item.name`) in React keys for editable lists — use stable indices or IDs

### Database Models

- **User** → Account[], Session[], Campaign[], ChatMessage[]
- **Campaign** → AudioFile[], WikiEntry[], ChatMessage[], CharacterSheet[]
- **AudioFile** — status enum (UPLOADING/UPLOADED/PROCESSING/PROCESSED/FAILED)
- **WikiEntry** — type enum (SESSION_RECAP/CHARACTER/LOCATION/EVENT/ITEM/NPC/FACTION/LORE/QUEST/OTHER), self-referential hierarchy, optional CharacterSheet link
- **CharacterSheet** — JSON `data` field (structured D&D data), linked 1:1 to WikiEntry via `wikiEntryId`, optional PDF blob
- **ChatMessage** — role (user/assistant), contextUsed JSON

### Key Files

| Area | Files |
|------|-------|
| Auth | `lib/auth.ts`, `proxy.ts` (middleware), `app/(auth)/signin/` |
| Gemini AI | `lib/gemini/client.ts`, `chat.ts`, `audio-processor.ts`, `wiki-generator.ts`, `character-parser.ts` |
| Wiki | `components/wiki/WikiPageLayout.tsx`, `WikiEntryEditor.tsx`, `WikiSidebar.tsx` |
| Character Sheet | `components/character-sheet/CharacterSheetBoard.tsx` + sub-components, `types/character-sheet.ts` |
| Chat | `components/chat/ChatPanel.tsx` (desktop), `ChatPopup.tsx` (mobile), `ChatInterface.tsx` |
| Server Actions | `actions/campaigns.ts`, `audio.ts`, `wiki.ts`, `profile.ts`, `character-sheet.ts` |

### Environment Variables

AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET, AUTH_SECRET, AUTH_URL, GEMINI_API_KEY, BLOB_READ_WRITE_TOKEN, POSTGRES_PRISMA_URL, POSTGRES_URL_NON_POOLING

Set via `vercel env add` — use `printf` not `echo` to avoid trailing newlines corrupting values.
