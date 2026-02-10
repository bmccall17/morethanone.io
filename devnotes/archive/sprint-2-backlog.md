# sprint 2: realtime + delight

## realtime infrastructure

- [x] Create a Supabase Realtime helper at `src/lib/realtime.ts` that exports a `subscribeToRound(roundId, callbacks)` function. It should subscribe to the `rounds` table filtered by `id=roundId` and call `onStatusChange(status)` when the row's `status` column changes. Return an unsubscribe function. Use the existing browser Supabase client from `src/lib/supabase/client.ts`.

- [x] Create a Supabase Realtime subscription helper for participants at `src/lib/realtime.ts` (add to existing file). Export `subscribeToParticipants(roundId, callbacks)` that listens for INSERT events on the `participants` table filtered by `round_id=roundId`. Call `onPlayerJoined(participant)` for each new row. Return an unsubscribe function.

- [x] Create a Supabase Realtime subscription helper for rankings at `src/lib/realtime.ts` (add to existing file). Export `subscribeToRankings(roundId, callbacks)` that listens for INSERT and UPDATE events on the `rankings` table filtered by `round_id=roundId`. Call `onRankingSubmitted(ranking)` for each event. Return an unsubscribe function.

## host lobby — replace polling with realtime

- [x] Refactor `/host/[roundId]/lobby/page.tsx` to replace the 3-second polling interval for participants with the `subscribeToParticipants()` realtime subscription. Remove the `setInterval` for participant fetching. Keep the initial fetch on mount but use realtime for subsequent updates. Clean up the subscription on unmount.

- [x] Refactor `/host/[roundId]/lobby/page.tsx` to replace the 3-second polling interval for ranking count with the `subscribeToRankings()` realtime subscription. Instead of polling the rankings count endpoint, increment the local count each time `onRankingSubmitted` fires. Keep the initial count fetch on mount.

- [x] Refactor `/host/[roundId]/lobby/page.tsx` to use `subscribeToRound()` for round status changes instead of polling. When status changes to 'revealed', auto-redirect to the reveal page. Remove any remaining `setInterval` calls.

## player pages — replace polling with realtime

- [x] Refactor `/round/[roundId]/rank/page.tsx` to replace the 3-second status polling with `subscribeToRound()`. When the round status changes from 'setup' to 'ranking', show the ranking form. Clean up subscription on unmount. Remove the `setInterval`.

- [x] Refactor `/round/[roundId]/waiting/page.tsx` to replace the 3-second status polling with `subscribeToRound()`. When status changes to 'revealed', redirect to the player reveal page. Remove the `setInterval`.

## reveal animation

- [x] Create a `RevealAnimation` component at `src/components/RevealAnimation.tsx`. It receives the full result payload (ConvergeResult type from `src/lib/engine/types.ts`). It should animate through each elimination round sequentially: show a bar chart of current tallies, highlight the eliminated option, animate vote transfers to remaining options, then advance to the next round. Use CSS transitions/animations (Tailwind + inline styles). End by highlighting the winner. Include a "Skip" button that jumps to the final state.

- [x] Integrate `RevealAnimation` into the host reveal page at `/host/[roundId]/reveal/page.tsx`. Show the animation first, then after it completes (or is skipped), show the existing static results (WinnerCard, EliminationTable, ResultSummary). Add a state variable `animationComplete` to toggle between animation and static views.

- [x] Integrate `RevealAnimation` into the player reveal page at `/round/[roundId]/reveal/page.tsx` with the same animation-then-static-results flow as the host reveal page.

## shareable result card

- [x] Create a `ResultCard` component at `src/components/ResultCard.tsx` that renders a visually styled card (fixed 1200x630 dimensions for social sharing) showing: the round prompt, the winner, total participants, number of rounds to converge, and the "more than one" branding. Style it with a dark background and the indigo accent color. Give it a `ref` prop so it can be captured.

- [x] Add a "Share result" button to both reveal pages (`/host/[roundId]/reveal/page.tsx` and `/round/[roundId]/reveal/page.tsx`). When clicked, use `html2canvas` (add as dependency) to capture the `ResultCard` component as a PNG image and trigger a browser download. Place the button next to the existing "Run it again" / navigation buttons.

## supabase realtime setup

- [x] Enable Supabase Realtime for the `rounds`, `participants`, and `rankings` tables. Create a migration file at `supabase/migrations/enable_realtime.sql` that runs `ALTER PUBLICATION supabase_realtime ADD TABLE rounds, participants, rankings;`. Add a note in the file header that this must be run against the Supabase project.
