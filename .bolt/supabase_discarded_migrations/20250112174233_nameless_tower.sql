/*
  # Fix Escrow System Tables and Policies

  1. Changes
    - Recreate escrow_wallets table with proper structure
    - Add proper indexes for performance
    - Set up comprehensive RLS policies
    - Add function to auto-expire wallets

  2. Security
    - Enable RLS on all tables
    - Set up proper access control
    - Ensure data integrity
*/

-- Drop existing tables if they exist
DROP TABLE IF EXISTS escrow_transactions;
DROP TABLE IF EXISTS escrow_wallets;

-- Create escrow_wallets table
CREATE TABLE escrow_wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id text UNIQUE NOT NULL,
  public_key text NOT NULL,
  encrypted_private_key text NOT NULL,
  encryption_key text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'expired')),
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Create escrow_transactions table
CREATE TABLE escrow_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id text NOT NULL,
  signature text UNIQUE NOT NULL,
  winner_address text NOT NULL,
  total_amount bigint NOT NULL,
  winner_amount bigint NOT NULL,
  house_amount bigint NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at timestamptz DEFAULT now(),
  FOREIGN KEY (game_id) REFERENCES escrow_wallets(game_id)
);

-- Create indexes
CREATE INDEX idx_escrow_wallets_status ON escrow_wallets(status);
CREATE INDEX idx_escrow_wallets_game_id ON escrow_wallets(game_id);
CREATE INDEX idx_escrow_transactions_game_id ON escrow_transactions(game_id);

-- Enable RLS
ALTER TABLE escrow_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_transactions ENABLE ROW LEVEL SECURITY;

-- Function to update expired wallets
CREATE OR REPLACE FUNCTION update_expired_wallets()
RETURNS trigger AS $$
BEGIN
  UPDATE escrow_wallets
  SET status = 'expired'
  WHERE status = 'active' AND expires_at < now();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-expire wallets
CREATE TRIGGER check_expired_wallets
  AFTER INSERT OR UPDATE ON escrow_wallets
  EXECUTE FUNCTION update_expired_wallets();

-- Policies for escrow_wallets
CREATE POLICY "Public can read active escrow wallets"
  ON escrow_wallets
  FOR SELECT
  TO public
  USING (status = 'active' AND expires_at > now());

CREATE POLICY "Authenticated users can manage escrow wallets"
  ON escrow_wallets
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for escrow_transactions
CREATE POLICY "Public can read completed transactions"
  ON escrow_transactions
  FOR SELECT
  TO public
  USING (status = 'completed');

CREATE POLICY "Authenticated users can manage transactions"
  ON escrow_transactions
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);