# Campaign Sharing & Permissions — Implementation Plan

## Overview

Add a DM/Player role system where the campaign owner (DM) can invite players by email. Players get limited access: they can view/edit only their assigned character sheet, see the party overview with stats, but cannot access the wiki, session recaps, audio files, or DM notes. Additionally, add a spell dropdown picker sourced from the D&D 5e SRD API for both DM and players when editing character spells.

---

## Phase 1: Data Model — New Prisma Models & Schema Changes

### 1.1 New `CampaignMember` model
Represents a user's membership in a campaign with a role.

```prisma
enum CampaignRole {
  DM
  PLAYER
}

enum InviteStatus {
  PENDING    // invited but hasn't signed up / accepted yet
  ACCEPTED   // active member
}

model CampaignMember {
  id          String         @id @default(cuid())
  campaignId  String
  userId      String?        // null while PENDING (user hasn't signed up yet)
  email       String         // the email used for the invite
  role        CampaignRole   @default(PLAYER)
  status      InviteStatus   @default(PENDING)
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  campaign    Campaign       @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  user        User?          @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@unique([campaignId, email])
  @@index([userId])
  @@index([campaignId])
  @@map("campaign_members")
}
```

### 1.2 Link CharacterSheet to a player
Add `assignedPlayerId` to `CharacterSheet`:

```prisma
model CharacterSheet {
  // ... existing fields ...
  assignedPlayerId String?   // The User.id of the player who owns this character

  assignedPlayer   User?     @relation("PlayerCharacterSheets", fields: [assignedPlayerId], references: [id], onDelete: SetNull)
}
```

### 1.3 Update existing models with new relations

**Campaign** — add `members CampaignMember[]`
**User** — add `memberships CampaignMember[]` and `assignedCharacterSheets CharacterSheet[]`

### 1.4 Run `npx prisma db push` after schema changes

---

## Phase 2: Authorization Helpers

### 2.1 New file: `lib/permissions.ts`

Central permission logic used by all server actions and pages:

```typescript
type CampaignAccess = {
  role: 'DM' | 'PLAYER'
  userId: string
  campaignId: string
  membership?: CampaignMember  // null for DM (owner)
}

// Returns the user's access level for a campaign, or null if no access
async function getCampaignAccess(campaignId: string, userId: string): Promise<CampaignAccess | null>

// Convenience checks
function isDM(access: CampaignAccess): boolean
function isPlayer(access: CampaignAccess): boolean

// Check if a player can access a specific character sheet
async function canAccessCharacterSheet(userId: string, characterSheetId: string): Promise<boolean>
```

**Logic:**
- If `campaign.ownerId === userId` → role is `DM`
- Else check `CampaignMember` where `campaignId + userId + status=ACCEPTED` → role from membership
- Otherwise → `null` (no access)

### 2.2 Update all existing server actions

Every action that currently checks `ownerId === userId` needs to be updated to use `getCampaignAccess()` and enforce role-based restrictions:

| Action | DM | Player |
|--------|-----|--------|
| `getCampaign` | Full access | Limited access (sees campaign name, their character) |
| `getWikiEntries` / `getWikiTree` | Full access | **Denied** (returns empty or throws) |
| `getWikiEntry` | Full access | Only if it's their assigned CHARACTER entry |
| `createWikiEntry` / `updateWikiEntry` / `deleteWikiEntry` | Full access | **Denied** |
| `getCharacterSheet` | Full access | Only their assigned sheet |
| `updateCharacterSheet` / `patchCharacterSheet` | Full access | Only their assigned sheet |
| `createCharacterSheet` | Full access | Only for their assigned CHARACTER entry |
| Audio actions | Full access | **Denied** |
| Chat actions | Full access | Access (scoped to non-wiki context) |

---

## Phase 3: Campaign Sharing — Invite Flow

### 3.1 New server actions: `actions/campaign-members.ts`

```typescript
// DM invites a player by email
async function inviteMember(campaignId: string, dmUserId: string, email: string): Promise<CampaignMember>

// List all members of a campaign (DM only)
async function getCampaignMembers(campaignId: string, userId: string): Promise<CampaignMember[]>

// Remove a member (DM only)
async function removeMember(campaignId: string, dmUserId: string, memberId: string): Promise<void>

// Assign a character sheet to a player (DM only)
async function assignCharacterToPlayer(
  characterSheetId: string,
  dmUserId: string,
  playerId: string
): Promise<CharacterSheet>

// Auto-accept: when a user signs in, check if they have pending invites matching their email
// This runs in the auth callback or on first campaign list load
async function acceptPendingInvites(userId: string, email: string): Promise<void>
```

### 3.2 Invite acceptance flow
When a user logs in (or visits `/campaigns`), call `acceptPendingInvites()` which:
1. Finds all `CampaignMember` rows where `email = user.email` and `status = PENDING`
2. Updates them to `status = ACCEPTED, userId = user.id`

This means invites work even if the player doesn't have an account yet — they sign up with Google (same email) and automatically get access.

### 3.3 Campaign list updates
`getCampaigns()` should now return:
- Campaigns the user **owns** (existing behavior)
- Campaigns the user is a **member** of (new — separate section in UI: "My Campaigns" vs "Shared With Me")

---

## Phase 4: Player-Facing UI

### 4.1 Player's campaign view — new route/component

When a player opens `/campaigns/[campaignId]`, instead of the full wiki layout, they see:

**Player Dashboard** showing:
1. **Their Character Sheet** — full interactive edit (same `CharacterSheetBoard` component), or a "Create Character" button if they don't have one assigned yet
2. **Party Overview** — a read-only panel listing all character sheets in the campaign with:
   - Character name, class, level, race
   - HP (current/max), AC, key ability scores
   - Status indicators (alive/down/etc. if we add that)
