export interface DeleteConfirmItemDetail {
  label: string;
  value: string;
  isBadge?: boolean;
  badgeVariant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  isMono?: boolean;
}

export interface DeleteConfirmReasonOption {
  value: string;
  label: string;
}

export interface DeleteConfirmModalData {
  title?: string;
  subtitle?: string;
  itemName?: string;
  itemType?: string;
  itemDetails?: DeleteConfirmItemDetail[];
  warningMessage?: string;
  requireConfirmationText?: boolean;
  confirmationKeyword?: string;
  requireReason?: boolean;
  reasonOptions?: DeleteConfirmReasonOption[];
  confirmButtonText?: string;
  cancelButtonText?: string;
  requireCheckboxAgreement?: boolean;
  checkboxAgreementText?: string;
}

export interface DeleteConfirmModalResult {
  confirmed: boolean;
  reason?: string;
  customReason?: string;
  deletedAt: string;
}
