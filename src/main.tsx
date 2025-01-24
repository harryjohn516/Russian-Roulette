import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import App from './App';
import './index.css';
import '@solana/wallet-adapter-react-ui/styles.css';

// Initialize connection
const network = WalletAdapterNetwork.Mainnet;
const wallets = [new PhantomWalletAdapter()];

// Create root element
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

createRoot(rootElement).render(
  <StrictMode>
    <ConnectionProvider endpoint="https://mainnet.helius-rpc.com/?api-key=141706be-0af5-478e-a47c-a59f7effc38b">
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <App />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  </StrictMode>
);