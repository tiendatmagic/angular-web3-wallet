import {
  Component,
  OnInit,
  signal,
  computed,
  inject,
  Optional,
  Inject,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '@shared/components/icon/icon.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { BadgeComponent } from '@shared/components/badge/badge.component';
import { TranslatePipe } from '@shared/pipes/translate.pipe';
import { MODAL_DATA, ModalRef } from '@core/services/modal-ref';
import { TranslationService } from '@core/services/translation.service';
import { ToastService } from '@core/services/toast.service';
import { getExplorerTxUrl, getExplorerName, POPULAR_CHAINS } from '@core/utils/blockchain.utils';
import { TxSuccessModalData } from './tx-success-modal.types';

@Component({
  selector: 'app-tx-success-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IconComponent, ButtonComponent, BadgeComponent, TranslatePipe],
  templateUrl: './tx-success-modal.component.html'
})
export class TxSuccessModalComponent implements OnInit {
  public readonly translationService = inject(TranslationService);
  private readonly toastService = inject(ToastService);

  public readonly txHash = signal<string>('');
  public readonly amount = signal<string>('');
  public readonly symbol = signal<string>('ETH');
  public readonly toAddress = signal<string>('');
  public readonly chainId = signal<string | number | null>(null);
  public readonly networkName = signal<string>('');
  public readonly customTitle = signal<string | null>(null);
  public readonly customSubtitle = signal<string | null>(null);
  public readonly customConfirmText = signal<string | null>(null);
  public readonly isCopied = signal<boolean>(false);

  public readonly explorerUrl = computed(() =>
    getExplorerTxUrl(this.chainId(), this.txHash())
  );

  public readonly explorerName = computed(() =>
    getExplorerName(this.chainId())
  );

  constructor(
    @Optional() @Inject(MODAL_DATA) private modalData: TxSuccessModalData,
    @Optional() private modalRef: ModalRef<void>
  ) {}

  ngOnInit(): void {
    const data = this.modalData || {};
    this.txHash.set(data.txHash || '');
    this.amount.set(data.amount || '');
    this.symbol.set(data.symbol || 'ETH');
    this.toAddress.set(data.toAddress || '');
    this.chainId.set(data.chainId ?? null);

    let netName = data.networkName;
    if (!netName && data.chainId) {
      const match = POPULAR_CHAINS.find(c => c.chainId === String(data.chainId));
      netName = match ? match.name : undefined;
    }
    this.networkName.set(netName || this.translationService.t('showcase.unknown_network'));

    if (data.title) this.customTitle.set(data.title);
    if (data.subtitle) this.customSubtitle.set(data.subtitle);
    if (data.confirmText) this.customConfirmText.set(data.confirmText);
  }

  public copyTxHash(): void {
    const hash = this.txHash();
    if (!hash) return;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(hash).then(() => {
        this.isCopied.set(true);
        setTimeout(() => this.isCopied.set(false), 2000);
      });
    } else {
      this.isCopied.set(true);
      setTimeout(() => this.isCopied.set(false), 2000);
    }
  }

  public close(): void {
    if (this.modalRef) {
      this.modalRef.close();
    }
  }
}
