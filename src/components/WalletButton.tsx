import { FC } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export const WalletButton: FC = () => {
  const { publicKey } = useWallet();

  return (
    <div className="absolute top-4 right-4">
      <WalletMultiButton 
        className="!bg-red-600 hover:!bg-red-500 font-creepster !h-auto !px-6 !py-3"
        style={{
          fontSize: '1.125rem',
          lineHeight: '1.5',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}
      >
        {publicKey ? 'Connected' : 'Connect Wallet'}
      </WalletMultiButton>
    </div>
  );
};