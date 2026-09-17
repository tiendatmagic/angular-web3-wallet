export const POPULAR_CHAINS = [
  { name: 'Arbitrum One Mainnet', chainId: '42161', symbol: 'ETH', rpcUrl: 'https://arb1.arbitrum.io/rpc', explorerUrl: 'https://arbiscan.io', color: '#00a3ff' },
  { name: 'BNB Smart Chain', chainId: '56', symbol: 'BNB', rpcUrl: 'https://bsc-rpc.publicnode.com', explorerUrl: 'https://bscscan.com', color: '#F3BA2F' },
  { name: 'Ethereum Mainnet', chainId: '1', symbol: 'ETH', rpcUrl: 'https://ethereum-rpc.publicnode.com', explorerUrl: 'https://etherscan.io', color: '#627EEA' },
  { name: 'Arbitrum Sepolia', chainId: '421614', symbol: 'ETH', rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc', explorerUrl: 'https://sepolia.arbiscan.io', color: '#5ba4cf' },
  { name: 'BSC Testnet', chainId: '97', symbol: 'tBNB', rpcUrl: 'https://bsc-testnet-rpc.publicnode.com', explorerUrl: 'https://testnet.bscscan.com', color: '#e6a817' },
];

export function getExplorerApiUrl(chainId: string | number): string | null {
  const id = chainId.toString().trim();
  switch (id) {
    case '1': return 'https://api.etherscan.io/api';
    case '56': return 'https://api.bscscan.com/api';
    case '97': return 'https://api-testnet.bscscan.com/api';
    case '42161': return 'https://api.arbiscan.io/api';
    case '421614': return 'https://api-sepolia.arbiscan.io/api';
    default: return null;
  }
}

export function getBackupRpcUrls(chainId: string | number): string[] {
  const id = chainId.toString().trim();
  switch (id) {
    case '97': return [
      'https://bsc-testnet.drpc.org',
      'https://bsc-testnet.rpc.sentio.xyz',
      'https://data-seed-prebsc-1-s1.binance.org:8545'
    ];
    case '56': return [
      'https://bsc-dataseed.binance.org',
      'https://bsc-dataseed1.defibit.io',
      'https://1rpc.io/bnb'
    ];
    case '1': return [
      'https://rpc.mevblocker.io',
      'https://eth.merkle.io',
      'https://1rpc.io/eth'
    ];
    case '42161': return [
      'https://arbitrum-one-rpc.publicnode.com',
      'https://1rpc.io/arb'
    ];
    case '421614': return [
      'https://arbitrum-sepolia-rpc.publicnode.com'
    ];
    default: return [];
  }
}

export function getAllRpcUrls(chainId: string | number): string[] {
  const id = chainId.toString().trim();
  const popular = POPULAR_CHAINS.find(c => c.chainId === id);
  const primary = popular ? [popular.rpcUrl] : [];
  const backups = getBackupRpcUrls(id);
  return Array.from(new Set([...primary, ...backups]));
}

export function getExplorerTxUrl(chainId: string | number | null | undefined, txHash: string): string {
  if (!txHash) return '';
  const id = (chainId || '42161').toString().trim();
  const chain = POPULAR_CHAINS.find(c => c.chainId === id);
  const base = chain ? chain.explorerUrl : 'https://arbiscan.io';
  return base + '/tx/' + txHash;
}

export function getExplorerName(chainId: string | number | null | undefined): string {
  const id = (chainId || '42161').toString().trim();
  switch (id) {
    case '1': return 'Etherscan';
    case '56': return 'BscScan';
    case '97': return 'BscScan Testnet';
    case '42161': return 'Arbiscan';
    case '421614': return 'Arbiscan Sepolia';
    default: return 'Block Explorer';
  }
}
