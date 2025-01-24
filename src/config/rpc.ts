import { Connection, Commitment } from '@solana/web3.js';
import { heliusConnection } from '../utils/helius';

// Use Helius as primary connection
const connection = heliusConnection;

// Fallback RPC endpoints
const FALLBACK_RPC_ENDPOINTS = [
  "https://api.mainnet-beta.solana.com"
];

const commitment: Commitment = 'confirmed';
let currentEndpointIndex = 0;

const createConnection = (endpoint: string): Connection => {
  console.log('Creating connection to:', endpoint);
  return new Connection(endpoint, {
    commitment,
    confirmTransactionInitialTimeout: 60000,
  });
};

export const getConnection = async (): Promise<Connection> => {
  try {
    console.log('Testing connection...');
    await connection.getLatestBlockhash();
    console.log('Connection successful');
    return connection;
  } catch (error) {
    console.error('RPC connection failed:', error);
    return rotateEndpoint();
  }
};

export const rotateEndpoint = async (): Promise<Connection> => {
  console.log('Rotating to fallback RPC endpoint');
  currentEndpointIndex = (currentEndpointIndex + 1) % FALLBACK_RPC_ENDPOINTS.length;
  const endpoint = FALLBACK_RPC_ENDPOINTS[currentEndpointIndex];
  return createConnection(endpoint);
};