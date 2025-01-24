import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletButton } from '../components/WalletButton';
import { Skull, Share2 } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { useSearchParams } from 'react-router-dom';
import { LAMPORTS_PER_SOL, Transaction, SystemProgram, PublicKey } from '@solana/web3.js';
import { MIN_STAKE_AMOUNT, HOUSE_WALLET_ADDRESS } from '../config/constants';
import { useConnection } from '@solana/wallet-adapter-react';
import { getEscrowAddress } from '../utils/supabase';

export function Game() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [searchParams] = useSearchParams();
  const { stakeAmount, setStakeAmount, escrowAddress, setEscrowAddress } = useGameStore();
  const [gameUrl, setGameUrl] = useState<string | null>(null);
  const [isStaking, setIsStaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('0.001');

  useEffect(() => {
    const fetchEscrowAddress = async () => {
      const address = await getEscrowAddress();
      if (address) {
        setEscrowAddress(address);
      }
    };
    fetchEscrowAddress();
  }, [setEscrowAddress]);

  const handleStakeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setStakeAmount(numValue * LAMPORTS_PER_SOL);
    }
  };

  const handleStake = async () => {
    if (!publicKey || !escrowAddress) return;
    
    try {
      setIsStaking(true);
      setError(null);

      if (stakeAmount < MIN_STAKE_AMOUNT) {
        throw new Error(`Minimum stake is ${MIN_STAKE_AMOUNT / LAMPORTS_PER_SOL} SOL`);
      }

      // Create stake transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(escrowAddress),
          lamports: stakeAmount,
        })
      );

      // Send transaction
      const signature = await sendTransaction(transaction, connection);
      
      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');

      // Create and set game URL after successful stake
      const gameId = Math.random().toString(36).substring(2, 15);
      const url = `${window.location.origin}?game=${gameId}&stake=${stakeAmount / LAMPORTS_PER_SOL}`;
      setGameUrl(url);
    } catch (err) {
      console.error('Stake failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to stake funds. Please try again.');
    } finally {
      setIsStaking(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1485163819542-13adeb5e0068?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-5"></div>
      
      <WalletButton />
      
      <div className="text-center mb-8 relative z-10">
        <div className="w-24 h-24 mx-auto mb-4 relative">
          <div className="absolute inset-0 bg-red-500 rounded-full opacity-20 animate-pulse"></div>
          <Skull className="w-full h-full text-red-500 relative z-10" />
        </div>
        <h1 className="text-6xl font-creepster text-red-500 mb-2 text-shadow">Russian Roulette</h1>
        <p className="text-zinc-400 text-xl font-space">A High Stakes Solana Game</p>
      </div>

      {!publicKey ? (
        <div className="bg-zinc-800/80 backdrop-blur-lg p-8 rounded-lg shadow-2xl max-w-md w-full relative z-10 border border-zinc-700">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">Connect Your Wallet</h2>
          <p className="text-zinc-400 mb-6 text-center">
            Connect your Solana wallet to start playing Russian Roulette
          </p>
        </div>
      ) : (
        <div className="bg-zinc-800/80 backdrop-blur-lg p-8 rounded-lg shadow-2xl max-w-md w-full relative z-10 border border-zinc-700">
          <h2 className="text-2xl font-bold text-white mb-4">Create Game</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Stake Amount (SOL)
              </label>
              <input
                type="text"
                pattern="[0-9]*\.?[0-9]*"
                value={inputValue}
                onChange={handleStakeChange}
                className="w-full px-4 py-3 bg-zinc-700/50 text-white rounded-lg border border-zinc-600 focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                disabled={isStaking || !!gameUrl}
              />
              <p className="text-xs text-zinc-500 mt-1">
                Minimum stake: {MIN_STAKE_AMOUNT / LAMPORTS_PER_SOL} SOL
              </p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {!gameUrl ? (
              <button 
                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-8 rounded-lg font-bold hover:from-red-500 hover:to-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                onClick={handleStake}
                disabled={isStaking || !escrowAddress}
              >
                {isStaking ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Staking...
                  </span>
                ) : (
                  'Stake & Create Game'
                )}
              </button>
            ) : (
              <div className="mt-4 p-4 bg-zinc-900/50 rounded-lg border border-zinc-700">
                <p className="text-green-400 text-sm mb-4 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Stake confirmed! Share this link with your opponent:
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-zinc-950 p-3 rounded-lg text-xs text-zinc-300 font-mono break-all">
                    {gameUrl}
                  </code>
                  <button
                    onClick={() => copyToClipboard(gameUrl)}
                    className="p-2 hover:bg-zinc-700 rounded-lg transition-colors"
                    title="Copy game link"
                  >
                    <Share2 className="w-5 h-5 text-zinc-400" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}