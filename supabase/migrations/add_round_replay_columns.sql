-- Migration: add replay linking columns to rounds
-- Links rounds together for "Run it again" flow via previous/next pointers

ALTER TABLE rounds
ADD COLUMN IF NOT EXISTS previous_round_id uuid REFERENCES rounds(id) ON DELETE SET NULL;

ALTER TABLE rounds
ADD COLUMN IF NOT EXISTS next_round_id uuid REFERENCES rounds(id) ON DELETE SET NULL;
