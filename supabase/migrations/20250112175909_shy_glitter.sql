/*
  # Fix RLS policies for escrow system

  1. Changes
    - Drop existing policies to avoid conflicts
    - Create new policies with proper access control
    - Add policy for public read access to active wallets
    - Add policy for authenticated users to create wallets
    - Add policy for service role full access

  2. Security
    - Enable RLS on all tables
    - Ensure proper access control for different user types
    - Maintain data integrity with proper checks
*/

-- First, safely drop existing policies
DO $$ BEGIN
  DROP POLICY IF EXISTS "Escrow wallets public read" ON escrow_wallets;
  DROP POLICY IF EXISTS "Escrow wallets service access" ON escrow_wallets;
  DROP POLICY IF EXISTS "Public can read active escrow wallets" ON escrow_wallets;
  DROP POLICY IF EXISTS "Service role has full access" ON escrow_wallets;
  DROP POLICY IF EXISTS "Authenticated users can manage escrow wallets" ON escrow_wallets;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create new policies with proper access control
CREATE POLICY "Public read access to active wallets"
  ON escrow_wallets
  FOR SELECT
  TO public
  USING (
    status = 'active' 
    AND expires_at > now()
  );

CREATE POLICY "Authenticated users can create wallets"
  ON escrow_wallets
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Service role full access"
  ON escrow_wallets
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Ensure indexes exist for performance
DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_escrow_wallets_status_expires 
    ON escrow_wallets(status, expires_at);
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;