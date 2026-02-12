-- Migration: add events table for analytics instrumentation
-- Stores custom business events (round_created, player_joined, ballot_submitted, etc.)

CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name text NOT NULL,
  round_id uuid REFERENCES rounds(id) ON DELETE SET NULL,
  properties jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_events_event_name ON events (event_name);
CREATE INDEX IF NOT EXISTS idx_events_round_id ON events (round_id);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events (created_at);
