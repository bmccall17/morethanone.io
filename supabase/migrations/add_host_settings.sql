-- Migration: add host_as_participant and show_processing to round settings
-- The settings column is JSONB. These are new keys being added within it.
-- Existing keys (allowTies, anonymousResults) are preserved.

-- Backfill existing rounds with new settings defaults
UPDATE rounds
SET settings = settings || '{"host_as_participant": false, "show_processing": false}'::jsonb
WHERE NOT (settings ? 'host_as_participant')
   OR NOT (settings ? 'show_processing');

-- Update the column default to include the new keys
ALTER TABLE rounds
ALTER COLUMN settings
SET DEFAULT '{"allowTies": false, "anonymousResults": false, "host_as_participant": false, "show_processing": false}'::jsonb;
