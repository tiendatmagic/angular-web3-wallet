import { Component, Input, signal, inject, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '@core/services/state.service';
import { TranslationService } from '@core/services/translation.service';
import { IconComponent } from '@shared/components/icon/icon.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { ShortAddressPipe } from '@shared/pipes/short-address.pipe';
import { TranslatePipe } from '@shared/pipes/translate.pipe';
import { POPULAR_CHAINS } from '@core/utils/blockchain.utils';

@Component({
  selector: 'app-account-dropdown',
  standalone: true,
  imports: [CommonModule, IconComponent, ButtonComponent, ShortAddressPipe, TranslatePipe],
  templateUrl: './account-dropdown.component.html',
  host: { 'class': 'block' },
})
export class AccountDropdownComponent {
  @Input() avatarUrl?: string;
  @Input() statusBadge?: string;

  public stateService = inject(StateService);
  public translationService = inject(TranslationService);
  private elementRef = inject(ElementRef);

  public isOpen = signal(false);

  public toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.isOpen.update((prev) => !prev);
  }

  public connectWallet(): void {
    this.stateService.connectWallet();
  }

  public copyAddress(event: Event): void {
    event.stopPropagation();
    const address = this.stateService.address();
    if (address) {
      navigator.clipboard.writeText(address);
      this.stateService.showToast(this.translationService.t('header.copied_address_toast'), 'success');
      this.isOpen.set(false);
    }
  }

  public openAccountModal(event: Event): void {
    event.stopPropagation();
    this.isOpen.set(false);
    setTimeout(async () => {
      await this.stateService.openAccountModal();
    }, 100);
  }

  public viewOnExplorer(event: Event): void {
    event.stopPropagation();
    const address = this.stateService.address();
    const chainId = this.stateService.chainId();
    if (!address) return;

    const activeChain = POPULAR_CHAINS.find((c) => Number(c.chainId) === Number(chainId));
    const explorerUrl = activeChain ? activeChain.explorerUrl : 'https://etherscan.io';
    window.open(`${explorerUrl}/address/${address}`, '_blank');
    this.isOpen.set(false);
  }

  public async disconnectWallet(event: Event): Promise<void> {
    event.stopPropagation();
    await this.stateService.disconnectWallet();
    this.isOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  public onDocumentClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }
}

