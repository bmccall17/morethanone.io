# sprint 7: analytics, sounds, metrics, run it again

## analytics instrumentation

- [x] Add `events` table to Supabase schema (id, event_name, round_id, properties, created_at) with indexes on event_name, round_id, created_at
- [x] Create `src/lib/analytics.ts` — server-side `trackEvent()` fire-and-forget insert to events table
- [x] Create `src/lib/analytics-client.ts` — client-side `trackClientEvent()` POST to `/api/events`
- [x] Create `src/app/api/events/route.ts` — thin POST handler for client events
- [x] Install `@vercel/analytics`, add `<Analytics />` to root layout
- [x] Instrument 6 events: round_created, player_joined, ballot_submitted, round_closed, results_revealed, replay_created

## drag sounds / haptics

- [x] Create `src/lib/sounds.ts` — Web Audio API synthesized tones (playPickUp, playDrop, playReorder) + navigator.vibrate() wrapper
- [x] Modify `DraggableRankList.tsx` — add onDragStart, onDragOver (debounced), onDragEnd sound handlers

## quality metrics dashboard

- [x] Create `src/app/api/admin/metrics/route.ts` — GET with Bearer auth against METRICS_SECRET env var
- [x] Create `src/components/metrics/StatCard.tsx` — big number stat card
- [x] Create `src/components/metrics/BarChart.tsx` — horizontal bar chart with Tailwind
- [x] Create `src/app/admin/metrics/page.tsx` — dashboard with token form, stat cards, bar charts, recent rounds table
- [x] Metrics: total rounds, completed rounds, participants, ballots, completion rate buckets, convergence distribution, tie-break %, avg time to converge, recent 20 rounds table

## "run it again" improvements

- [x] Add `previous_round_id` and `next_round_id` columns to rounds table (schema + migration)
- [x] Add columns to Round interface in `src/types/database.ts`
- [x] Create `src/app/api/rounds/replay/route.ts` — POST creates new round copying settings, links rounds
- [x] Create `src/components/ReplayNotification.tsx` — "The host started a new round!" banner
- [x] Extend `src/lib/realtime.ts` — add `onNextRound` callback to RoundCallbacks
- [x] Update host reveal page — replace URL-param approach with replay API, save new host token
- [x] Update participant reveal page — subscribe to onNextRound, show ReplayNotification
- [x] Update participant waiting page — same replay detection
- [x] Update join page — accept `name` search param for pre-fill
- [x] Update round GET API — include previous_round_id and next_round_id in response
- [x] Fix host token read — use getHostToken() instead of wrong localStorage key

## bonus

- [x] Add poll templates to host create page (Games You Love, Best Movie, Team Lunch)
- [x] Improve bot RNG — time-seeded LCG per bot for better ranking variation
- [x] Add migration files: `add_events_table.sql`, `add_round_replay_columns.sql`
