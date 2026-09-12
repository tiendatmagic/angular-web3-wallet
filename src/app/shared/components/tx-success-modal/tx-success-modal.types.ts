export interface TxSuccessModalData {
  txHash: string;
  amount?: string;
  symbol?: string;
  toAddress?: string;
  chainId?: string | number | null;
  networkName?: string;
  title?: string;
  subtitle?: string;
  confirmText?: string;
}
