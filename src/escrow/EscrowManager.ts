import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { ESCROW_WALLET, ESCROW_FEE_PERCENTAGE } from './constants';
import { EscrowState, EscrowStats } from './types';

export class EscrowManager {
  private connection: Connection;
  private escrowStates: Map<string, EscrowState>;
  private stats: EscrowStats;

  constructor(connection: Connection) {
    this.connection = connection;
    this.escrowStates = new Map();
    this.stats = {
      totalGames: 0,
      totalVolume: 0,
      totalFees: 0,
      currentBalance: 0
    };
  }

  async initialize() {
    await this.updateEscrowBalance();
  }

  private async updateEscrowBalance() {
    try {
      const balance = await this.connection.getBalance(ESCROW_WALLET);
      this.stats.currentBalance = balance;
      return balance;
    } catch (error) {
      console.error('Failed to update escrow balance:', error);
      return 0;
    }
  }

  async createStakeTransaction(
    playerPubkey: PublicKey,
    gameId: string,
    stakeAmount: number
  ): Promise<Transaction> {
    // Create or update escrow state
    const state = this.escrowStates.get(gameId) || {
      gameId,
      players: [],
      totalStake: 0,
      isActive: true
    };

    if (state.players.includes(playerPubkey)) {
      throw new Error('Player already staked in this game');
    }

    state.players.push(playerPubkey);
    state.totalStake += stakeAmount;
    this.escrowStates.set(gameId, state);

    // Create stake transaction
    return new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: playerPubkey,
        toPubkey: ESCROW_WALLET,
        lamports: stakeAmount
      })
    );
  }

  async createPayoutTransaction(
    winnerPubkey: PublicKey,
    gameId: string
  ): Promise<Transaction> {
    const state = this.escrowStates.get(gameId);
    if (!state) {
      throw new Error('Game not found');
    }

    const totalPayout = Math.floor(state.totalStake * (1 - ESCROW_FEE_PERCENTAGE));
    
    // Update stats
    this.stats.totalGames++;
    this.stats.totalVolume += state.totalStake;
    this.stats.totalFees += state.totalStake - totalPayout;

    // Create payout transaction
    return new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: ESCROW_WALLET,
        toPubkey: winnerPubkey,
        lamports: totalPayout
      })
    );
  }

  getGameState(gameId: string): EscrowState | undefined {
    return this.escrowStates.get(gameId);
  }

  getStats(): EscrowStats {
    return { ...this.stats };
  }

  async verifyEscrowBalance(requiredBalance: number): Promise<boolean> {
    const balance = await this.updateEscrowBalance();
    return balance >= requiredBalance;
  }
}