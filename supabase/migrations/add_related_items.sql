-- Add related_items cross-reference column to content tables
ALTER TABLE rcv_world_examples
  ADD COLUMN IF NOT EXISTS related_items jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE faqs
  ADD COLUMN IF NOT EXISTS related_items jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE templates
  ADD COLUMN IF NOT EXISTS related_items jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE content_sections
  ADD COLUMN IF NOT EXISTS related_items jsonb NOT NULL DEFAULT '[]'::jsonb;
