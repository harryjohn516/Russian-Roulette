/*
  # Fix escrow wallet RLS policies

  1. Changes
    - Update RLS policies for escrow_wallets table
    - Add more permissive read access
    - Allow wallet creation for authenticated users
    - Add proper status handling

  2. Security
    - Maintain RLS protection while allowing necessary operations
    - Ensure public read access is properly scoped
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Public read access for active escrow wallets" ON escrow_wallets;
DROP POLICY IF EXISTS "Only authenticated users can create escrow wallets" ON escrow_wallets;

-- Create new policies for escrow_wallets
CREATE POLICY "Anyone can read active escrow wallets"
  ON escrow_wallets
  FOR SELECT
  TO anon
  USING (status = 'active' AND expires_at > now());

CREATE POLICY "Authenticated users can read all escrow wallets"
  ON escrow_wallets
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create and update escrow wallets"
  ON escrow_wallets
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Update existing wallets to active status if needed
UPDATE escrow_wallets
SET status = 'active'
WHERE status IS NULL;