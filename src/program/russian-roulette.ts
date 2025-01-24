import {
  Keypair,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
  Transaction,
  Connection,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { Program, AnchorProvider, web3 } from '@project-serum/anchor';

export interface GameState {
  players: PublicKey[];
  stakes: number;
  bulletPosition: number;
  isActive: boolean;
  winner: PublicKey | null;
}

export class RussianRouletteProgram {
  private connection: Connection;
  private programId: PublicKey;
  private gameKeypair: Keypair;

  constructor(connection: Connection) {
    this.connection = connection;
    // This would be your deployed program ID
    this.programId = new PublicKey('YOUR_PROGRAM_ID');
    this.gameKeypair = new Keypair();
  }

  async createGame(stake: number): Promise<string> {
    const createGameIx = new TransactionInstruction({
      keys: [
        { pubkey: this.gameKeypair.publicKey, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: this.programId,
      data: Buffer.from([0, ...new BN(stake).toArray('le', 8)]),
    });

    return this.gameKeypair.publicKey.toString();
  }

  async joinGame(playerPubkey: PublicKey, stake: number): Promise<Transaction> {
    const joinGameIx = new TransactionInstruction({
      keys: [
        { pubkey: this.gameKeypair.publicKey, isSigner: false, isWritable: true },
        { pubkey: playerPubkey, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: this.programId,
      data: Buffer.from([1, ...new BN(stake).toArray('le', 8)]),
    });

    const tx = new Transaction().add(joinGameIx);
    return tx;
  }

  async pullTrigger(playerPubkey: PublicKey): Promise<Transaction> {
    const pullTriggerIx = new TransactionInstruction({
      keys: [
        { pubkey: this.gameKeypair.publicKey, isSigner: false, isWritable: true },
        { pubkey: playerPubkey, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: this.programId,
      data: Buffer.from([2]),
    });

    const tx = new Transaction().add(pullTriggerIx);
    return tx;
  }

  async getGameState(): Promise<GameState> {
    const accountInfo = await this.connection.getAccountInfo(this.gameKeypair.publicKey);
    if (!accountInfo) {
      throw new Error('Game account not found');
    }

    // Decode the account data according to your program's structure
    return this.decodeGameState(accountInfo.data);
  }

  private decodeGameState(data: Buffer): GameState {
    // Implement decoding logic based on your program's data structure
    return {
      players: [],
      stakes: 0,
      bulletPosition: 0,
      isActive: false,
      winner: null,
    };
  }
}