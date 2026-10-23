export interface TxSuccessModalData {
  txHash: string;
  amount?: string;
  symbol?: string;
  toAddress?: string | null;
  chainId?: string | number | null;
  networkName?: string;
  title?: string;
  subtitle?: string;
  confirmText?: string;
}
