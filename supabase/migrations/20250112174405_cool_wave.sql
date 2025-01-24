/*
  # Fix escrow wallet access policies

  1. Changes
    - Remove existing restrictive policies
    - Add new policies for public read access
    - Add service role policies for system operations
    - Add proper authenticated user policies
  
  2. Security
    - Maintains RLS protection
    - Allows public read access for active wallets
    - Enables proper system-level operations
*/

-- First, drop any existing policies
DO $$ BEGIN
  DROP POLICY IF EXISTS "Anyone can read active escrow wallets" ON escrow_wallets;
  DROP POLICY IF EXISTS "Authenticated users can read all escrow wallets" ON escrow_wallets;
  DROP POLICY IF EXISTS "Authenticated users can create and update escrow wallets" ON escrow_wallets;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create new policies
CREATE POLICY "Public can read active escrow wallets"
  ON escrow_wallets
  FOR SELECT
  TO public
  USING (
    status = 'active' 
    AND expires_at > now()
  );

CREATE POLICY "Service role has full access"
  ON escrow_wallets
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage escrow wallets"
  ON escrow_wallets
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Ensure proper defaults
ALTER TABLE escrow_wallets
  ALTER COLUMN status SET DEFAULT 'active',
  ALTER COLUMN created_at SET DEFAULT now();

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_escrow_wallets_status_expires 
  ON escrow_wallets(status, expires_at);
CREATE INDEX IF NOT EXISTS idx_escrow_wallets_game_id 
  ON escrow_wallets(game_id);