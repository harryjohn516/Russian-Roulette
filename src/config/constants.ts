import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export const HOUSE_FEE_PERCENTAGE = 0.1; // 10%
export const MIN_STAKE_AMOUNT = LAMPORTS_PER_SOL * 0.001; // 0.001 SOL
export const REQUIRED_CONFIRMATIONS = 6;
export const ESCROW_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
export const HOUSE_WALLET_ADDRESS = 'CrPpooZ9uJRHVf3o4mpwc3JVYpDsMNNdHPvLVQXZ2mHY';