import { create } from 'zustand';
import { MIN_STAKE_AMOUNT, HOUSE_FEE_PERCENTAGE } from '../config/constants';

interface GameState {
  players: string[];
  stakes: number;
  isGameStarted: boolean;
  winner: string | null;
  gameId: string | null;
  stakeAmount: number;
  escrowAddress: string;
  setStakeAmount: (amount: number) => void;
  addPlayer: (walletAddress: string) => void;
  removePlayer: (walletAddress: string) => void;
  setWinner: (address: string) => void;
  resetGame: () => void;
  setGameId: (id: string) => void;
  setEscrowAddress: (address: string) => void;
}

export const useGameStore = create<GameState>((set) => ({
  players: [],
  stakes: 0,
  isGameStarted: false,
  winner: null,
  gameId: null,
  stakeAmount: MIN_STAKE_AMOUNT,
  escrowAddress: '',
  
  setStakeAmount: (amount) =>
    set(() => ({
      stakeAmount: Math.max(MIN_STAKE_AMOUNT, amount)
    })),
    
  addPlayer: (walletAddress) => 
    set((state) => ({
      players: [...state.players, walletAddress],
      stakes: state.stakes + state.stakeAmount,
      isGameStarted: state.players.length === 1
    })),
    
  removePlayer: (walletAddress) =>
    set((state) => ({
      players: state.players.filter(p => p !== walletAddress),
      stakes: Math.max(0, state.stakes - state.stakeAmount)
    })),
    
  setWinner: (address) =>
    set(() => ({
      winner: address,
      isGameStarted: false
    })),
    
  setGameId: (id) =>
    set(() => ({
      gameId: id
    })),

  setEscrowAddress: (address) =>
    set(() => ({
      escrowAddress: address
    })),
    
  resetGame: () =>
    set(() => ({
      players: [],
      stakes: 0,
      isGameStarted: false,
      winner: null,
      gameId: null,
      stakeAmount: MIN_STAKE_AMOUNT
    }))
}));