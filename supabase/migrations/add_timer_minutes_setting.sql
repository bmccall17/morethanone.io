-- Migration: add timer_minutes to round settings and ranking_started_at column
-- timer_minutes is stored in the settings JSONB (null = no timer)
-- ranking_started_at tracks when the ranking phase began (for timer deadline)

-- Add ranking_started_at column
ALTER TABLE rounds ADD COLUMN IF NOT EXISTS ranking_started_at timestamptz;

-- Update the column default to include timer_minutes
ALTER TABLE rounds
ALTER COLUMN settings
SET DEFAULT '{"allowTies": false, "anonymousResults": false, "host_as_participant": false, "show_processing": false, "bot_count": 0}'::jsonb;
