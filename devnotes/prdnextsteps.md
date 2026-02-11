# next steps

working list of features and tasks to implement next. move items to `prdparkinglot.md` to defer, or delete when shipped.

---

## mobile

- [x] fix drag-and-drop ranking on mobile (shipped v0.0.7 — TouchSensor + MouseSensor, touchAction: none, viewport meta)
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

- [ ] drag sounds / haptics on mobile (unblocked — mobile drag fix shipped in v0.0.7)

## analytics

- [ ] event instrumentation: round_created, player_joined, ballot_submitted, round_closed, results_revealed
- [ ] quality metrics dashboard: completion rate, time to converge, rounds distribution, tie-break frequency

## post-round

- [ ] "felt fair?" quick pulse (1-question emoji scale after reveal)
- [ ] "run it again" flow improvements (carry over participants?)

---

*sprint 6 shipped as v0.0.7 on feb 11, 2026: mobile drag-and-drop fix, host remove player/option, profanity filter, timer, max ranks, fun name generator, countdown reveal, edge case fixes.*
