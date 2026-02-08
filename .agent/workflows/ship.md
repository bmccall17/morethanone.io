---
description: release & changelog workflow
---

# /ship - release & changelog workflow

## purpose
standardize "shipping" content or code updates by creating release notes and updating `SHIP_LOG.md`.

## usage
```
/ship [optional: version title]
```

if a title is provided, use it. otherwise, derive a descriptive title from the work done.

## workflow

### step 1: determine version
- read `devnotes/releases/` directory
- find highest existing version (e.g., v0.1.0)
- increment patch version (e.g., → v0.1.1)
- *note: since this is often content, semantic versioning is loose, but keeps us disciplined.*

### step 2: gather context
- review conversation history for implemented features/content.
- identify:
  - new "mess entries"
  - design tweaks
  - structural changes

### step 3: create release notes
create `devnotes/releases/vX.Y.Z.md` with this structure:

```markdown
# vX.Y.Z - [title]

**released:** [month day, year]

## summary
[1-2 sentence overview of what this release accomplishes]

---

## changes
- [bulleted list of what was added/changed]
- [mention specifically if new "messes" were added]

---

## files changed

### new files
- `path/to/file.ext` - brief description

### modified files
- `path/to/file.ext` - what changed

---

## verification
- [ ] checked `darketype/index.html` (manifesto)
- [ ] checked `darketype/weblog` (if touched)
```

### step 3b: auto-generate mess entry
1.  **generate moniker**: create a clever, self-referential filename (e.g., `darketype/entries/YYYY-MM-DD_messy_release_vX.Y.Z.md`).
2.  **stage content**: use `darketype/entries/TEMPLATE.md` to create a new entry about *this current sprint/task*.
3.  **wait**: do not add to `weblog/index.html` yet. just stage the file for user review/approval.
4.  **notify**: explicitly tell user: "i have drafted a new mess entry at [path] for your review."

### step 4: update SHIP_LOG.md
add entry to the **ship log** table in `SHIP_LOG.md` (insert at top of data rows):

```
| [vX.Y.Z](devnotes/releases/vX.Y.Z.md) | title with emoji | mon d, yyyy | summary |
```

**date format:** jan 01, 2026.

### step 5: confirm completion
report to user:
- **version:** vX.Y.Z
- **release notes created:** `devnotes/releases/vX.Y.Z.md`
- **SHIP_LOG.md:** updated
- **next step:** user handles git commit/push.

### step 6: cleanup
1.  **reset artifacts**:
    - clear `implementation_plan.md` (retain headers, delete specific content).
    - check `task.md`: ensure completed tasks are visually distinct (or move to an archive file if too long).
2.  **close mental tabs**: explicitly state "cleanup complete. ready for next phase."

## key files
- `SHIP_LOG.md` - project root, main changelog
- `devnotes/releases/` - release note storage
