-- Add host heartbeat timestamp for presence tracking
ALTER TABLE rounds ADD COLUMN IF NOT EXISTS host_heartbeat_at timestamptz;
