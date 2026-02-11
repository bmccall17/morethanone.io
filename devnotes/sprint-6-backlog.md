# sprint 6: polish + safety

## moderation

- [x] Add an API route at `src/app/api/rounds/[roundId]/participants/[participantId]/remove/route.ts` that accepts POST requests to mark a participant as removed. Set the existing `removed` boolean column to `true` on the `participants` table. Require `X-Host-Token` authentication (same pattern as `src/app/api/rounds/[roundId]/start/route.ts`). Return 200 on success. The removed participant's rankings should be excluded from processing (check that `converge.ts` already filters these, or add filtering).

- [x] Add a "Remove" button next to each player in the `PlayerList` component at `src/components/PlayerList.tsx` (visible only to hosts). When clicked, call the remove participant API route. After removal, the player should disappear from the list via the existing realtime subscription. Only show the remove button during `setup` and `ranking` status.

- [x] Add an API route at `src/app/api/rounds/[roundId]/options/remove/route.ts` that accepts POST with `{ option: string }` to remove an option from the round's `options` jsonb array. Require `X-Host-Token` authentication. Only allow removal during `setup` status. Update the `options` column on the `rounds` table. Return the updated options list.

- [x] Add a "Remove" button (small X icon) next to each option in the host lobby view at `src/app/host/[roundId]/lobby/page.tsx`. When clicked, call the remove option API route. Only show during `setup` status. After removal, re-fetch or realtime-update the options list.

- [x] Add a basic profanity filter utility at `src/lib/profanity.ts`. Export a `containsProfanity(text: string): boolean` function and a `cleanText(text: string): string` function that replaces profane words with asterisks. Use a hardcoded blocklist of common profane words (no external dependency). Apply the filter in the join API route (`src/app/api/rounds/join/route.ts`) for display names, and in the create round API route (`src/app/api/rounds/route.ts`) for option text. Return a 400 error with a user-friendly message if profanity is detected.

## ranking UX

- [x] Add a `timer_minutes` field to the round settings object in `src/types/database.ts`. Add a "Set timer" input to the host create page at `src/app/host/create/page.tsx` — a numeric input for minutes (optional, default: no timer). Store it in the round's settings jsonb when creating. On the ranking page (`src/app/round/[roundId]/rank/page.tsx`) and host lobby (`src/app/host/[roundId]/lobby/page.tsx`), show a countdown timer when `timer_minutes` is set. Calculate deadline from when ranking started (the `ranking_started_at` timestamp or round `updated_at`). When the timer expires, auto-close ranking by calling the close API route (host-side) or show "time's up" (participant-side). Host can still close early.

- [ ] Add a `max_ranks` field to the round settings object in `src/types/database.ts`. Add a "Max ranks" numeric input to the host create page at `src/app/host/create/page.tsx` (default: rank all). Store it in settings jsonb. Enforce it in the `DraggableRankList` component at `src/components/DraggableRankList.tsx` — when the player has ranked `max_ranks` items, disable dragging additional items into the ranked zone and show a message like "You can rank up to N options." Also enforce server-side in `src/app/api/rounds/[roundId]/rankings/route.ts` — reject rankings that exceed `max_ranks`.

- [ ] Create a fun name generator utility at `src/lib/fun-names.ts`. Export a `generateFunName(): string` function that combines a random adjective + animal (e.g., "Brave Otter", "Swift Penguin", "Chill Falcon"). Use hardcoded arrays of ~30 adjectives and ~30 animals. In the join page at `src/app/join/page.tsx`, add a small "Random name" button next to the display name input. When clicked, populate the input with a generated fun name. The player can still edit it before joining.

## reveal polish

- [ ] Add a countdown overlay to the reveal flow. When the host clicks "Reveal results" (in the close/reveal API flow), before showing the actual results, display a fullscreen "3... 2... 1..." countdown animation on both the host reveal page (`src/app/host/[roundId]/reveal/page.tsx`) and participant reveal page (`src/app/round/[roundId]/reveal/page.tsx`). Use CSS animations with large centered numbers that scale up and fade. After the countdown completes (~3 seconds), transition to the existing reveal animation. Add a state variable `countdownComplete` to gate the reveal content.

## sprint 5 cleanup

- [ ] Test and fix edge cases in the reveal views: (1) single-round result where the winner has majority on first count — verify the animation view, selection grid, and results table all handle a 1-round result gracefully; (2) anonymous mode — verify the selection grid doesn't leak player names when anonymous mode is on; (3) ties — verify the tie-break info displays correctly in all three reveal views. Fix any issues found. Test files are in `src/app/host/[roundId]/reveal/` and `src/app/round/[roundId]/reveal/`.
