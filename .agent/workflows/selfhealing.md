---
description: collaborative workflow adjustment & learning integration.
---

# /selfhealing - process improvement workflow

use this workflow when we discover a better way of working, a new rule, or a "learning" that should be permanently encoded into our behavior.

## purpose
change *how* we build, without derailing *what* we build.

## usage
```
/selfhealing [optional: topic]
```
if no topic is provided, identify the most recent process friction or epiphany.

## workflow

### step 1: identify the learning
- what just happened that was good? (e.g., "phase 0/1 strategy")
- what just happened that was bad? (e.g., "forgot the style guide")
- what pattern do we want to enforce?

### step 2: codify the change
determine where this learning should live:
- **`.agent/RULES.md`**: for philosophy, style, and cardinal rules.
- **`.agent/workflows/*.md`**: for specific operational steps.
- **`task.md`** or **`project_plan`**: for structural changes to the plan.

### step 3: apply the update
1.  **propose** the text change to the user.
2.  **update** the file(s).
3.  **verify** the change aligns with existing rules.

### step 4: confirm
report back:
> "**self-healing complete.** i have updated [filename] to include [the new rule/process]."

## example: "phase 0/1"
if we learn that "phase 0" (thinking/prepping) is essential before "phase 1" (execution), we update `orchestrator.md` or `RULES.md` to mandate a Phase 0 for every major feature.
