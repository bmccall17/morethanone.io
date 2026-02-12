ALTER TABLE rounds ADD COLUMN IF NOT EXISTS is_private boolean NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_rounds_is_private ON rounds (is_private);
