import { createClient } from '@supabase/supabase-js';
import { Keypair } from '@solana/web3.js';
import { encryptPrivateKey } from './encryption';
import bs58 from 'bs58';
import { rateLimiter } from './rateLimit';

// Make Supabase client optional
export const supabase = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
  ? createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)
  : null;

export async function getEscrowAddress(): Promise<string | null> {
  try {
    // If Supabase is not configured, generate a temporary address
    if (!supabase) {
      const keypair = Keypair.generate();
      return keypair.publicKey.toString();
    }

    // Check rate limit
    if (rateLimiter.isRateLimited('get_escrow')) {
      throw new Error('Rate limit exceeded');
    }

    // Get active escrow wallet
    const { data: wallet, error } = await supabase
      .from('escrow_wallets')
      .select('public_key')
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (wallet?.public_key) return wallet.public_key;

    // Create new wallet if none exists
    const keypair = Keypair.generate();
    const encryptionKey = crypto.getRandomValues(new Uint8Array(32));
    const encryptedPrivateKey = await encryptPrivateKey(
      bs58.encode(keypair.secretKey),
      Buffer.from(encryptionKey).toString('hex')
    );

    const { data: newWallet, error: insertError } = await supabase
      .from('escrow_wallets')
      .insert({
        game_id: `game_${Date.now()}_${bs58.encode(crypto.getRandomValues(new Uint8Array(8)))}`,
        public_key: keypair.publicKey.toString(),
        encrypted_private_key: encryptedPrivateKey,
        encryption_key: Buffer.from(encryptionKey).toString('hex'),
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString()
      })
      .select('public_key')
      .single();

    if (insertError) throw insertError;
    return newWallet.public_key;
  } catch (error) {
    console.error('Error managing escrow address:', error);
    // Return a temporary address if anything fails
    const keypair = Keypair.generate();
    return keypair.publicKey.toString();
  }
}