# antigravity rules & integrity - darketype portfolio

> **📂 context**: this project pairs a polished portfolio (`bmccall17.github.io`) with a raw, "underbelly" lab (`darketype`).
> **📄 manifesto**: see `devnotes/portfolio+darketype.md`.

## 1. the core philosophy: "two public selves"

1.  **the portfolio** (root): agile, clean, polished.
2.  **the darketype** (`/darketype`): messy, glitchy, revealing, "failure resume".
3.  **the leak**: binary code and "glitches" must bleed from one to the other.
4.  **the phase 0/1 strategy**: always **think** (phase 0) before you **act** (phase 1). binary code: 0=off (planning), 1=on (execution).

## 2. style & vibe (chaos & revolution)

we are revolting against the grammar police.
- **lowercase everything** unless its a **Bold Statement** or a Proper Noun.
- **no emdashes** allowed.
- **celebrate the mess**: typo? leave it. glitch? feature it.
- **coding conventions** (variables, functions) remain strict for functionality, but comments can be messy.

## 3. cardinal technical rules

### html-first, nerd-core
- **structure**: semantic html is the backbone.
- **styling**: vanilla css. no frameworks unless explicitly justified.
- **vibe**: "monochrome," "terminal," "raw."
- **data**: starts as static files (markdown/html). prepared for future php/sqlite migration, but purely static for now.

### the "mess" loop
- **entries**: must be quick to publish (5-12 mins).
- **format**: raw thoughts first, distillation second.
- **schema**: validated by `darketype/entries/TEMPLATE.md`.

### privacy & trust
- **PostHog**: "Telemetry: ON" must be visible.
- **transparency**: we tell users we are tracking them for "science and curiosity."

### deployment & testing
- **manual deploy**: agent stages changes (creates files); user handles git commit/push to github. agent *never* runs `git push` without explicit override.
- **production first**: default testing happens on the live production server (after user push). local server is secondary.

### security & secrets
- **no secrets in code**: never hardcode api keys, tokens, or passwords.
- **pre-api protocol**: before adding any features requiring keys, we must **stop** and configure `.gitignore` and environment variables properly (a dedicated phase 0 task).
- **confidentiality**: until `.gitignore` is active, assume *everything* is public.

## 4. the complexity protocol (test first)
for complex tasks, we follow a red-green-refactor loop:
1.  **definition of done**: define what "done" looks like via a test case (automated script or specific manual verification steps) *before* building.
2.  **the red state**: the test *must fail* initially. if it passes before you build, the test is wrong.
3.  **planning connection**: phase 0 now includes "writing the failing test" for complex features.

## 5. integrity checks (run before /ship)

### 4.1 design integrity
- [ ] does `darketype` feel distinct from the main portfolio?
- [ ] are the "leaks" (glitches) present but not overwhelming the content?
- [ ] is the "Telemetry: ON" indicator visible?

### 4.2 content integrity
- [ ] do new entries follow the schema?
  - Title, Date, Status, Body.
- [ ] is the "Manifesto" (`darketype/index.html`) intact and guiding the design?
- [ ] is the writing style **rebellious enough**? (lowercase, no emdashes)

### 4.3 technical integrity
- [ ] no broken links between "Portfolio" and "Darketype".
- [ ] css files are organized (`/css/style.css` vs `darketype/css/style.css`).

## 5. operating levels

- **level 1 (observer)**: planning, reviewing.
- **level 2 (contained / sandbox)**: writing content, tweaking css.
  - *rule*: small iterations (glitch adjustments, copy edits) do not require a task entry or `/ship` cycle.
  - *protocol*: act fast, break small things. only ship when the session ends or a feature is complete.
- **level 3 (lead)**: structural changes, workflow updates.
