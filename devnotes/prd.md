## product requirements document (prd): morethanone.io

### 1) product intent

more than one is a lightweight, social decision game that helps groups arrive at a single shared choice by letting every person rank multiple options in order of preference. the experience is designed to feel fair, surprising, and wise, especially in groups where “pick one” voting usually creates splits, regrets, or strategic behavior.

language rule for the product: in UI copy, help text, docs, and marketing, avoid the phrase “ranked choice voting” and avoid civic-election framing. we are teaching a group intuition: “i can express nuance by ranking more than one option, and the group can converge without me having to gamble everything on a single pick.”

### 2) target users and use cases

primary users

* facilitators running workshops, retreats, classrooms, meetups
* friends making a choice together (where to eat, what to play, what movie, what activity)
* teams deciding among several reasonable options (priorities, names, themes, topics)

common sessions

* 5–40 people, 3–12 options, 1–5 minutes to rank
* in-person with a shared screen, or remote with a link

success definition (experience)

* participants report: “i felt heard,” “the result makes sense,” “i understand why it won,” “it reduced tension”
* facilitators report: “fast to set up,” “people didn’t get stuck,” “results were explainable in 30 seconds”

### 3) core loop

1. host creates a “decision round” and enters options.
2. players join via link or short code, pick a display name, then rank options (drag and drop).
3. when host closes ranking, the system processes rankings through rounds until one option becomes the group choice.
4. results are revealed with an animated story of how the group converged.
5. group can run another round (same players, new prompt).

### 4) key principles

* expressiveness: every player can support multiple options, in order.
* low friction: join fast, rank fast, no accounts required for v1.
* explainability: show how the system arrived at the final choice in a way that feels human and transparent.
* non-strategic feel: reduce incentives to “game it” by making sincere ranking the best move.
* delight: playful visuals, satisfying reveal, social energy.

### 5) v1 scope (must have)

host flow

* create a new round: title/prompt, optional description, options list (manual entry)
* set rules: max ranks allowed (default: rank all), allow ties (v1: no), timer (optional), anonymous mode (optional)
* share: join link + short code, qr code
* start/close ranking
* reveal results
* “run it again” (duplicate round)

player flow

* join with code/link
* enter name (or random fun name)
* rank options with drag and drop
* submit and see “locked in” state
* watch reveal live (or view final if joining late)

results + explanation

* winner
* round-by-round elimination with redistribution animation
* final “group story” summary: why this outcome emerged (plain language)
* download/share result card (image) for socials

moderation and safety

* host can remove an option
* host can remove a player (basic)
* profanity filter for names/options (basic)

### 6) v1 out of scope (later)

* accounts, teams, saved libraries of prompts
* weighted participation, role-based privileges beyond host
* complex tie-breaking customization
* multi-winner outcomes, proportional outcomes
* “discussion then revote” structured facilitation modes
* integrations (slack, zoom, miro, calendar)

### 7) decision processing (the “more than one” method)

inputs

* each ballot is an ordered list of options (1st, 2nd, 3rd, …)

processing overview (single-winner, majority-seeking)

* count everyone’s current top choice.
* if any option has more than half of active ballots, it becomes the group choice.
* otherwise, remove the option with the fewest top-choice supporters.
* for ballots that had that removed option as top choice, move those ballots to their next available preference (skipping any removed options).
* repeat until one option crosses the majority threshold or only one option remains.

tie handling (v1)

* if there is a tie for fewest top-choice supporters, break ties by:

  1. compare “next-preference strength”: among tied options, eliminate the one with fewer appearances as a higher preference across all ballots (a simple look across rankings), if still tied
  2. eliminate the one with fewer total mentions on ballots, if still tied
  3. random seed tie-break with transparency (show “coin flip” animation with a seeded hash)

important: the UI should describe this as “rounds” and “passing support to next preferences” rather than election terms.

### 8) UX requirements and screens

home

* two buttons: “host a round” and “join a round”
* short explainer: “rank more than one option, watch the group converge”

host create

* prompt/title field
* options list editor (add, reorder, delete)
* toggles: anonymous, timer on/off, max ranks (all by default)
* create button generates lobby

lobby (host view)

* join code + qr
* live list of joined players (or count if anonymous)
* buttons: start ranking, close ranking (disabled until started)
* indicator: how many submitted

player ranking screen

* prompt at top
* draggable list of options
* “submit ranking” button
* microcopy: “your next choices matter. rank sincerely.”

reveal screen (shared)

* big winner card
* animated rounds panel (round 1, round 2, …)
* each round shows: counts per option, eliminated option, where that support flowed
* “why this won” auto-summary, 2–3 sentences

### 9) game feel and delight

* satisfying drag sounds and haptics (mobile)
* countdown to reveal (3…2…1) to create shared attention
* round transitions that feel like “energy moving” between options
* optional “wisdom moment” card: “the group’s broadest overlap landed here”

### 10) analytics and instrumentation (v1)

