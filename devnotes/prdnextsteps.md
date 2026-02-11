# next steps

working list of features and tasks to implement next. move items to `prdparkinglot.md` to defer, or delete when shipped.

---

## mobile

- [ ] fix drag-and-drop ranking on mobile (broken — confirmed in playtest, host said "the mobile isn't working")
- [ ] test touch interactions across iOS Safari and Android Chrome

## pol.is integration — topic population

- [ ] research Pol.is API for fetching conversations and statement clusters
- [ ] new API route: `GET /api/polis/topics?query={topic}` — fetch popular statements/clusters from Pol.is conversations matching a topic
- [ ] new component: `PolisImporter.tsx` — UI in host create flow with a "Populate from Pol.is" button
  - host enters a topic keyword (e.g. "immigration", "ice", "housing")
  - fetches matching Pol.is statements/clusters
  - presents them as selectable options
  - selected items populate the OptionEditor
- [ ] allow mixing manual + imported options (host can edit/remove imported items)
- [ ] store Pol.is source metadata on round (optional, for traceability)

## reveal polish

- [ ] shareable result card image export (OG image or canvas-based screenshot)

## ranking UX

- [ ] drag sounds / haptics on mobile (blocked by mobile drag-and-drop fix)

## analytics

- [ ] event instrumentation: round_created, player_joined, ballot_submitted, round_closed, results_revealed
- [ ] quality metrics dashboard: completion rate, time to converge, rounds distribution, tie-break frequency

## post-round

- [ ] "felt fair?" quick pulse (1-question emoji scale after reveal)
- [ ] "run it again" flow improvements (carry over participants?)

---

*items moved to `sprint-6-backlog.md` on feb 10, 2026: countdown to reveal, host remove player, host remove option, profanity filter, timer, max ranks, fun name generator, sprint 5 edge case testing.*
