/*
  # Setup deposits tracking

  1. New Tables
    - `deposits`
      - `id` (uuid, primary key)
      - `signature` (text, unique)
      - `amount` (bigint)
      - `from_address` (text)
      - `status` (text)
      - `created_at` (timestamp)
      - `confirmed_at` (timestamp)

  2. Security
    - Enable RLS on deposits table
    - Add policies for deposit tracking
*/

-- Create deposits table if it doesn't exist
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS deposits (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    signature text UNIQUE NOT NULL,
    amount bigint NOT NULL,
    from_address text NOT NULL,
    status text NOT NULL CHECK (status IN ('pending', 'confirmed', 'failed')),
    created_at timestamptz DEFAULT now(),
    confirmed_at timestamptz
  );
EXCEPTION
  WHEN duplicate_table THEN
    NULL;
END $$;

-- Enable RLS
ALTER TABLE deposits ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "Deposits are publicly viewable" ON deposits;
  DROP POLICY IF EXISTS "System can manage deposits" ON deposits;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Create new policies
CREATE POLICY "Deposits are publicly viewable"
  ON deposits
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "System can manage deposits"
  ON deposits
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);