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

## lets start building: build plan + first sprint backlog

### architecture (simple, fast to ship)

* frontend: next.js (app router), tailwind
* backend: supabase (postgres + realtime) or a small node server with websockets (either works, supabase is faster to ship)
* realtime: supabase realtime channels (round state, participant list, submission count, reveal payload)
* hosting: vercel (or similar)

### sprint 1 (foundation)

1. data schema + api endpoints

* create round
* join round
* submit ranking
* close round
* compute result payload

2. core UI (no delight yet)

* home, host create, lobby, player rank, reveal (static)

3. processing engine (deterministic)

* implement rounds-based convergence algorithm + tie-break rules
* return a “result story” json payload the UI can animate

### sprint 2 (real-time + delight)

* realtime updates in lobby (joiners, submitted count)
* realtime switch: “ranking started” and “reveal now”
* reveal animation using the result payload
* shareable result card image

### sprint 3 (polish + safety)

* moderation tools (remove participant/option)
* profanity filter
* post-round pulse question
* basic analytics events

---

## a concrete “result payload” shape (so the UI can animate it)

```json
{
  "winner": "tacos",
  "majority_threshold": 11,
  "total_active": 20,
  "rounds": [
    {
      "round_index": 1,
      "counts": { "tacos": 7, "thai": 6, "pizza": 4, "bbq": 3 },
      "eliminated": "bbq",
      "transfers": [
        { "from": "bbq", "to": "tacos", "count": 1 },
        { "from": "bbq", "to": "thai", "count": 2 }
      ]
    },
    {
      "round_index": 2,
      "counts": { "tacos": 8, "thai": 8, "pizza": 4 },
      "eliminated": "pizza",
      "transfers": [
        { "from": "pizza", "to": "tacos", "count": 2 },
        { "from": "pizza", "to": "thai", "count": 2 }
      ]
    },
    {
      "round_index": 3,
      "counts": { "tacos": 10, "thai": 10 },
      "eliminated": null,
      "transfers": [],
      "tie_break": {
        "type": "seeded_coinflip",
        "seed": "round_abc123",
        "winner": "tacos"
      }
    }
  ],
  "summary": [
    "support concentrated around tacos and thai as people’s top two preferences.",
    "when bbq and pizza dropped out, their support flowed mostly into those two, creating a head-to-head finish."
  ]
}
```

---

## if you want a “ship today” minimal prototype

* no accounts
* no realtime, just refresh polling
* host presses “compute” and shares a results link
* still teaches the experience of ranking more than one option and seeing convergence

---

if you tell me what stack you want for v1 (supabase realtime vs custom websocket server), i’ll turn this into an implementation-ready spec: endpoints, table definitions, security rules, and a page-by-page component breakdown so your dev can start cutting code immediately.
