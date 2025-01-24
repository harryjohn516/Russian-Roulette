import { Connection } from '@solana/web3.js';

const HELIUS_API_KEY = '141706be-0af5-478e-a47c-a59f7effc38b';
const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
const HELIUS_API_URL = 'https://api.helius.xyz';

export const heliusConnection = new Connection(HELIUS_RPC_URL);

export async function parseTransaction(signature: string) {
  const url = `${HELIUS_API_URL}/v0/transactions/?api-key=${HELIUS_API_KEY}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transactions: [signature],
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to parse transaction');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error parsing transaction:', error);
    throw error;
  }
}

export async function getTransactionHistory(address: string) {
  const url = `${HELIUS_API_URL}/v0/addresses/${address}/transactions?api-key=${HELIUS_API_KEY}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch transaction history');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    throw error;
  }
}