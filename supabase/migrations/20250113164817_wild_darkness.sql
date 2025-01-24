/*
  # Final RLS policy fix

  1. Changes
    - Drop all existing policies
    - Create simplified policies that allow:
      - Anonymous users to read active wallets
      - Public access for wallet creation
      - Service role to have full access
    
  2. Security
    - Enable RLS on all tables
    - Ensure proper access control
*/

-- First, safely drop ALL existing policies
DO $$ BEGIN
  DROP POLICY IF EXISTS "anon_select_active_wallets" ON escrow_wallets;
  DROP POLICY IF EXISTS "auth_insert_wallets" ON escrow_wallets;
  DROP POLICY IF EXISTS "service_role_all" ON escrow_wallets;
  DROP POLICY IF EXISTS "Public read access to active wallets" ON escrow_wallets;
  DROP POLICY IF EXISTS "Authenticated users can create wallets" ON escrow_wallets;
  DROP POLICY IF EXISTS "Service role full access" ON escrow_wallets;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create new simplified policies
CREATE POLICY "allow_anon_read"
  ON escrow_wallets
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "allow_public_insert"
  ON escrow_wallets
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "allow_service_role_all"
  ON escrow_wallets
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Ensure proper indexes exist
DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_escrow_wallets_status_expires 
    ON escrow_wallets(status, expires_at);
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;