# v0.0.1 release — what ships now (archived)

*moved from prd.md on feb 10, 2026 — this section is historical. see SHIP_LOG.md and devnotes/releases/ for release details.*

### release summary

v0.0.1 is the functional foundation. the full host-to-player loop works end to end: create a round, share a code, rank options, reveal the group's choice. no accounts, no realtime, no animations. this is the "ship today" prototype from the PRD, done properly.

### what's in v0.0.1

**host flow — complete**

* create round with prompt, description, options list (add/remove/reorder)
* settings toggles: allow ties, anonymous mode
* 6-character join code + QR code generation
* live lobby with player list (or count-only in anonymous mode)
* submission progress bar during ranking phase
* start ranking / close ranking / reveal result controls
* "run it again" button that pre-populates prompt + options for a new round

**player flow — complete**

* join via code (with ?code=X prefill from QR/link)
* enter display name
* drag-and-drop ranking with @dnd-kit (mobile + desktop)
* "lock in my ranking" submit
* waiting screen with spinner, auto-redirects on reveal
* result view: winner card, elimination table, summary text

**processing engine — complete**

* instant-runoff convergence algorithm (pure functions, zero side effects)
* 3-tier tie-breaking: next-preference strength → total mentions → seeded SHA-256 coinflip
* deterministic: same seed always produces same result
* plain-language 2-3 sentence summary generator
* 14 unit tests passing (majority wins, multi-round, exhausted ballots, all tie-break tiers)

**data layer — complete**

* supabase postgres: rounds, participants, rankings, results tables
* 11 API route handlers covering full lifecycle
* host identity via UUID token in localStorage + X-Host-Token header
* participant identity via localStorage

**infrastructure — complete**

* next.js 16 (app router), typescript, tailwind css v4
* supabase browser + server clients
* jest + ts-jest for testing
* builds clean, deploys to vercel

### what was deferred from v0.0.1 (status)

**now shipped:**

* ~~realtime updates~~ → shipped in sprint 2
* ~~reveal animation~~ → shipped in sprint 2
* ~~shareable result URL~~ → shipped in sprint 3 (URL-based, not image export)

**still outstanding — see devnotes/prdnextsteps.md:**

* shareable result card image export (OG image or canvas-based)
* countdown to reveal (3…2…1)
* drag sounds and haptics
* host remove option (UI/API)
* host remove player (db field exists, no UI/API)
* profanity filter for names/options
* random fun name generator for players
* timer for ranking phase
* max ranks setting (UI toggle, db field, enforcement)
* analytics events and instrumentation
* "felt fair" post-round pulse question

### architecture decisions

* **no accounts** — host identity via UUID token in localStorage, verified server-side
* **no RLS** — access control at API route layer via host token verification
* **supabase realtime** — postgres_changes subscriptions for status, participants, rankings, processing, reveal view state
* **options as jsonb** — string array on rounds table, immutable once ranking starts
* **rankings as jsonb** — ordered string array per participant, readable and simple
* **engine is pure** — takes rankings in, returns result out, fully testable, no db dependency
* **reveal state via db column** — host writes reveal_view_state to rounds table, participants receive via realtime subscription

### v0.0.1 acceptance criteria status

* [x] host can create a round with 2+ options and share a join code
* [x] players can join on mobile, rank options, submit, and see confirmation
* [x] host can close ranking and reveal a deterministic single group choice
* [x] results view shows round-by-round explanation and is understandable
* [x] tie-breaks are handled transparently and consistently (3-tier system)
* [x] session can be replayed with pre-populated prompt/options ("run it again")
* [x] copy rules followed: no "vote", "election", "candidate" in UI text
* [x] anonymous mode hides player names in lobby (shows count only)

### file structure (v0.0.1)

```
src/
  app/
    page.tsx                           # home
    globals.css
    layout.tsx
    host/create/page.tsx               # host create
    host/[roundId]/lobby/page.tsx      # host lobby
    host/[roundId]/reveal/page.tsx     # host reveal
    join/page.tsx                      # player join
    round/[roundId]/rank/page.tsx      # player rank
    round/[roundId]/waiting/page.tsx   # player waiting
    round/[roundId]/reveal/page.tsx    # player reveal
    api/rounds/route.ts                # POST create round
    api/rounds/lookup/route.ts         # GET find by code
    api/rounds/join/route.ts           # POST join round
    api/rounds/[roundId]/route.ts      # GET round details
    api/rounds/[roundId]/participants/ # GET list players
    api/rounds/[roundId]/start/        # POST start ranking
    api/rounds/[roundId]/rankings/     # POST submit, GET count
    api/rounds/[roundId]/close/        # POST close ranking
    api/rounds/[roundId]/reveal/       # POST run engine
    api/rounds/[roundId]/result/       # GET result
  components/
    ui/Button.tsx, Input.tsx, Toggle.tsx, Card.tsx, Badge.tsx
    OptionEditor.tsx
    DraggableRankList.tsx
    JoinCodeDisplay.tsx
    PlayerList.tsx
    SubmissionCounter.tsx
    WinnerCard.tsx
    EliminationTable.tsx
    ResultSummary.tsx
  lib/
    supabase/client.ts, server.ts
    engine/converge.ts, tiebreak.ts, summarize.ts, types.ts
    engine/__tests__/converge.test.ts
    host-token.ts
  types/
    database.ts, round.ts
supabase/
  schema.sql                           # run in supabase SQL editor
```
