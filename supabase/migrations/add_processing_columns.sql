-- Migration: add processing support columns
-- processing_data on results stores incremental round-by-round data during processing
-- current_processing_round on rounds broadcasts progress via Supabase Realtime

ALTER TABLE results
ADD COLUMN IF NOT EXISTS processing_data jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE rounds
ADD COLUMN IF NOT EXISTS current_processing_round integer NOT NULL DEFAULT 0;
