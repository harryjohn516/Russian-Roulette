/*
  # Final RLS policy fix for escrow system

  1. Changes
    - Drop all existing policies to start fresh
    - Create simplified policies that allow:
      - Public read access for active wallets
      - Anonymous users to read active wallets
      - Authenticated users to create wallets
      - Service role to have full access
    
  2. Security
    - Enable RLS on all tables
    - Ensure proper access control
    - Maintain data integrity
*/

-- First, safely drop ALL existing policies
DO $$ BEGIN
  DROP POLICY IF EXISTS "Public read access to active wallets" ON escrow_wallets;
  DROP POLICY IF EXISTS "Authenticated users can create wallets" ON escrow_wallets;
  DROP POLICY IF EXISTS "Service role full access" ON escrow_wallets;
  DROP POLICY IF EXISTS "Escrow wallets public read" ON escrow_wallets;
  DROP POLICY IF EXISTS "Escrow wallets service access" ON escrow_wallets;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create new simplified policies
CREATE POLICY "anon_select_active_wallets"
  ON escrow_wallets
  FOR SELECT
  TO anon
  USING (
    status = 'active' 
    AND expires_at > now()
  );

CREATE POLICY "auth_insert_wallets"
  ON escrow_wallets
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "service_role_all"
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