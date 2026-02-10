# sprint: host controls update

## 1. host as participant toggle

- [x] Update the `Round` type in `src/types/database.ts` to add `host_as_participant: boolean` to the `settings` object (default `false`). Also add `show_processing: boolean` (default `false`) to the settings object while here since it's needed for feature 2.

- [x] Add a migration at `supabase/migrations/add_host_settings.sql` that updates existing rounds to include the new settings defaults. Add a comment noting the settings column is JSONB and these are new keys within it.

- [x] Add a "Participate in this round" toggle to the host lobby page at `src/app/host/[roundId]/lobby/page.tsx`. Place it in the host controls area before the action buttons. When toggled on, send a PATCH/POST to update the round settings with `host_as_participant: true`. Use the existing `Toggle` component from `src/components/ui/Toggle.tsx`. The toggle should only be available during `setup` status and disabled after ranking starts.

- [x] Create an API route at `src/app/api/rounds/[roundId]/settings/route.ts` that accepts PATCH requests with a JSON body to update the round's settings column. Require the `X-Host-Token` header for authentication (follow the same pattern as `src/app/api/rounds/[roundId]/start/route.ts`). Merge the incoming settings with existing settings (spread operator, not replace).

- [x] When `host_as_participant` is enabled and the host clicks "Start ranking", automatically create a participant record for the host. Modify `src/app/api/rounds/[roundId]/start/route.ts` to check the round's `host_as_participant` setting — if true, insert a participant row with `display_name: 'Host'` and `round_id`, then return the new participant ID in the response. The host lobby page should store this participant ID in localStorage (same pattern as the join flow in `src/app/join/page.tsx`).

- [x] When the host is a participant, show the ranking interface to the host after they click "Start ranking". In `src/app/host/[roundId]/lobby/page.tsx`, when status is `ranking` and the host has a participant ID in localStorage, render the `DraggableRankList` component from `src/components/DraggableRankList.tsx` inline within the lobby page (above the submission counter and close button). After the host submits their ranking, hide the ranking UI and show a "Ranking submitted" confirmation. The host should still see all host controls (submission counter, close ranking button) alongside their ranking UI.

## 2. show processing toggle (live transparency)

- [x] Add a "Show live processing to participants" toggle to the host lobby page at `src/app/host/[roundId]/lobby/page.tsx`. Place it near the "Participate" toggle. When toggled, update round settings via the settings API route created above with `show_processing: true`. This toggle should only be available during `setup` status. Use the existing `Toggle` component.

- [x] Add a new round status value `processing` to the `RoundStatus` type in `src/types/database.ts`. The flow becomes: `setup → ranking → processing → revealed`. Update the status transition in `src/app/api/rounds/[roundId]/close/route.ts` to set status to `processing` instead of `closed` when `show_processing` is enabled in the round settings. When `show_processing` is disabled, keep the existing `closed` status.

- [x] Create an API route at `src/app/api/rounds/[roundId]/process/route.ts` for stepping through the ranked-choice algorithm. When called with POST, it should: (1) run the `converge()` function from `src/lib/engine/converge.ts`, (2) store each round's data incrementally by updating a `processing_data` column on the results table (or a new `round_processing` table), and (3) broadcast each round's result via Supabase Realtime by updating the round row with a `current_processing_round` integer field. Require `X-Host-Token` authentication.

- [x] Add a realtime subscription helper `subscribeToProcessing(roundId, callbacks)` in `src/lib/realtime.ts` that listens for UPDATE events on the `rounds` table and calls `onProcessingUpdate(roundNumber)` when `current_processing_round` changes. Participants use this to know when new round data is available to fetch and display.

- [x] Create a participant processing view at `src/app/round/[roundId]/processing/page.tsx`. When `show_processing` is enabled and round status is `processing`, redirect participants here from the waiting page. This page subscribes to processing updates via `subscribeToProcessing()` and fetches each round's data as it becomes available. Display the round-by-round results using the existing `RevealAnimation` component from `src/components/RevealAnimation.tsx`, advancing one round at a time as data arrives. When processing completes (status changes to `closed`), shows "Processing complete — waiting for host to reveal..." then redirects on `revealed`. **Bug fix:** added `'closed'` status handling, initial status check on mount, and 1.5s delay between rounds in process API for realtime propagation.

- [x] Update the participant waiting page at `src/app/round/[roundId]/waiting/page.tsx` to check the round's `show_processing` setting. If enabled and status changes to `processing`, redirect to the new `/round/[roundId]/processing` page. If disabled, keep existing behavior (wait for `revealed` status then redirect to reveal page). **Bug fix:** added initial status check on mount so participants who load after status already changed still redirect correctly.

