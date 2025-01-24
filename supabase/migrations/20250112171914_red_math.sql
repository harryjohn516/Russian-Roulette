-- Create deposits table
CREATE TABLE IF NOT EXISTS deposits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signature text UNIQUE NOT NULL,
  amount bigint NOT NULL,
  from_address text NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'confirmed', 'failed')),
  created_at timestamptz DEFAULT now(),
  confirmed_at timestamptz
);

-- Enable RLS
ALTER TABLE deposits ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view their own deposits
CREATE POLICY "Users can view their own deposits"
  ON deposits
  FOR SELECT
  TO authenticated
  USING (from_address = auth.jwt() ->> 'wallet_address');

-- Allow system to create and update deposits
CREATE POLICY "System can manage deposits"
  ON deposits
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);