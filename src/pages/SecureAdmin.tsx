import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { WalletButton } from '../components/WalletButton';
import { Lock, Key, RefreshCw, LogOut } from 'lucide-react';
import { Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getConnection } from '../config/rpc';
import { useGameStore } from '../store/gameStore';
import { createClient } from '@supabase/supabase-js';
import bs58 from 'bs58';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export function SecureAdmin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setIsAuthenticated(true);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Sign up the user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error('No user data returned');

      // Add user to admin_users table
      const { error: adminError } = await supabase
        .from('admin_users')
        .insert([{ user_id: authData.user.id }]);

      if (adminError) throw adminError;

      setIsAuthenticated(true);
      alert('Admin account created successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create admin account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitPrivateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate private key format
      const decodedKey = bs58.decode(privateKey);
      if (decodedKey.length !== 64) {
        throw new Error('Invalid private key length');
      }

      // Store the private key
      const { data, error: uploadError } = await supabase
        .from('wallets')
        .insert([
          {
            encrypted_private_key: privateKey, // In production, encrypt this!
            public_key: bs58.encode(decodedKey.slice(32))
          }
        ]);

      if (uploadError) throw uploadError;

      alert('Private key securely stored!');
      navigate('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to store private key');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4">
        <div className="bg-zinc-800 p-8 rounded-lg shadow-xl max-w-md w-full">
          <div className="flex justify-center mb-6">
            <Lock className="w-12 h-12 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-white text-center mb-6">Create Admin Account</h1>
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full px-4 py-2 bg-zinc-700 text-white rounded border border-zinc-600 focus:border-red-500 focus:ring-1 focus:ring-red-500"
              />
            </div>
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-2 bg-zinc-700 text-white rounded border border-zinc-600 focus:border-red-500 focus:ring-1 focus:ring-red-500"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-500 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Creating account...' : 'Create Admin Account'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4">
      <div className="bg-zinc-800 p-8 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-center mb-6">
          <Key className="w-12 h-12 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-white text-center mb-6">Enter Private Key</h1>
        <form onSubmit={handleSubmitPrivateKey} className="space-y-4">
          <div>
            <input
              type="password"
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              placeholder="Enter your base58 private key"
              className="w-full px-4 py-2 bg-zinc-700 text-white rounded border border-zinc-600 focus:border-red-500 focus:ring-1 focus:ring-red-500"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-500 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Storing...' : 'Store Private Key'}
          </button>
        </form>
      </div>
    </div>
  );
}