3. **No wiki sidebar, no session recaps, no audio section, no DM notes**

Implementation approach:
- In the campaign page (`app/(dashboard)/campaigns/[campaignId]/page.tsx`), check `getCampaignAccess()`:
  - If DM → render current `WikiPageLayout` (unchanged)
  - If PLAYER → render new `PlayerCampaignView` component
- The `PlayerCampaignView` component shows:
  - The party panel (all character sheets, read-only summary)
  - Their character sheet (full edit access, using existing `CharacterSheetBoard`)
  - An option to create a character if none assigned

### 4.2 Character creation for players
- If a player has no character assigned, they see a "Create Your Character" button
- This creates a new CHARACTER wiki entry + blank CharacterSheet, auto-assigns `assignedPlayerId`
- They can import from PDF (reuse existing `/api/character-sheet/process`) or fill manually

### 4.3 DM Campaign Settings — Member Management UI

Add to the existing settings page (`/campaigns/[campaignId]/settings`):

**"Players" section:**
- Input field to invite by email + "Invite" button
- List of current members with:
  - Email / name (if account exists)
  - Role badge (DM/Player)
  - Status (Pending/Active)
  - Assigned character (dropdown of existing CHARACTER entries, or "None")
  - Remove button
- DM can assign an existing character to a player from this UI

---

## Phase 5: Spell Dropdown Picker

### 5.1 Spell data source

The aidedd.org page blocks automated fetching. Instead, use the **D&D 5e SRD** data from the open-source [`5e-bits/5e-srd-api`](https://github.com/5e-bits/5e-srd-api) or the static JSON from [`vorpalhex/srd_spells`](https://github.com/vorpalhex/srd_spells).

**Approach:** Ship a static JSON file (`data/spells-5e.json`) bundled in the repo with all SRD spells (~320 spells). This avoids external API calls at runtime and keeps the app fast. The file contains:

```typescript
interface SpellData {
  name: string
  level: number          // 0 = cantrip, 1-9
  school: string         // "Evocation", "Abjuration", etc.
  casting_time: string
  range: string
  components: string     // "V, S, M (a tiny ball of bat guano)"
  duration: string
  ritual: boolean
  concentration: boolean
  classes: string[]      // ["Wizard", "Sorcerer"]
  description: string
}
```

### 5.2 Spell picker component: `components/character-sheet/SpellPicker.tsx`

A searchable dropdown/combobox for adding spells:
- Filterable by name (type-ahead search)
- Filterable by level (0-9 tabs or dropdown)
- Filterable by class (based on character's class)
- Shows spell school, level, and key info in the dropdown row
- On select: auto-fills the spell's `name`, `level`, `school`, `concentration`, `ritual`, and `description` into the existing `Spell` interface
- User can still override fields after selection (e.g., mark as prepared)
- Also allows free-text entry for homebrew spells not in the SRD list

### 5.3 Integration into CharacterSheetBoard
Replace the current plain text spell input (if any) with the SpellPicker in the spellcasting section. Both DM and players use this same component when editing character sheets.

---

## Phase 6: Route Protection & Middleware Updates

### 6.1 Update `proxy.ts` (middleware)
No changes needed — the middleware only checks authentication, not authorization. Authorization is handled in server actions and page components.

### 6.2 Page-level access checks
Each page under `/campaigns/[campaignId]/...` needs to:
1. Call `getCampaignAccess(campaignId, userId)`
2. If `null` → `notFound()` or redirect
3. If PLAYER → restrict to allowed pages (character sheet, party view)
4. If DM → full access (existing behavior)

Pages blocked for players:
- `/campaigns/[campaignId]/audio/*` → redirect to campaign home
- `/campaigns/[campaignId]/wiki/*` → redirect to campaign home (except their character entry)
- `/campaigns/[campaignId]/settings` → redirect to campaign home

---

## Implementation Order

1. **Schema changes** (Phase 1) — Prisma models, `db push`
2. **Permission helpers** (Phase 2) — `lib/permissions.ts`
3. **Invite flow backend** (Phase 3) — server actions for invites, auto-accept
4. **Update existing actions** (Phase 2.2) — swap ownership checks for role-based checks
5. **DM settings UI** (Phase 4.3) — member management in settings page
6. **Player campaign view** (Phase 4.1, 4.2) — new component, character creation flow
7. **Campaign list updates** (Phase 3.3) — show shared campaigns
8. **Spell data + picker** (Phase 5) — static JSON, SpellPicker component, integration
9. **Route protection** (Phase 6) — page-level guards

---

## Key Design Decisions

1. **No separate "invite link" system** — email-based invites are simpler and more secure. The DM types the player's Google email, and access is granted automatically on login.

2. **DM remains the owner** — the `Campaign.ownerId` field stays as-is. The DM has implicit `DM` role without needing a `CampaignMember` row. This avoids migrating existing data.

3. **Players can create their own character** — if no character is assigned, they can create one. This auto-creates a CHARACTER wiki entry (hidden from other players) and links the sheet. Alternatively, the DM can create characters and assign them.

4. **Party view is read-only** — players see other characters' stats but can only edit their own. This enables tactical coordination without exposing DM notes.

5. **Static spell data** — shipping a JSON file in the repo avoids external API dependencies and latency. The SRD covers ~320 official spells. We can expand later.

6. **Chat access for players** — players can use the AI chat, but its context is limited (no wiki/session recaps, only general D&D knowledge + their character data). This could be expanded later.
