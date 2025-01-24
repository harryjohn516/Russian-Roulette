/*
  # Escrow System Tables

  1. New Tables
    - `escrow_wallets`: Stores game escrow wallet information
      - `id` (uuid, primary key)
      - `game_id` (text, unique)
      - `public_key` (text)
      - `encrypted_private_key` (text)
      - `encryption_key` (text)
      - `created_at` (timestamptz)
      - `expires_at` (timestamptz)
      - `status` (text)

    - `escrow_transactions`: Records all escrow transactions
      - `id` (uuid, primary key)
      - `game_id` (text)
      - `signature` (text)
      - `winner_address` (text)
      - `total_amount` (bigint)
      - `winner_amount` (bigint)
      - `house_amount` (bigint)
      - `status` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create escrow_wallets table
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

-- Create escrow_transactions table
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

-- Enable RLS
ALTER TABLE escrow_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_transactions ENABLE ROW LEVEL SECURITY;

-- Policies for escrow_wallets
CREATE POLICY "Public read access for active escrow wallets"
  ON escrow_wallets
  FOR SELECT
  TO public
  USING (status = 'active');

CREATE POLICY "Only authenticated users can create escrow wallets"
  ON escrow_wallets
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policies for escrow_transactions
CREATE POLICY "Public read access for completed transactions"
  ON escrow_transactions
  FOR SELECT
  TO public
  USING (status = 'completed');

CREATE POLICY "Only authenticated users can create transactions"
  ON escrow_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);