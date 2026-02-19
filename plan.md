# Implementation Plan: UI Cleanup & Restructuring

## Summary of Changes

### 1. Nav Cleanup
**File: `app/(dashboard)/DashboardNav.tsx`**
- Remove "Pricing" link from desktop and mobile nav
- Remove PRO badge from desktop and mobile nav
- Remove `subscriptionTier` from the `DashboardNavProps` interface

**File: `app/(dashboard)/layout.tsx`**
- Simplify: just pass `session.user` to DashboardNav again

### 2. Campaign Card Cleanup
**File: `components/campaign/CampaignCard.tsx`**
- Remove the audio count and wiki count footer
- Remove `_count` from the interface, remove unused imports
- Keep just the campaign name and description

**File: `actions/campaigns.ts`** — `getCampaigns()`
- Remove the `_count` include (no longer used)

### 3. Schema: Add dateFormat to User
**File: `prisma/schema.prisma`**
- Add `dateFormat String @default("DD.MM.YY")` to User model
- Run `npx prisma db push`

**File: `actions/profile.ts`**
- Add `dateFormat` to `getUserProfile` select
- Accept `dateFormat` in `updateUserProfile`

### 4. Profile Page Rework — Two Sections
**File: `app/(dashboard)/profile/page.tsx`** — Restructure layout:
- Top: avatar header (name, email, member since) — same as now
- Section "Settings": language + date format (new SettingsForm component)
- Section "Account": current plan display + upgrade link, change password, sign out

**New file: `app/(dashboard)/profile/SettingsForm.tsx`** — language + date format dropdowns + save
- Date format options: `DD.MM.YY`, `MM/DD/YY`, `YYYY-MM-DD`

**Modify: `app/(dashboard)/profile/SubscriptionSection.tsx`** — Simplify to a compact plan display:
- Show current plan badge (Basic/Free or Pro)
- Basic users: "Upgrade to Pro" button linking to `/pricing`
- Pro users: status + downgrade button
- Remove the detailed usage bar (keep it simple)

**Delete the old ProfileForm.tsx** — replaced by SettingsForm

### 5. Sidebar Rework — Sessions + Wiki Split
**File: `components/wiki/WikiSidebar.tsx`** — Full restructure:

**Sessions section:**
- Header: "Sessions" with a `+` button
- `+` button shows a dropdown: "New Session" | "Upload Audio"
- Session recaps listed as: `DD.MM.YY - Title` (formatted using dateFormat)
- Sorted by createdAt descending

**Wiki section:**
- Header: "Wiki" with a `+` button
- `+` button shows a dropdown: "New Page" | "Update Wiki (AI)"
- Keep existing grouped entries by type

Remove the old 3-button action bar (Upload / New Page / Update).

**Props change:** Add `dateFormat` prop.

### 6. Session Creation Modal
**New file: `components/wiki/CreateSessionModal.tsx`**
- Date field (type="date", mandatory, default: today)
- Title field (text, optional, placeholder: "Leave blank to use date as title")
- "Create" button — creates a SESSION_RECAP wiki entry

**File: `actions/wiki.ts`**
- Add `createSessionEntry(campaignId, userId, date: string, title?: string)` server action
- If title is blank, use "Session - DD.MM.YY" format
- The `date` is stored in the entry's `createdAt` field (or we can embed it in content/tags)

Actually, since createdAt is auto-set by Prisma, we should use the title to embed the date: `"DD.MM.YY - Title"` or store the session date in the content. Better approach: just store it as part of the title. The sidebar will display session entries using a parsed date from createdAt.

Simpler: Sessions are just SESSION_RECAP wiki entries. When creating manually, we set createdAt to the user-provided date. Prisma allows overriding `@default(now())`.

### 7. WikiPageLayout Updates
**File: `components/wiki/WikiPageLayout.tsx`**
- Add `dateFormat` prop, pass to WikiSidebar
- Add `onCreateSession` callback + CreateSessionModal
- Update empty state buttons to match new structure

**File: `app/(dashboard)/campaigns/[campaignId]/page.tsx`**
- Pass `dateFormat` from user profile to WikiPageLayout (need to fetch it)

### 8. i18n Translations
**File: `lib/i18n.ts`** — New keys for en + it:
- `profile.settings`, `profile.account`, `profile.dateFormat`
- `sidebar.sessions`, `sidebar.wiki`, `sidebar.newSession`, `sidebar.uploadAudio`, `sidebar.newWikiPage`, `sidebar.updateWikiAI`
- `session.createTitle`, `session.date`, `session.title`, `session.titlePlaceholder`, `session.create`

### 9. Implementation Order
1. Schema: add `dateFormat` to User, db push
2. Update `actions/profile.ts` for dateFormat
3. i18n translations (en + it)
4. Nav cleanup (DashboardNav, layout)
5. Campaign card cleanup (CampaignCard, getCampaigns, campaigns page)
6. Profile page rework (SettingsForm, restructure page, simplify subscription)
7. Sidebar rework (WikiSidebar with Sessions/Wiki split)
8. Session creation modal + action
9. Wire into WikiPageLayout + campaign page
10. Build + lint + verify
11. Commit + push
