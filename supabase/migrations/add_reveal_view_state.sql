-- Migration: add reveal_view_state column to rounds
-- Stores the host-controlled view state during reveal phase, broadcast via Supabase Realtime

ALTER TABLE rounds
ADD COLUMN IF NOT EXISTS reveal_view_state jsonb NOT NULL DEFAULT '{"view":"animation","animationRound":1}'::jsonb;