event taxonomy (examples)

* round_created (options_count, max_ranks, anonymous, timer)
* player_joined (device, latency bucket)
* ballot_submitted (ranks_count, time_to_submit)
* round_closed (players_joined, ballots_submitted)
* results_revealed (rounds_count, winner, tie_break_used boolean)
* replay_created

quality metrics

* completion rate: ballots_submitted / players_joined
* time to converge: from start ranking to reveal
* rounds to converge distribution
* tie-break frequency
* “felt fair” quick pulse (optional 1-question emoji scale after reveal)

### 11) technical requirements (v1)

platform

* responsive web app (mobile-first), works great on a projector screen and phones
* real-time updates via websockets (or a hosted realtime layer)

data model (minimal)

* round: id, prompt, options[], settings, status, created_at
* participant: id, round_id, name, joined_at, removed boolean
* ballot: id, round_id, participant_id, ranking[], submitted_at
* result: round_id, winner, rounds[], tie_break_info

performance

* support 100 participants in a room without visible lag
* reveal animation should be client-driven but consistent across viewers (deterministic result payload)

privacy

* no email required for v1
* anonymous mode hides names from everyone except host (or even host, if desired)

### 12) copy rules (important)

avoid

* “election,” “candidate,” “vote,” “ranked choice voting,” “instant runoff,” “ballot” (use sparingly)
  prefer
* “round,” “options,” “ranking,” “preferences,” “support,” “group choice,” “converge,” “pass along”

### 13) acceptance criteria (v1)

* host can create a round with at least 3 options and share a join code
* players can join on mobile, rank options, submit, and see confirmation
* host can close ranking and reveal a deterministic single group choice
* results view shows round-by-round explanation and is understandable without extra facilitation
* tie-breaks are rare but handled transparently and consistently
* session can be replayed by duplicating prompt/options in one click

---

## v0.0.1 release — what ships now

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

---

## sprint roadmap

### sprint 1 — foundation ✓ (v0.0.1 ship log)

* data schema + API endpoints (rounds, participants, rankings, results)
* core UI (all pages — create, lobby, rank, waiting, reveal)
* processing engine (deterministic, 14 unit tests, 3-tier tie-breaking)
* polling-based updates (3s intervals)

### sprint 2 — realtime + delight ✓ (v0.0.1 release)

* supabase realtime channels (replaced all polling for status, participants, rankings)
* reveal animation with auto-advancing bar chart + skip button
* dynamic threshold math
* ruled-out options shown in ranking UI

### sprint 3 — host controls + share ✓ (v0.0.2, v0.0.3)

* host-as-participant toggle (host can rank alongside players)
* show processing toggle with live round-by-round processing view
* settings API for host lobby toggles
* processing lifecycle with stepped algorithm + realtime broadcast
* share results flow (share URL, public results page)

### sprint 4 — demo mode ✓ (v0.0.4)

* standalone /demo page with 3 pre-built scenarios
* step-by-step playback with round controls
* plain-language explanations per round (DemoRunner engine)
* composite host + participant view

### sprint 5 — host-controlled reveal views (in progress)

* host can switch between 3 reveal layouts, broadcast to all participants in realtime
* animation view: stepped bar chart with round selector, play button, percentages, explanations
* selection grid: orange-circle matrix showing how each participant ranked
* full results table: all-rounds tabular view with votes, %, +/- delta columns
* new API routes: reveal-view (PATCH), ballots (GET)
* new realtime subscription: subscribeToRevealView()
* new db column: reveal_view_state (jsonb on rounds table)

### future sprints — see devnotes/prdnextsteps.md and devnotes/prdparkinglot.md

---

## result payload shape

the engine returns this structure. the reveal UI reads it directly.

```json
{
  "winner": "tacos",
  "majority_threshold": 11,
  "total_active": 20,
  "rounds": [
    {
      "round_number": 1,
      "tallies": { "tacos": 7, "thai": 6, "pizza": 4, "bbq": 3 },
      "eliminated": "bbq",
      "transfers": [
        { "from": "bbq", "to": "tacos", "count": 1 },
        { "from": "bbq", "to": "thai", "count": 2 }
      ]
    },
    {
      "round_number": 2,
      "tallies": { "tacos": 8, "thai": 8, "pizza": 4 },
      "eliminated": "pizza",
      "transfers": [
        { "from": "pizza", "to": "tacos", "count": 2 },
        { "from": "pizza", "to": "thai", "count": 2 }
      ]
    },
    {
      "round_number": 3,
      "tallies": { "tacos": 11, "thai": 9 },
      "eliminated": null,
      "transfers": []
    }
  ],
  "tie_breaks": [],
  "summary": {
    "text": "After 3 rounds of elimination, tacos emerged as the group's choice with 55% support.",
    "total_rounds": 3,
    "winner": "tacos",
    "runner_up": "thai",
    "winning_percentage": 55
  }
}
```
