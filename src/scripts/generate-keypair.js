import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

// Generate a new keypair
const keypair = Keypair.generate();

// Get the public key (address)
const publicKey = keypair.publicKey.toString();

// Get the private key in base58 format
const privateKey = bs58.encode(keypair.secretKey);

console.log('\nNew Solana Admin Wallet Generated:');
console.log('============================');
console.log('Public Key (address):', publicKey);
console.log('Private Key (base58):', privateKey);
console.log('\nIMPORTANT:');
console.log('1. Save both keys somewhere secure');
console.log('2. Use these values in your .env file:');
console.log(`   VITE_ESCROW_PUBLIC_KEY="${publicKey}"`);
console.log('3. Never share your private key');
console.log('============================\n');