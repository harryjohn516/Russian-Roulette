import { PublicKey } from '@solana/web3.js';

export interface EscrowState {
  gameId: string;
  players: PublicKey[];
  totalStake: number;
  isActive: boolean;
  winner?: PublicKey;
}

export interface EscrowStats {
  totalGames: number;
  totalVolume: number;
  totalFees: number;
  currentBalance: number;
}