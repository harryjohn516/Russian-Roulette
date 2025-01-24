import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletButton } from '../components/WalletButton';
import { useEscrowStore } from '../store/escrowStore';
import { ESCROW_WALLET, ADMIN_WALLET } from '../escrow/constants';
import { Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Settings, RefreshCw, AlertCircle } from 'lucide-react';
import { getConnection } from '../config/rpc';

export function AdminPage() {
  const { publicKey } = useWallet();
  const { escrowStats, updateStats } = useEscrowStore();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [connection, setConnection] = useState<Connection | null>(null);

  useEffect(() => {
    const initConnection = async () => {
      const conn = await getConnection();
      setConnection(conn);
    };
    initConnection();
  }, []);

  const refreshStats = async () => {
    if (!connection) return;
    
    setIsLoading(true);
    try {
      const balance = await connection.getBalance(ESCROW_WALLET);
      updateStats({
        ...escrowStats,
        currentBalance: balance
      });
    } catch (error) {
      console.error('Failed to fetch escrow stats:', error);
    }
    setIsLoading(false);
  };

  // Rest of the AdminPage component code remains the same
}