-- Migration: add bot_count to round settings
-- The settings column is JSONB. This adds a new key within it.
-- Existing keys are preserved.

-- Backfill existing rounds with bot_count default
UPDATE rounds
SET settings = settings || '{"bot_count": 0}'::jsonb
WHERE NOT (settings ? 'bot_count');

-- Update the column default to include bot_count
ALTER TABLE rounds
ALTER COLUMN settings
SET DEFAULT '{"allowTies": false, "anonymousResults": false, "host_as_participant": false, "show_processing": false, "bot_count": 0}'::jsonb;
