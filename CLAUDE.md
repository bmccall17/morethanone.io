CLAUDE.md
for morethanone.io

## Workspace Access Expectations

Claude is expected to read and write freely within this repository, including:

- .agent/*
- .claude/*
- .git/*
- .next/*
- .ralphy/*
- devnotes/*
- node_modules/*
- public/*
- src/*
- supabase/*
- ../ralphy
- SHIP_LOG.md
- README.md
- INVESTIGATION.md

These accesses are intentional and part of normal sprint workflows.

## Documentation Hygiene

After every `/ship`, devnotes/ must reflect reality. No drift.

- every `/ship` must reconcile planning docs with actual shipped work
- shipped items must be removed from `prdnextsteps.md`
- completed sprint backlog tasks must be marked `[x]`
- PRD sprint roadmap must reflect shipped state
- `/ship` must never silently modify planning docs — always report what changed
- Supabase schema must be checked against `supabase/schema.sql` before shipping (the "Round not found" bug was caused by a missing column migration)
