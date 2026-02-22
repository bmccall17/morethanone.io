-- Add content_types column to rcv_world_examples
-- Supports multi-tagging: example, resource, news

ALTER TABLE rcv_world_examples
  ADD COLUMN IF NOT EXISTS content_types jsonb NOT NULL DEFAULT '["example"]'::jsonb;

UPDATE rcv_world_examples
  SET content_types = '["example"]'::jsonb
  WHERE content_types IS NULL OR content_types = '[]'::jsonb;

ALTER TABLE rcv_world_examples
  ADD CONSTRAINT content_types_not_empty CHECK (jsonb_array_length(content_types) > 0);
