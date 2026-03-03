-- Admin Policies for rcv_world_examples
-- Ensures table is governed strictly by Row Level Security

ALTER TABLE rcv_world_examples ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON rcv_world_examples;

CREATE POLICY "Enable read access for all users"
ON rcv_world_examples FOR SELECT
TO public USING (true);

-- By default, all other actions (INSERT, UPDATE, DELETE) are inherently blocked 
-- by RLS unless a policy exists. 
-- The Next.js API routes will now use the service_role key to bypass RLS securely 
-- on the server, instead of opening up anonymous writes to the internet.
