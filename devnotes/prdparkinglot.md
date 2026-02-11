# parking lot

ideas and features that are interesting but not prioritized. move items to `prdnextsteps.md` when ready to work on them.

---

## sentiment + commentary during voting

- sentiment flags on each option during ranking — "somebody has a comment about this"
- click into flag to see what others think about an option
- rank-weighted visibility: comments from voters who ranked the item highly surface first (like Reddit upvoting, but tied to rank position)
- gravitational pull visualization — show sentiment pull left/right on items

## post-round

- "felt fair?" quick pulse (1-question emoji scale after reveal)
- "run it again" flow improvements (carry over participants?)

## analytics

- event instrumentation: round_created, player_joined, ballot_submitted, round_closed, results_revealed
- quality metrics dashboard: completion rate, time to converge, rounds distribution, tie-break frequency

## pol.is — deeper integrations

- embed Pol.is conversation widget on morethanone pages (post-results, dedicated page)
- two-way sync: run a morethanone RCV round, push results back to Pol.is conversation
- auto-generate round options from Pol.is opinion clusters (AI-assisted grouping)

## political use case + curation

- curated political topic library (pre-built prompts + options for common policy debates)
- collaborator/contributor onboarding — let interested users help curate categories
- "vote on ideologies not people" mode — issue-based ranking templates

## accounts + persistence

- accounts, teams, saved libraries of prompts
- round history per host (view past rounds without needing the URL)
- player profiles (optional, lightweight)

## advanced facilitation

- "discussion then revote" structured facilitation mode
- multi-round tournaments (bracket of decisions)
- weighted participation / role-based privileges beyond host
- "live debate" mode where options can be added mid-session

## advanced outcomes

- multi-winner / proportional outcomes
- complex tie-breaking customization (host chooses strategy)
- condorcet comparison view (pairwise matchups)

## integrations

- slack bot (create rounds, share results)
- zoom app integration
- miro board embed
- calendar integration (schedule decisions)
- pol.is embed (conversation widget on morethanone pages)

## visual + delight

- optional "wisdom moment" card: "the group's broadest overlap landed here"
- round transitions that feel like "energy moving" between options
- confetti / celebration animation on winner reveal
- dark mode theme toggle
- custom branding / white-label for facilitators

## scale + infrastructure

- support 100+ participants without lag
- row-level security migration (move from API-layer auth to RLS)
- edge function processing for large rounds
- CDN-hosted shareable result images

## data + insights

- aggregated insights across multiple rounds ("your group tends to...")
- export round data as CSV
- API for third-party integrations
