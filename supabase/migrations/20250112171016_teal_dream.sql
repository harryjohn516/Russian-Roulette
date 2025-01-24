/*
  # Admin System Setup

  1. New Tables
    - `admin_users`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamp)
    - `wallets`
      - `id` (uuid, primary key)
      - `encrypted_private_key` (text)
      - `public_key` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for admin access
*/

-- Create admin_users table if it doesn't exist
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS admin_users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id),
    created_at timestamptz DEFAULT now()
  );
EXCEPTION
  WHEN duplicate_table THEN
    NULL;
END $$;

-- Enable RLS on admin_users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and create new ones
DO $$ BEGIN
  DROP POLICY IF EXISTS "Admin users are viewable by authenticated users" ON admin_users;
  DROP POLICY IF EXISTS "First user can become admin" ON admin_users;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Create new policies
CREATE POLICY "Admin users are viewable by authenticated users"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "First user can become admin"
  ON admin_users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    NOT EXISTS (SELECT 1 FROM admin_users)
  );

-- Create wallets table if it doesn't exist
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS wallets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    encrypted_private_key text NOT NULL,
    public_key text NOT NULL,
    created_at timestamptz DEFAULT now()
  );
EXCEPTION
  WHEN duplicate_table THEN
    NULL;
END $$;

-- Enable RLS on wallets
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and create new ones
DO $$ BEGIN
  DROP POLICY IF EXISTS "Only admins can access wallets" ON wallets;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Create new policy
CREATE POLICY "Only admins can access wallets"
  ON wallets
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id 
      FROM admin_users
    )
  );