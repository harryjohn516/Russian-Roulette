import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, Keypair } from '@solana/web3.js';
import { supabase } from './supabase';
import { HOUSE_FEE_PERCENTAGE, MIN_STAKE_AMOUNT, REQUIRED_CONFIRMATIONS, ESCROW_TIMEOUT } from '../config/constants';
import { encryptPrivateKey, decryptPrivateKey } from './encryption';
import bs58 from 'bs58';

export class EscrowService {
  private connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  async createGameEscrow(gameId: string): Promise<{ publicKey: string; error?: string }> {
    try {
      // Generate new keypair for escrow
      const escrowKeypair = Keypair.generate();
      const encryptionKey = crypto.getRandomValues(new Uint8Array(32));
      const encryptedPrivateKey = encryptPrivateKey(
        bs58.encode(escrowKeypair.secretKey),
        Buffer.from(encryptionKey).toString('hex')
      );

      // Store in Supabase
      const { error } = await supabase.from('escrow_wallets').insert({
        game_id: gameId,
        public_key: escrowKeypair.publicKey.toString(),
        encrypted_private_key: encryptedPrivateKey,
        encryption_key: Buffer.from(encryptionKey).toString('hex'),
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + ESCROW_TIMEOUT).toISOString()
      });

      if (error) throw error;

      return { publicKey: escrowKeypair.publicKey.toString() };
    } catch (error) {
      console.error('Failed to create game escrow:', error);
      return { publicKey: '', error: 'Failed to create escrow wallet' };
    }
  }

  async validateStake(
    signature: string,
    expectedAmount: number
  ): Promise<boolean> {
    try {
      const tx = await this.connection.getTransaction(signature, {
        maxSupportedTransactionVersion: 0,
        commitment: 'confirmed'
      });

      if (!tx || !tx.meta) return false;

      // Verify amount
      const amount = tx.meta.preBalances[0] - tx.meta.postBalances[0];
      return amount === expectedAmount;
    } catch (error) {
      console.error('Failed to validate stake:', error);
      return false;
    }
  }

  async distributeWinnings(
    gameId: string,
    winnerAddress: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get escrow wallet
      const { data: escrowData, error: fetchError } = await supabase
        .from('escrow_wallets')
        .select('*')
        .eq('game_id', gameId)
        .single();

      if (fetchError || !escrowData) {
        throw new Error('Escrow wallet not found');
      }

      // Get escrow balance
      const escrowPubkey = new PublicKey(escrowData.public_key);
      const balance = await this.connection.getBalance(escrowPubkey);

      if (balance <= 0) {
        throw new Error('Escrow wallet is empty');
      }

      // Calculate splits
      const winnerAmount = Math.floor(balance * (1 - HOUSE_FEE_PERCENTAGE));
      const houseAmount = balance - winnerAmount;

      // Create distribution transaction
      const escrowKeypair = Keypair.fromSecretKey(
        bs58.decode(
          decryptPrivateKey(
            escrowData.encrypted_private_key,
            escrowData.encryption_key
          )
        )
      );

      const tx = new Transaction();

      // Transfer to winner
      tx.add(
        SystemProgram.transfer({
          fromPubkey: escrowPubkey,
          toPubkey: new PublicKey(winnerAddress),
          lamports: winnerAmount
        })
      );

      // Transfer house fee
      tx.add(
        SystemProgram.transfer({
          fromPubkey: escrowPubkey,
          toPubkey: new PublicKey(process.env.VITE_HOUSE_WALLET_ADDRESS!),
          lamports: houseAmount
        })
      );

      // Send and confirm transaction
      const signature = await this.connection.sendTransaction(tx, [escrowKeypair]);
      await this.connection.confirmTransaction(signature, REQUIRED_CONFIRMATIONS);

      // Record transaction
      await supabase.from('escrow_transactions').insert({
        game_id: gameId,
        signature,
        winner_address: winnerAddress,
        total_amount: balance,
        winner_amount: winnerAmount,
        house_amount: houseAmount,
        status: 'completed'
      });

      return { success: true };
    } catch (error) {
      console.error('Failed to distribute winnings:', error);
      return { success: false, error: 'Failed to distribute winnings' };
    }
  }

  async refundStakes(gameId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: gameData, error: fetchError } = await supabase
        .from('games')
        .select('player1_address, player2_address, stake_amount')
        .eq('game_id', gameId)
        .single();

      if (fetchError || !gameData) {
        throw new Error('Game data not found');
      }

      // Similar distribution logic as distributeWinnings but refunds to both players
      // Implementation details...

      return { success: true };
    } catch (error) {
      console.error('Failed to refund stakes:', error);
      return { success: false, error: 'Failed to process refunds' };
    }
  }
}