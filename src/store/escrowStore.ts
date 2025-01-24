import { create } from 'zustand';
import { EscrowStats } from '../escrow/types';

interface EscrowStore {
  escrowStats: EscrowStats;
  updateStats: (stats: EscrowStats) => void;
}

const initialStats: EscrowStats = {
  totalGames: 0,
  totalVolume: 0,
  totalFees: 0,
  currentBalance: 0
};

export const useEscrowStore = create<EscrowStore>((set) => ({
  escrowStats: initialStats,
  updateStats: (stats) => set({ escrowStats: stats })
}));