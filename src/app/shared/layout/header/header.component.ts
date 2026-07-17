import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StateService } from '@core/services/state.service';

import { IconComponent } from '@shared/components/icon/icon.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { LogoComponent } from '@shared/components/logo/logo.component';
import { ThemeSwitcherComponent } from '@shared/components/theme-switcher/theme-switcher.component';
import { TxSpeedSelectorComponent } from '@shared/components/tx-speed-selector/tx-speed-selector.component';
import { ShortAddressPipe } from '@shared/pipes/short-address.pipe';
import { POPULAR_CHAINS } from '@core/utils/blockchain.utils';

@Component({
  selector: 'app-header',
  imports: [
    CommonModule,
    IconComponent,
    ButtonComponent,
    RouterModule,
    FormsModule,
    LogoComponent,
    ThemeSwitcherComponent,
    TxSpeedSelectorComponent,
    ShortAddressPipe,
  ],
  templateUrl: './header.component.html',
  host: {
    '(document:click)': 'clickOut()'
  },
  styles: [
    `
      :host {
        display: contents;
      }
    `,
  ]
})
export class HeaderComponent {
  public stateService = inject(StateService);
  public showDropdown = signal(false);
  public showNetworkDropdown = signal(false);

  public toggleDropdown(event: Event) {
    event.stopPropagation();
    this.showDropdown.update((prev) => !prev);
    this.showNetworkDropdown.set(false);
  }

  public toggleNetworkDropdown(event: Event) {
    event.stopPropagation();
    this.showNetworkDropdown.update((prev) => !prev);
    this.showDropdown.set(false);
  }

  public copyAddress(event: Event) {
    event.stopPropagation();
    const address = this.stateService.address();
    if (address) {
      navigator.clipboard.writeText(address);
      this.stateService.showToast('Đã sao chép địa chỉ ví vào bộ nhớ tạm!', 'success');
      this.showDropdown.set(false);
    }
  }

  public viewOnExplorer(event: Event) {
    event.stopPropagation();
    const address = this.stateService.address();
    const chainId = this.stateService.chainId();
    if (!address) return;

    const activeChain = POPULAR_CHAINS.find((c) => Number(c.chainId) === Number(chainId));
    const explorerUrl = activeChain ? activeChain.explorerUrl : 'https://etherscan.io';
    window.open(`${explorerUrl}/address/${address}`, '_blank');
    this.showDropdown.set(false);
  }

  public async disconnectWallet(event: Event) {
    event.stopPropagation();
    await this.stateService.disconnectWallet();
    this.showDropdown.set(false);
  }
  public clickOut() {
    this.showDropdown.set(false);
    this.showNetworkDropdown.set(false);
  }

  public openAccountModal(event: Event) {
    event.stopPropagation();
    this.showDropdown.set(false);
    setTimeout(async () => {
      await this.stateService.openAccountModal();
    }, 100);
  }

  public switchNetwork(event: Event, chainId: number) {
    event.stopPropagation();
    this.showNetworkDropdown.set(false);
    setTimeout(async () => {
      await this.stateService.switchNetwork(chainId);
    }, 100);
  }
}
