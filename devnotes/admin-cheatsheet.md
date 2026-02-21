# Admin Interface Cheatsheet

## Secrets & Environment Variables

### Local (already set)
`METRICS_SECRET` is in `.env.local`

### Vercel (must set)
Go to Vercel Dashboard > Settings > Environment Variables and add:

| Variable | Value | Notes |
|----------|-------|-------|
| `CRON_SECRET` | *(auto-set by Vercel)* | Vercel creates this automatically when crons are detected in `vercel.json`. No action needed. |

If `CRON_SECRET` doesn't appear automatically after deploy, add it manually with any strong random value.

---

## Logging In

1. Go to any `/admin/*` page
2. Enter the `METRICS_SECRET` value as the token
3. Session persists in browser tab (sessionStorage)
4. `/admin/metrics` has its own auth prompt (legacy) — same token

---

## Admin Pages

| Page | URL | What it does |
|------|-----|-------------|
| Metrics | `/admin/metrics` | Round stats, completion rates, convergence |
| Content | `/admin/content` | Edit "How This Works" sections (replaces README parsing) |
| Templates | `/admin/templates` | Manage poll templates shown on create page |
| FAQs | `/admin/faqs` | CRUD FAQ entries, toggle published/draft |
| Playtest | `/admin/playtest` | Log questions from playtests, promote to FAQ |
| RCV World | `/admin/rcv-world` | Track RCV examples worldwide, search/filter |
| Keepalive | `/admin/keepalive` | See ping history, manual "Ping Now" button |

---

## Public Pages (no auth needed)

| Page | URL | Fed by |
|------|-----|--------|
| FAQ | `/faq` | Published FAQs from DB |
| RCV World | `/rcv-world` | Published RCV examples from DB |
| About section | `/demo` (AboutSection component) | DB content_sections → README.md fallback |
| Create round templates | `/host/create` | DB templates → hardcoded POLL_TEMPLATES fallback |

---

## Keepalive

**Problem it solves**: Supabase pauses free projects after 7 days of inactivity.

- **Cron**: Runs Mon + Thu at 9:00 UTC via `vercel.json`
- Auto-prunes to last 100 entries
- Green badge = pinged within 96 hours

---

## Workflows

### Playtest → FAQ Pipeline
1. During playtest, log a question on `/admin/playtest`
2. Click **"Promote to FAQ"** — creates a draft FAQ with the question
3. Go to `/admin/faqs`, fill in the answer
4. Toggle **Published** — now live on `/faq`

### Editing "How This Works" Content
1. Go to `/admin/content`
2. Edit any section's title/body/sort order
3. Toggle Published/Draft
4. Changes appear immediately on the demo page
5. If DB is empty, falls back to README.md parsing

### Managing Templates
1. Go to `/admin/templates`
2. Create/edit templates (name, prompt, options, category)
3. Toggle **Active/Inactive**
4. Active templates appear on `/host/create` on next page load
5. If DB returns nothing, hardcoded POLL_TEMPLATES are used

### RCV World Tracker
1. Go to `/admin/rcv-world` → click **New Example**
2. Fill in title, location, category, description, outcome, lessons, source URLs
3. Save as Draft, review, then set to **Published**
4. Published examples appear on `/rcv-world` public page

---

## API Reference

All admin endpoints require `Authorization: Bearer <METRICS_SECRET>`.

### Content Sections
```
GET    /api/admin/content              # list all
POST   /api/admin/content              # {slug, title, body, sort_order, is_published}
PUT    /api/admin/content/:id          # partial update
DELETE /api/admin/content/:id
```

### Templates
```
GET    /api/admin/templates            # list all
POST   /api/admin/templates            # {name, prompt, options[], category, sort_order}
PUT    /api/admin/templates/:id
DELETE /api/admin/templates/:id
GET    /api/content/templates           # PUBLIC — active templates
```

### FAQs
```
GET    /api/admin/faqs                 # list all
POST   /api/admin/faqs                 # {question, answer, category, sort_order}
PUT    /api/admin/faqs/:id
DELETE /api/admin/faqs/:id
GET    /api/content/faqs               # PUBLIC — published FAQs
```

### Playtest Feedback
```
GET    /api/admin/playtest             # list all
POST   /api/admin/playtest             # {question, context, source}
PUT    /api/admin/playtest/:id         # {is_resolved, promoted_to_faq_id}
DELETE /api/admin/playtest/:id
```

### RCV World Examples
```
GET    /api/admin/rcv-world?status=&category=&q=   # list with filters
POST   /api/admin/rcv-world            # {title, location, region, event_date, category, description, outcome, lessons, source_urls[], status}
PUT    /api/admin/rcv-world/:id
DELETE /api/admin/rcv-world/:id
GET    /api/content/rcv-world          # PUBLIC — published only
```

### Keepalive
```
GET    /api/admin/keepalive            # log history (admin auth)
GET    /api/keepalive                  # trigger ping (CRON_SECRET or METRICS_SECRET)
```

---

## Database Setup (first deploy only)

Run these in the Supabase SQL editor in order:

1. `supabase/migrations/add_admin_tables.sql` — creates 6 tables
2. `supabase/migrations/seed_content_sections.sql` — seeds 4 "How This Works" sections
3. `supabase/migrations/seed_templates.sql` — seeds 3 templates (Games, Movies, Lunch)
