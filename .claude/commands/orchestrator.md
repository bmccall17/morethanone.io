---
description: master orchestrator for tracking project progress across all phases.
---

# project orchestrator workflow

use this workflow to check project status, plan next steps, and maintain alignment with the "darketype" vision.

## 1. status check
run this at the start of each session:
### current phase assessment
- [ ] which phase are we in? (0-2 based on `devnotes/portfolio+darketype.md`)
- [ ] what's the phase deliverable target?

- [ ] what work remains in current phase?
- [ ] **operating level check**: which level are we in? (1=observer, 2=sandbox, 3=lead)

### quick health check
```
review these files:
- devnotes/portfolio+darketype.md → the manifesto & prd
- task.md → granular progress
- SHIP_LOG.md → recent updates
```

### friction check
- **are we stuck?** (circling without code or confusing requirements?)
- **is it complex?** (requires multiple files or logic steps?)
- **if YES**: stop. initiate **complexity protocol** (see `RULES.md`).
  > "i notice this is complex. shall we define the test case first?"

### context headroom report
- **current context**: [low/medium/high/critical]
- **estimated headroom**: [x] turns remaining
- **reset recommendation**: [keep going / ship & clear]
- *note: if context is critical, we must ship pending changes to `devnotes/releases` and reset.*

## 2. progress report
when asked "what's the status?" or "where are we?":
### format
```
## project status: darketype portfolio
**current phase**: [0/1/2] - [phase name]
**operating level**: [1/2/3] - [observer/sandbox/lead]
**operating level**: [1/2/3] - [observer/sandbox/lead]
**phase progress**: [x]% complete
**context**: [low/med/high] - [reset in X turns?]


### completed this phase
- [x] item 1
- [x] item 2

### in progress
- [/] current work item

### remaining
- [ ] next items

### blockers
- [list any issues]

### next actions
1. [immediate next step]
2. [following step]
```

## 3. phase transition
when a phase is complete:
1. **verify exit criteria**
   - check against `devnotes/portfolio+darketype.md` "3-phase build plan"
   - run `/ship` to snapshot the phase completion

2. **update documentation**
   - mark phase complete in `task.md`
   - update `SHIP_LOG.md` with phase summary

3. **begin next phase (phase 0/1 strategy)**
   - **Phase 0 (Thinking)**: create the `task.md` plan, update `RULES.md` if needed, draft the strategy.
   - **Phase 1 (Acting)**: execute the code changes.
   - review next phase requirements
   - update `task.md` with new checklist

## 4. phase map
| phase | focus | status |
|-------|-------|--------|
| 0 | manifesto + skeleton | active |
| 1 | the loop (publish fast) | planned |
| 2 | signature visuals | planned |

## 5. standup format
for quick progress updates:
```
**previously**: [what was completed]
**next**: [what will be done]
**blockers**: [any issues] or "none"
```

## 6. operating level reminder
at session start, confirm operating level:
- **level 1 (observer)**: read-only, planning mode
- **level 2 (contained / sandbox)**: writing content, tweaking css (no ship cycle needed).
- **level 3 (lead)**: full autonomy
default: level 1 until explicitly elevated.
