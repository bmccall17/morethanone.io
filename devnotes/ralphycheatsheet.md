ralphycheatsheet.md
typicall: ralphy.sh --prd PRD.md

  Ralphy needs tasks as - [ ] implementation instruction checkboxes (like sprint-2-backlog.md had). Your FRD is written as product requirements, not implementation tasks.


Recommended Ralphy Command

  The cheatsheet shows ./ralphy.sh --prd PRD.md, but since you're passing an FRD (not a PRD), and ralphy accepts any
  file path via --prd, the command is:

  ralphy.sh --prd devnotes/frd_HOSTCONTROLSupdate.md

  The --prd flag is just the document input — it doesn't care whether it's a PRD or FRD; ralphy will parse the
  requirements and decompose them into tasks either way.

  Optional flags to consider:

  - --branch-per-task — since there are 4 distinct features, this keeps each one isolated on its own branch for easier
  review
  - --no-tests — only if you want speed over safety during initial scaffolding
  - --draft-pr — if you want PRs auto-created as drafts

  A more cautious invocation would be:

  ralphy --prd devnotes/frd_HOSTCONTROLSupdate.md --branch-per-task --draft-pr

  This gives you one branch + draft PR per feature area, making it easy to review and merge incrementally. But the
  simplest call that gets the job done:

  ralphy --prd devnotes/frd_HOSTCONTROLSupdate.md

additional notes:
add normalization language:
  “At the start of a sprint, I approve broad access once, then work fast.”
When prompted, approve the highest relevant directory (repo root if possible), not individual subfolders.


Certain phrases reliably cause permission cascades:
  “scan the entire repo”
  “audit everything”
  “search all files”

Instead, you’ll get fewer prompts with scoped language:
  “only look in docs/”
  “update SHIPLOG.md only”
  “read files referenced in this PR”

desired behavior:
  Repo-level trust
  Path manifests
  Expiring but persistent grants
  A visible “granted access” panel

