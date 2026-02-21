-- Admin tables for content management, templates, FAQs, playtest feedback, RCV world examples, and keepalive

-- content_sections: "How this works" CMS
create table if not exists content_sections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null default '',
  body text not null default '',
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- templates: poll templates (replaces hardcoded POLL_TEMPLATES)
create table if not exists templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  prompt text not null,
  options jsonb not null default '[]'::jsonb,
  category text not null default 'general',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- faqs: FAQ entries
create table if not exists faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null default '',
  category text not null default 'general',
  sort_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- playtest_feedback: playtest questions pipeline
create table if not exists playtest_feedback (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  context text not null default '',
  source text not null default '',
  is_resolved boolean not null default false,
  promoted_to_faq_id uuid references faqs(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- rcv_world_examples: RCV around the world tracker
create table if not exists rcv_world_examples (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  location text not null default '',
  region text not null default '',
  event_date date,
  category text not null default 'other' check (category in ('election', 'referendum', 'community', 'corporate', 'other')),
  description text not null default '',
  outcome text not null default '',
  lessons text not null default '',
  source_urls jsonb not null default '[]'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- keepalive_log: cron ping audit trail
create table if not exists keepalive_log (
  id uuid primary key default gen_random_uuid(),
  pinged_at timestamptz not null default now(),
  status text not null default 'ok'
);
