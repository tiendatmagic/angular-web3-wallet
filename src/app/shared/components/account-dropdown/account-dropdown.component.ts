import { Component, Input, signal, inject, ElementRef, HostListener, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '@core/services/state.service';
import { TranslationService } from '@core/services/translation.service';
import { DropdownService } from '@core/services/dropdown.service';
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
  host: {
    'class': 'block',
    '(document:keydown.escape)': 'onEscape()'
  },
})
export class AccountDropdownComponent {
  @Input() avatarUrl?: string;
  @Input() statusBadge?: string;

  public stateService = inject(StateService);
  public translationService = inject(TranslationService);
  private dropdownService = inject(DropdownService);
  private elementRef = inject(ElementRef);
  public readonly instanceId = 'account_dropdown_' + Math.random().toString(36).substring(2, 9);

  public isOpen = signal(false);

  private readonly syncOpenState = effect(() => {
    const activeId = this.dropdownService.activeDropdownId();
    if (activeId !== this.instanceId && this.isOpen()) {
      this.isOpen.set(false);
    }
  });

  public toggleDropdown(event: Event): void {
    event.stopPropagation();
    const newState = !this.isOpen();
    this.isOpen.set(newState);
    if (newState) {
      this.dropdownService.open(this.instanceId);
    } else {
      this.dropdownService.close(this.instanceId);
    }
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
      this.dropdownService.close(this.instanceId);
    }
  }

  public openAccountModal(event: Event): void {
    event.stopPropagation();
    this.isOpen.set(false);
    this.dropdownService.close(this.instanceId);
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
    this.dropdownService.close(this.instanceId);
  }

  public async disconnectWallet(event: Event): Promise<void> {
    event.stopPropagation();
    await this.stateService.disconnectWallet();
    this.isOpen.set(false);
    this.dropdownService.close(this.instanceId);
  }

  @HostListener('document:click', ['$event'])
  public onDocumentClick(event: Event): void {
    if (this.isOpen() && !this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
      this.dropdownService.close(this.instanceId);
    }
  }

  public onEscape(): void {
    if (this.isOpen()) {
      this.isOpen.set(false);
      this.dropdownService.close(this.instanceId);
    }
  }
}

