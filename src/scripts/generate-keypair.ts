import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

// Generate a new keypair
const keypair = Keypair.generate();

// Get the public key (address)
const publicKey = keypair.publicKey.toString();

// Get the private key in base58 format
const privateKey = bs58.encode(keypair.secretKey);

console.log('Public Key (address):', publicKey);
console.log('Private Key (keep this secret!):', privateKey);