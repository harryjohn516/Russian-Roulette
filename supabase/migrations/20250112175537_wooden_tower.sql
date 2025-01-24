/*
  # Setup Escrow System

  1. Tables
    - Ensures escrow_wallets and escrow_transactions tables exist
    - Adds proper constraints and defaults
  
  2. Security
    - Updates RLS policies safely
    - Adds proper indexes for performance

  3. Changes
    - Safely drops and recreates policies
    - Adds performance optimizations
*/

-- First, safely create tables if they don't exist
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS escrow_wallets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id text UNIQUE NOT NULL,
    public_key text NOT NULL,
    encrypted_private_key text NOT NULL,
    encryption_key text NOT NULL,
    created_at timestamptz DEFAULT now(),
    expires_at timestamptz NOT NULL,
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'expired'))
  );
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS escrow_transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id text NOT NULL REFERENCES escrow_wallets(game_id),
    signature text UNIQUE NOT NULL,
    winner_address text NOT NULL,
    total_amount bigint NOT NULL,
    winner_amount bigint NOT NULL,
    house_amount bigint NOT NULL,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    created_at timestamptz DEFAULT now()
  );
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- Enable RLS if not already enabled
ALTER TABLE escrow_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_transactions ENABLE ROW LEVEL SECURITY;

-- Safely drop existing policies
DO $$ BEGIN
  DROP POLICY IF EXISTS "Public can read active escrow wallets" ON escrow_wallets;
  DROP POLICY IF EXISTS "Service role has full access to escrow wallets" ON escrow_wallets;
  DROP POLICY IF EXISTS "Public can read completed transactions" ON escrow_transactions;
  DROP POLICY IF EXISTS "Service role has full access to transactions" ON escrow_transactions;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create new policies
DO $$ BEGIN
  CREATE POLICY "Escrow wallets public read"
    ON escrow_wallets
    FOR SELECT
    TO public
    USING (status = 'active' AND expires_at > now());
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Escrow wallets service access"
    ON escrow_wallets
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Transactions public read"
    ON escrow_transactions
    FOR SELECT
    TO public
    USING (status = 'completed');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Transactions service access"
    ON escrow_transactions
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add indexes if they don't exist
DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_escrow_wallets_status_expires 
    ON escrow_wallets(status, expires_at);
  CREATE INDEX IF NOT EXISTS idx_escrow_wallets_game_id 
    ON escrow_wallets(game_id);
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;