# next steps

working list of features and tasks to implement next. move items to `prdparkinglot.md` to defer, or delete when shipped.

---

## ship sprint 5 (host-controlled reveal views)

- [ ] run migration: `add_reveal_view_state.sql`
- [ ] manual test: host switches views, participant sees changes in realtime
- [ ] test edge cases: single-round result, anonymous mode ballots, ties

## reveal polish

- [ ] countdown to reveal (3...2...1) before first view appears
- [ ] shareable result card image export (OG image or canvas-based screenshot)

## moderation + safety

- [ ] host remove player — API endpoint + UI button in lobby (db field `removed` already exists)
- [ ] host remove option — API endpoint + UI in lobby before ranking starts
- [ ] profanity filter for display names and option text (basic blocklist)

## ranking UX

- [ ] timer for ranking phase (host sets duration, countdown visible to all)
- [ ] max ranks setting (host limits how many options players can rank)
- [ ] drag sounds / haptics on mobile
- [ ] random fun name generator for players who don't want to pick a name

## post-round

- [ ] "felt fair?" quick pulse (1-question emoji scale after reveal)
- [ ] "run it again" flow improvements (carry over participants?)

## analytics

- [ ] event instrumentation: round_created, player_joined, ballot_submitted, round_closed, results_revealed
- [ ] quality metrics dashboard: completion rate, time to converge, rounds distribution, tie-break frequency
