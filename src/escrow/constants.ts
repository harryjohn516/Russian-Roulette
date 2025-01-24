import { PublicKey } from '@solana/web3.js';
import { ESCROW_PUBLIC_KEY, ADMIN_WALLET_ADDRESS, FEE_WALLET } from '../config/admin';

// Initialize public keys
export const ESCROW_WALLET = new PublicKey(ESCROW_PUBLIC_KEY);
export const FEE_RECIPIENT = new PublicKey(FEE_WALLET);
export const ADMIN_WALLET = ADMIN_WALLET_ADDRESS;