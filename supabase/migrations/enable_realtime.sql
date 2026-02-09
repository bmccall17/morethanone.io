-- Enable Supabase Realtime for game tables
-- This must be run against the Supabase project (via SQL Editor or migration tool)
-- Required for: live player joins, ranking submissions, and round status changes

ALTER PUBLICATION supabase_realtime ADD TABLE rounds, participants, rankings;