**Bug fixes applied during this sprint:**
- `supabase/migrations/fix_status_check_constraint.sql` — `rounds_status_check` constraint now allows `'processing'` and `'revealed'` statuses.
- Host lobby: added `'processing'` badge, "Run processing" button for processing state. Removed auto-trigger of process API from close handler to give participants time to navigate.
- Process API: added 1.5s delay between round iterations so realtime events propagate to participants.

## 3. share results flow

- [x] Create a shareable results page at `src/app/results/[roundId]/page.tsx`. This is a public page (no auth required) that fetches the round result via `GET /api/rounds/[roundId]/result` and displays the winner, round-by-round elimination table, and result summary using existing components (`WinnerCard`, `EliminationTable`, `ResultSummary` from `src/components/`). Include the round prompt as a heading. This page should work as a standalone link.

- [x] Add a `share_url` field to the `Result` type in `src/types/database.ts`. Generate the URL as `{origin}/results/{roundId}` and store it in the result row at computation time. Updated both `src/app/api/rounds/[roundId]/reveal/route.ts` and `src/app/api/rounds/[roundId]/process/route.ts` to save `share_url` when upserting results. Migration: `supabase/migrations/add_share_url_column.sql`.

- [x] Replace the current "Share result" PNG download button on the host reveal page at `src/app/host/[roundId]/reveal/page.tsx` with a "Share Results" clipboard copy button. Removed `html2canvas`, `ResultCard`, and hidden capture div. Shows the shareable URL as visible text with a "Share Results" / "Copied!" toggle button.

- [x] Update the participant reveal page at `src/app/round/[roundId]/reveal/page.tsx` to display the shareable results URL. Same cleanup (removed `html2canvas`, `ResultCard`, hidden div). Shows copyable link with "Share Results" / "Copied!" button at the bottom of the results view.

## 4. demo mode (deferred to separate sprint)

> **Deferred:** Demo mode is being built in a separate sprint. Sections 1-3 are complete and shipped as v0.0.3.

- [ ] Create demo scenario data at `src/lib/demo/scenarios.ts`. Export three scenario objects, each containing: `name`, `description`, `options` (string array), `ballots` (array of ranking arrays representing mock participants), and `teachableMoment` (string). Scenario 1: "Early Leader, Late Overtake" with 5 options (A-E), 15 ballots where A leads in first preferences but C wins via redistributed secondary preferences from E and B. Scenario 2: "Polarizing Favorite vs Steady Consensus" with 4 options (A-D), 12 ballots where A has most firsts but B wins via consensus. Scenario 3: "Comeback from Third" with 6 options (A-F), 18 ballots where C starts third but wins via layered preferences. Each ballot set must produce the described outcome when run through the `converge()` engine.

- [ ] Create a demo engine at `src/lib/demo/engine.ts` that wraps the existing `converge()` function from `src/lib/engine/converge.ts` for step-by-step playback. Export a `DemoRunner` class that takes a scenario, runs `converge()` to get the full result, then exposes: `totalRounds()`, `getRound(n)` (returns round data up to round n), `getExplanation(n)` (returns plain-language explanation of what happened in round n — who was eliminated, why, where votes transferred, how threshold changed). The explanations should be generated from the `ConvergeResult` round data, not hardcoded.

- [ ] Create a mock participant view component at `src/components/demo/MockParticipantCard.tsx`. It receives a participant name, their ballot (ranking array), the current round number, and the current round data. It displays: the participant's name, their ranked preferences as an ordered list, with visual indicators showing which of their preferences have been eliminated (strikethrough) and which preference is currently active (highlighted). The card should update reactively as the round number advances.

- [ ] Create the demo composite view page at `src/app/demo/page.tsx`. This page includes: (1) a scenario selector dropdown at the top to pick from the 3 predefined scenarios, (2) a host control panel on the left showing round-by-round tallies using the existing `RevealAnimation` component, (3) a grid of `MockParticipantCard` components on the right showing 6-8 mock participants from the selected scenario, (4) "Next Round" and "Previous Round" step buttons, (5) a "Show Explanations" toggle that when enabled displays the plain-language narration from `DemoRunner.getExplanation(n)` below the tally view. Start with round 0 (initial first-preference tallies) and step through to the final round.

- [ ] Add a "Demo Mode" button/link to the app's main page or host creation flow that navigates to `/demo`. Place it as a secondary action on the home page at `src/app/page.tsx` — a text link or outlined button below the main "Create a round" flow, labeled "Try Demo Mode" or "See how it works".
